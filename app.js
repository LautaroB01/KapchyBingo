const markedNumbers = new Set();
const bingoConfig = [
    { letter: 'B', min: 1, max: 15 },
    { letter: 'I', min: 16, max: 30 },
    { letter: 'N', min: 31, max: 45 },
    { letter: 'G', min: 46, max: 60 },
    { letter: 'O', min: 61, max: 75 }
];

const boardElement = document.getElementById('bingo-board');
const btnClear = document.getElementById('btn-clear');
const btnWinner = document.getElementById('btn-winner');
const numberInput = document.getElementById('number-input'); 

const winnerSound = new Audio('assets/victoria.mp3');
winnerSound.volume = 0.3;

const previewOverlay = document.getElementById('number-preview');
const previewText = document.getElementById('preview-text');
let previewTimeout;

function showNumberPreview(number) {
    previewText.textContent = number;
    
    previewOverlay.classList.add('show');

    if (previewTimeout) {
        clearTimeout(previewTimeout);
    }

    previewTimeout = setTimeout(() => {
        previewOverlay.classList.remove('show');
    }, 2400); 
}

function initializeBoard() {
    boardElement.innerHTML = ''; 

    bingoConfig.forEach(config => {
        const colDiv = document.createElement('div');
        colDiv.className = 'bingo-column';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'column-header';
        headerDiv.textContent = config.letter;
        colDiv.appendChild(headerDiv);

        for (let i = config.min; i <= config.max; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = i;
            cell.dataset.number = i; 
            
            cell.addEventListener('click', () => toggleNumber(i, cell));
            colDiv.appendChild(cell);
        }
        boardElement.appendChild(colDiv);
    });
}

function toggleNumber(number, htmlElement = null) {
    const element = htmlElement || document.querySelector(`.number-cell[data-number="${number}"]`);
    
    if (!element) return; 

    if (markedNumbers.has(number)) {
        markedNumbers.delete(number);
        element.classList.remove('marked');
    } else {
        markedNumbers.add(number);
        element.classList.add('marked');
    }
}

function clearBoard() {
    markedNumbers.clear(); 
    document.querySelectorAll('.number-cell.marked').forEach(cell => {
        cell.classList.remove('marked');
    });
    numberInput.focus();
}

numberInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const value = parseInt(numberInput.value);
        
        if (!isNaN(value) && value >= 1 && value <= 75) {
            toggleNumber(value);
            
            // NUEVO: Solo mostrar la previsualización gigante si el número se está MARCANDO.
            // Si el operador escribe por error un número que ya estaba marcado, se desmarcará pero no saltará la alerta gigante.
            if (markedNumbers.has(value)) {
                showNumberPreview(value);
            }
        }
        
        numberInput.value = '';
    }
});

btnClear.addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se borrarán todos los números marcados actuales.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            clearBoard();
        }
    });
});

btnWinner.addEventListener('click', () => {
    winnerSound.play();
    confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.1 },
        zIndex: 9999
    });

    Swal.fire({
        title: '¡TENEMOS UN GANADOR!',
        text: 'La partida ha finalizado. El tablero se reiniciará.',
        icon: 'success',
        confirmButtonText: 'Iniciar Nueva Partida',
        confirmButtonColor: '#10b981',
        allowOutsideClick: false
    }).then(() => {
        clearBoard();
    });
});

initializeBoard();

const clockElement = document.getElementById('clock-container');

function updateClock() {
    const now = new Date();
    
    // Configurar cómo queremos que se vea la fecha (Ej: "domingo, 7 de junio")
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateString = now.toLocaleDateString('es-AR', dateOptions);
    
    // Capitalizar la primera letra para que sea más profesional
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    
    // Configurar cómo queremos que se vea la hora (Ej: "14:30:45")
    const timeString = now.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });

    // Inyectar el HTML dentro del contenedor del reloj
    clockElement.innerHTML = `
        <span class="clock-date">${dateString}</span>
        <span>${timeString}</span>
    `;
}

updateClock();

setInterval(updateClock, 1000);