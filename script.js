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

// Sons para o giro e a seleção
const spinSound = new Audio('Som-Roleta.mp3');

// Ajustar volume do som
volumeInput.addEventListener('input', function () {
    const volume = volumeInput.value;
    spinSound.volume = volume; // Ajusta o volume do som
});

// Variáveis globais
let names = JSON.parse(localStorage.getItem('wheelNames')) || []; // Lista de nomes
let removedNames = []; // Lista de nomes removidos apenas da roleta
let colors = {};  // Objeto para armazenar as cores associadas aos nomes
let rotation = 0; // Rotação inicial da roleta
let isSpinning = false; // Controle para verificar se a roleta está girando
let spinInterval = null; // Armazenar o intervalo do giro
let currentSpeed = 0.3; // Velocidade inicial de rotação
let outlineColor = '#333'; // Cor padrão do outliner das fatias (pode ser alterada)

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

// Função para desenhar a roleta com efeito 3D
function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const availableNames = names.filter(name => !removedNames.includes(name)); // Nomes disponíveis para a roleta
    const numSlices = availableNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Limpa o canvas antes de desenhar
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    // Usa cores armazenadas ou gera novas cores
    availableNames.forEach((name, i) => {
        if (!colors[name]) {
            colors[name] = getRandomColor(); // Gera cor aleatória se não existir
        }

        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        // Desenha a fatia com a cor associada ao nome
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.fillStyle = colors[name];
        ctx.fill();

        // Desenha o outliner ao redor da fatia
        ctx.strokeStyle = outlineColor; // Cor do outliner
        ctx.lineWidth = 3; // Espessura do contorno
        ctx.stroke();

        // Adiciona o nome na fatia
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = '#000000'; // Texto sempre preto para melhor contraste
        ctx.font = "bold 16px Arial";
        ctx.fillText(availableNames[i], 150, 10);
        ctx.restore();
    });
}

// Função para girar a roleta com desaceleração
function spinWheel() {
    let spinSpeed = currentSpeed;
    const friction = 0.99;  // Fricção para desacelerar
    const minSpeed = 0.01;  // Velocidade mínima antes de parar

    spinSound.currentTime = 0; // Reinicia o som
    spinSound.play();  // Toca o som de giro imediatamente
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
            spinSound.pause(); // Para o som
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

// Seleciona o nome sorteado e remove da roleta (mas mantém na lista de nomes)
function selectName(rotation) {
    const availableNames = names.filter(name => !removedNames.includes(name)); // Nomes disponíveis
    const sliceAngle = (2 * Math.PI) / availableNames.length;
    const selectedSlice = Math.floor(((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / sliceAngle);
    const selectedName = availableNames[selectedSlice];

    resultElement.textContent = `Hoje a Daily é toda sua: ${selectedName}`;

    // Remove o nome sorteado apenas da roleta, mas não da listagem
    removedNames.push(selectedName);
    drawWheel();  // Redesenha a roleta com o nome removido
}

// Adiciona nome à lista
addNameButton.addEventListener('click', function () {
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
spinButton.addEventListener('click', function () {
    if (!isSpinning) {  // Somente roda se não estiver girando
        spinWheel();
    }
});

// Evento para reiniciar a roleta
resetButton.addEventListener('click', function () {
    removedNames = [];  // Limpa a lista de nomes removidos para reiniciar a roleta
    drawWheel();  // Redesenha a roleta com todos os nomes
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

        // Alinha o seletor de cor e o botão de excluir
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.alignItems = 'center';
        actionsDiv.appendChild(colorPicker);  // Adiciona o seletor de cor
        actionsDiv.appendChild(deleteButton);  // Adiciona o botão de excluir
        li.appendChild(actionsDiv);  // Adiciona a div de ações ao item da lista

        nameList.appendChild(li);
    });
}

// Inicializa a roleta e a lista ao carregar a página
window.onload = function () {
    drawWheel();  // Desenha a roleta
    populateNameList();  // Preenche a lista de nomes
};
