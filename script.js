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

// Sons para o giro e a seleção
const spinSound = new Audio('Som-Roleta.mp3'); // Certifique-se de que o caminho do som está correto
const selectSound = new Audio('som-fim.mp3');

// Variáveis globais
let names = JSON.parse(localStorage.getItem('wheelNames')) || [];
let rotation = 0;
let isSpinning = false;
let spinInterval = null;

// Função para desenhar a roleta
function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const colors = ['#000000', '#FFFFFF'];
    const numSlices = names.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    for (let i = 0; i < numSlices; i++) {
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        // Desenha as fatias
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.fillStyle = colors[i % 2];
        ctx.fill();

        // Adiciona o texto
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = colors[i % 2] === '#000000' ? '#FFFFFF' : '#000000';
        ctx.font = "bold 16px Arial";
        ctx.fillText(names[i], 150, 10);
        ctx.restore();
    }
}

// Função para girar a roleta
function spinWheel() {
    let spinSpeed = 0.3;  // Velocidade do giro
    const duration = 5000;  // Duração em milissegundos
    const startTime = Date.now();

    spinSound.play();  // Toca o som de giro
    isSpinning = true;

    spinInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        // Aumenta o giro
        rotation += spinSpeed;

        drawWheelWithRotation(rotation); // Atualiza o desenho da roleta

        // Se o tempo passou do limite, pare o giro
        if (elapsedTime >= duration) {
            clearInterval(spinInterval);
            selectName(rotation);  // Seleciona o nome
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

// Função para selecionar o nome
function selectName(rotation) {
    const sliceAngle = (2 * Math.PI) / names.length;
    const selectedSlice = Math.floor(((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / sliceAngle);
    const selectedName = names[selectedSlice];

    resultElement.textContent = `Quem vai apresentar a Daily é: ${selectedName}`;
    selectSound.play();  // Toca o som de seleção

    // Remove o nome sorteado
    names.splice(selectedSlice, 1);
    localStorage.setItem('wheelNames', JSON.stringify(names));
    drawWheel(); // Redesenha a roleta
    populateNameList(); // Atualiza a lista de nomes
}

// Eventos dos botões
setSquadNameButton.addEventListener('click', () => {
    const squadName = squadNameInput.value.trim();
    if (squadName) {
        squadNameDisplay.textContent = `Nome da Squad: ${squadName}`; // Exibe o nome da Squad
        squadNameInput.value = ''; // Limpa o campo de entrada
    }
});

addNameButton.addEventListener('click', function() {
    const newName = newNameInput.value.trim();
    if (newName !== '') {
        names.push(newName);
        localStorage.setItem('wheelNames', JSON.stringify(names));
        drawWheel();
        populateNameList();
        newNameInput.value = '';
    }
});

spinButton.addEventListener('click', function() {
    if (!isSpinning) {
        spinWheel();
    }
});

resetButton.addEventListener('click', function() {
    // Retorna os nomes removidos para a roleta
    names = JSON.parse(localStorage.getItem('wheelNames')) || [];
    drawWheel();
    populateNameList();
    resultElement.textContent = '';  // Limpa o resultado
});

// Função para preencher a lista de nomes
function populateNameList() {
    nameList.innerHTML = ''; // Limpa a lista existente
    names.forEach((name, index) => {
        const li = document.createElement('li'); // Cria um novo item de lista
        li.textContent = name; // Define o texto do item como o nome

        // Cria o botão de excluir
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir'; // Define o texto do botão
        deleteButton.style.backgroundColor = '#ff4d4d'; // Cor de fundo do botão
        deleteButton.style.color = '#fff'; // Cor da fonte do botão
        deleteButton.style.border = 'none'; // Remove a borda do botão
        deleteButton.style.borderRadius = '5px'; // Arredonda os cantos do botão
        deleteButton.style.padding = '5px 10px'; // Adiciona preenchimento interno ao botão
        deleteButton.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável

        // Adiciona o evento de clique para excluir o nome
        deleteButton.addEventListener('click', () => {
            names.splice(index, 1); // Remove o nome da lista
            localStorage.setItem('wheelNames', JSON.stringify(names)); // Atualiza o armazenamento local
            drawWheel(); // Redesenha a roleta
            populateNameList(); // Atualiza a lista de nomes
        });

        li.appendChild(deleteButton); // Adiciona o botão ao item de lista
        nameList.appendChild(li); // Adiciona o item à lista
    });
}

// Inicialização
window.onload = function() {
    drawWheel();
    populateNameList();
};
