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

// Sons para o giro e a seleção
const spinSound = new Audio('Som-Roleta.mp3');

// Ajustar volume
volumeInput.addEventListener('input', function() {
    const volume = volumeInput.value;
    spinSound.volume = volume;
    selectSound.volume = volume;
});

// Variáveis globais
let names = JSON.parse(localStorage.getItem('wheelNames')) || [];
let colors = {};  // Objeto para armazenar as cores associadas aos nomes
let rotation = 0;
let isSpinning = false;
let spinInterval = null;
let currentSpeed = 0.3; // Velocidade inicial de rotação

// Função para gerar uma cor aleatória em hexadecimal
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Gera um array de cores aleatórias para a roleta
function generateRandomColors(numColors) {
    const colorsArray = [];
    for (let i = 0; i < numColors; i++) {
        colorsArray.push(getRandomColor());
    }
    return colorsArray;
}

// Função para desenhar a roleta
function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const numSlices = names.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    // Gera cores aleatórias para as fatias
    const wheelColors = generateRandomColors(numSlices);

    for (let i = 0; i < numSlices; i++) {
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        // Usa a cor gerada para a fatia
        const color = wheelColors[i];

        // Desenha as fatias com cores aleatórias
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.fillStyle = color;
        ctx.fill();

        // Adiciona o texto
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = '#000000'; // Texto sempre preto para melhor contraste
        ctx.font = "bold 16px Arial";
        ctx.fillText(names[i], 150, 10);
        ctx.restore();
    }
}

// Função para girar a roleta com desaceleração
function spinWheel() {
    let spinSpeed = currentSpeed;
    const friction = 0.99;  // Fricção para desacelerar
    const minSpeed = 0.01;  // Velocidade mínima antes de parar

    spinSound.play();  // Toca o som de giro
    isSpinning = true;  // Marca que a roleta está girando

    spinInterval = setInterval(() => {
        rotation += spinSpeed;  // Aumenta a rotação com base na velocidade
        drawWheelWithRotation(rotation);  // Atualiza o desenho da roleta com a rotação

        spinSpeed *= friction;  // Aplica fricção para desacelerar

        // Se a velocidade for menor que o mínimo, parar a roleta
        if (spinSpeed < minSpeed) {
            clearInterval(spinInterval);
            selectName(rotation);  // Seleciona o nome sorteado
            isSpinning = false;  // Marca que a roleta parou de girar
            spinSound.pause();
            spinSound.currentTime = 0;  // Reinicia o som
        }
    }, 30);  // Intervalo de 30ms para suavizar a rotação
}

// Função para desenhar a roleta com rotação
function drawWheelWithRotation(rotation) {
    const ctx = wheelCanvas.getContext('2d');
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);  // Limpa a roleta anterior
    ctx.save();
    ctx.translate(250, 250);  // Move o contexto para o centro da roleta
    ctx.rotate(rotation);  // Aplica a rotação
    ctx.translate(-250, -250);  // Move de volta após rotacionar
    drawWheel();  // Redesenha a roleta atualizada
    ctx.restore();
}

// Seleciona o nome sorteado e remove da roleta
function selectName(rotation) {
    const sliceAngle = (2 * Math.PI) / names.length;
    const selectedSlice = Math.floor(((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / sliceAngle);
    const selectedName = names[selectedSlice];

    resultElement.textContent = `Hoje a Daily é toda sua: ${selectedName}`;

    // Remove o nome sorteado da lista
    names.splice(selectedSlice, 1);
    localStorage.setItem('wheelNames', JSON.stringify(names));
    drawWheel();  // Redesenha a roleta com o nome removido
}

// Adiciona nome à lista
addNameButton.addEventListener('click', function() {
    const newName = newNameInput.value.trim();
    if (newName !== '') {
        names.push(newName);
        localStorage.setItem('wheelNames', JSON.stringify(names));
        drawWheel();  // Redesenha a roleta com o novo nome
        populateNameList();  // Atualiza a lista de nomes
        newNameInput.value = '';  // Limpa o campo de entrada
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
spinButton.addEventListener('click', function() {
    if (!isSpinning) {  // Somente roda se não estiver girando
        spinWheel();
    }
});

// Evento para reiniciar a roleta
resetButton.addEventListener('click', function() {
    names = JSON.parse(localStorage.getItem('wheelNames')) || [];
    drawWheel();  // Redesenha a roleta
    populateNameList();  // Atualiza a lista de nomes
    resultElement.textContent = '';  // Limpa o resultado
});

// Preenche a lista de nomes com o seletor de cores
function populateNameList() {
    nameList.innerHTML = '';
    names.forEach((name, index) => {
        const li = document.createElement('li');
        li.textContent = name;

        // Cria o seletor de cor
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = colors[name] || getRandomColor();  // Cor existente ou aleatória

        // Atualiza a cor ao mudar no seletor
        colorPicker.addEventListener('input', (e) => {
            colors[name] = e.target.value;  // Salva a cor selecionada
            drawWheel();  // Redesenha a roleta com a nova cor
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-button');

        // Remove o nome da lista e a cor associada
        deleteButton.addEventListener('click', () => {
            names.splice(index, 1);
            delete colors[name];  // Remove a cor associada ao nome
            localStorage.setItem('wheelNames', JSON.stringify(names));
            drawWheel();  // Redesenha a roleta
            populateNameList();  // Atualiza a lista de nomes
        });

        li.appendChild(colorPicker);  // Adiciona o seletor de cor
        li.appendChild(deleteButton);  // Adiciona o botão de excluir
        nameList.appendChild(li);
    });
}

// Inicializa a roleta e a lista ao carregar a página
window.onload = function() {
    drawWheel();  // Desenha a roleta
    populateNameList();  // Preenche a lista de nomes
};
