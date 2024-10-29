// Elementos HTML principais
const nameList = document.getElementById('nameList');
const newNameInput = document.getElementById('newNameInput');
const addNameButton = document.getElementById('addNameButton');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const resultElement = document.getElementById('result');
const wheelCanvas = document.getElementById('wheel');
const squadNameInput = document.getElementById('squadNameInput');
const setSquadNameButton = document.getElementById('setSquadNameButton');
const squadNameDisplay = document.getElementById('squadNameDisplay');
const volumeInput = document.getElementById('volumeInput');

// Caminhos para ícones personalizados
const deleteIconPath = 'excluir icon.png'; // Caminho do ícone de lixeira
const imageIconPath = 'img icon.png';      // Caminho do ícone de imagem

// Sons para o giro e a seleção
const spinSound = new Audio('Som-Roleta.M4A');

// Ajustar volume do som
volumeInput.addEventListener('input', function () {
    const volume = volumeInput.value;
    spinSound.volume = volume;
});

// Variáveis globais
let names = JSON.parse(localStorage.getItem('wheelNames')) || []; // Lista de nomes
let removedNames = []; // Lista de nomes removidos apenas da roleta
let colors = {};       // Objeto para armazenar as cores associadas aos nomes
let images = {};       // Objeto para armazenar imagens associadas aos nomes
let rotation = 0;      // Rotação inicial da roleta
let isSpinning = false;
let spinInterval = null;
let currentSpeed = 0.3;
let outlineColor = '#333';

// Função para gerar uma cor aleatória em hexadecimal
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Função para desenhar a roleta com imagens e efeito 3D
function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const availableNames = names.filter(name => !removedNames.includes(name));
    const numSlices = availableNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    availableNames.forEach((name, i) => {
        if (!colors[name]) colors[name] = getRandomColor();
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        // Desenha a fatia com cor associada ao nome
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.fillStyle = colors[name];
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Adiciona a imagem e o nome na fatia
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "left";
        ctx.fillStyle = '#000000';
        ctx.font = "bold 16px Arial";
        if (images[name]) {
            const img = new Image();
            img.src = images[name];
            ctx.drawImage(img, 120, -15, 30, 30); // Posiciona a imagem
        }
        ctx.fillText(name, 150, 10);
        ctx.restore();
    });
}

// Função para girar a roleta com desaceleração
function spinWheel() {
    let spinSpeed = currentSpeed;
    const friction = 0.99;
    const minSpeed = 0.01;

    spinSound.currentTime = 0;
    spinSound.play();
    isSpinning = true;

    spinInterval = setInterval(() => {
        rotation += spinSpeed;
        drawWheelWithRotation(rotation);

        spinSpeed *= friction;

        if (spinSpeed < minSpeed) {
            clearInterval(spinInterval);
            selectName(rotation);
            isSpinning = false;
            spinSound.pause();
            spinSound.currentTime = 0;
        }
    }, 30);
}

// Função para desenhar a roleta com rotação
function drawWheelWithRotation(rotation) {
    const ctx = wheelCanvas.getContext('2d');
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(rotation);
    ctx.translate(-250, -250);
    drawWheel();
    ctx.restore();
}

// Seleciona o nome sorteado e remove da roleta (mantém na lista de nomes)
function selectName(rotation) {
    const availableNames = names.filter(name => !removedNames.includes(name));
    const sliceAngle = (2 * Math.PI) / availableNames.length;
    const selectedSlice = Math.floor(((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / sliceAngle);
    const selectedName = availableNames[selectedSlice];

    resultElement.textContent = `Hoje a Daily é toda sua: ${selectedName}`;
    removedNames.push(selectedName);
    drawWheel();
}

// Adiciona nome à lista
addNameButton.addEventListener('click', function () {
    const newName = newNameInput.value.trim();
    if (newName !== '') {
        names.push(newName);
        localStorage.setItem('wheelNames', JSON.stringify(names));
        drawWheel();
        populateNameList();
        newNameInput.value = '';
    }
});

// Define o nome da Squad
setSquadNameButton.addEventListener('click', () => {
    const squadName = squadNameInput.value.trim();
    if (squadName) {
        squadNameDisplay.textContent = `Nome da Squad: ${squadName}`;
        squadNameInput.value = '';
    }
});

// Evento para rodar a roleta
spinButton.addEventListener('click', function () {
    if (!isSpinning) spinWheel();
});

// Evento para reiniciar a roleta
resetButton.addEventListener('click', function () {
    removedNames = [];
    drawWheel();
    resultElement.textContent = '';
});

// Preenche a lista de nomes com seletor de cores e botão de imagem
function populateNameList() {
    nameList.innerHTML = '';
    names.forEach((name, index) => {
        const li = document.createElement('li');
        
        const nameContainer = document.createElement('div');
        nameContainer.textContent = name;

        // Botão de upload de imagem
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.style.display = 'none';

        const imageIcon = document.createElement('img');
        imageIcon.src = imageIconPath;
        imageIcon.className = 'image-icon';
        imageIcon.style.cursor = 'pointer';
        imageIcon.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    images[name] = event.target.result;
                    drawWheel();
                };
                reader.readAsDataURL(file);
            }
        });

        // Cria o seletor de cor
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = colors[name] || getRandomColor();

        colorPicker.addEventListener('input', (e) => {
            colors[name] = e.target.value;
            drawWheel();
        });

        const deleteButton = document.createElement('img');
        deleteButton.src = deleteIconPath;
        deleteButton.classList.add('delete-button');
        deleteButton.style.cursor = 'pointer';
        deleteButton.addEventListener('click', () => {
            names.splice(index, 1);
            delete colors[name];
            delete images[name];
            localStorage.setItem('wheelNames', JSON.stringify(names));
            drawWheel();
            populateNameList();
        });

        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.alignItems = 'center';
        actionsDiv.append(imageIcon, imageInput, colorPicker, deleteButton);

        li.appendChild(nameContainer);
        li.appendChild(actionsDiv);
        nameList.appendChild(li);
    });
}

// Inicializa a roleta e a lista ao carregar a página
window.onload = function () {
    drawWheel();
    populateNameList();
};
