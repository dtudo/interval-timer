const intervalList = document.getElementById('interval-list');
const addIntervalButton = document.getElementById('add-interval');
const startTimerButton = document.getElementById('start-timer');
const timerModal = document.getElementById('timer-modal');
const copyConfigButton = document.getElementById("copy-config");
const pasteConfigButton = document.getElementById("paste-config");
const pasteConfigModal = document.getElementById('paste-config-modal');
const closePasteConfigModal = document.getElementById('close-paste-config-modal');
const applyConfigButton = document.getElementById('apply-config');
const pasteConfigInput = document.getElementById('paste-config-input');
const pauseTimerButton = document.getElementById('pause-timer-button');
const endTimerButton = document.getElementById('end-timer-button');
const totalTimePanel = document.getElementById('total-time-panel');
const closeTimerButton = document.getElementById('close-timer');
const intervalTimeStats = document.getElementById('interval-time');
const totalTimeStats = document.getElementById('total-time');
const intervalCurrentTimeDisplay = document.getElementById('interval-current-time');
const intervalTitle = document.getElementById('interval-title');
const noIntervalsMessage = document.getElementById('no-intervals-message');

// URL configuration
const urlParams = new URLSearchParams(window.location.search);
const intervalsParam = urlParams.get('intervals');

if (intervalsParam) {
    // Decoder/Encoder: https://meyerweb.com/eric/tools/dencoder/
    const configLines = decodeURIComponent(intervalsParam).split("\n").filter(Boolean);
    applyIntervalsConfiguration(configLines);
} else {
    // Default configuration
    createIntervalRow();
}

function createIntervalRow(name, color = '#BBBBBB', minutes = '0', seconds = '30') {
    const intervalItem = document.createElement('div');
    intervalItem.className = 'flex items-center space-x-4 bg-white p-2 shadow-sm min-w-[600px]';

    // Drag button
    const dragButton = document.createElement('button');
    dragButton.textContent = '☰';
    dragButton.className = 'drag-handle cursor-move text-gray-600';

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name || '';
    nameInput.placeholder = 'Interval Name';
    nameInput.className = 'border p-2 rounded flex-1';

    // Color input
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = color;
    colorInput.className = 'w-10 h-10 cursor-pointer shadow';

    // Minutes input
    const minutesContainer = document.createElement('div');
    minutesContainer.className = 'flex items-center space-x-1';

    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.value = Number(minutes);
    minutesInput.min = '0';
    minutesInput.max = '59';
    minutesInput.className = 'w-14 border p-2 rounded';

    const minutesInputText = document.createElement('span');
    minutesInputText.textContent = 'min';
    minutesContainer.append(minutesInput, minutesInputText);

    // Seconds input
    const secondsContainer = document.createElement('div');
    secondsContainer.className = 'flex items-center space-x-1';

    const secondsInput = document.createElement('input');
    secondsInput.type = 'number';
    secondsInput.value = Number(seconds);
    secondsInput.min = '0';
    secondsInput.max = '59';
    secondsInput.className = 'w-14 border p-2 rounded';

    const secondsInputText = document.createElement('span');
    secondsInputText.textContent = 'sec';
    secondsContainer.append(secondsInput, secondsInputText);

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.className = 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600';
    deleteButton.onclick = () => intervalItem.remove();

    intervalItem.append(dragButton, nameInput, colorInput, minutesContainer, secondsContainer, deleteButton);
    intervalList.appendChild(intervalItem);
}

addIntervalButton.addEventListener('click', () => createIntervalRow());

copyConfigButton.addEventListener("click", () => {
    const configText = getCurrentIntervalsConfigurationAsString();
    navigator.clipboard.writeText(configText).then(() => alert("Configuration copied!"));
});

function getCurrentIntervalsConfigurationAsString() {
    const intervals = Array.from(intervalList.children).map(row => {
        const inputs = row.querySelectorAll("input");

        const name = inputs[0].value.trim() || 'Unnamed interval';
        const color = inputs[1].value.trim();
        const minutes = inputs[2].value.trim();
        const seconds = inputs[3].value.trim();
        return `${name}, ${color}, ${minutes}, ${seconds}`;
    });

    return intervals.join("\n");
}

applyConfigButton.addEventListener("click", () => {
    const configLines = pasteConfigInput.value.split("\n").filter(Boolean);
    applyIntervalsConfiguration(configLines);
});

function applyIntervalsConfiguration(configLines) {
    intervalList.innerHTML = "";

    configLines.forEach((line) => {
        const [name, color, minutes, seconds] = line.split(",").map(item => item.trim());
        createIntervalRow(name, color, minutes, seconds);
    });

    pasteConfigModal.classList.add("hidden");
}

pasteConfigButton.addEventListener("click", () => {
    pasteConfigModal.classList.remove("hidden");
});

closePasteConfigModal.addEventListener("click", () => {
    pasteConfigModal.classList.add("hidden");
});

let intervalObjects = [];
let currentIntervalIndex;
let remainingTime;
let timer;
startTimerButton.addEventListener('click', () => {
    if (intervalList.children.length === 0) return;

    timerModal.classList.remove('hidden');

    intervalObjects = Array.from(intervalList.children).map(row => {
        const inputs = row.querySelectorAll("input");

        const name = inputs[0].value.trim() || 'Unnamed interval';
        const color = inputs[1].value.trim();
        const minutes = inputs[2].value.trim();
        const seconds = inputs[3].value.trim();
        return {
            name: name,
            color: color,
            minutes: Number(minutes),
            seconds: Number(seconds)
        };
    });
    currentIntervalIndex = 0;
    remainingTime = 0;
    timer = null;
    startTimer();
});

function startTimer() {
    if (timer) return; // Ignore if already running

    if (remainingTime === 0) {
        const interval = intervalObjects[currentIntervalIndex];
        remainingTime = interval.minutes * 60 + interval.seconds;
        updateTimerModal(interval.name, interval.color);
    }

    updateIntervalCurrentTimeDisplay(remainingTime);

    timer = setInterval(() => {
        if (remainingTime <= 1) {
            remainingTime--;
            clearInterval(timer);
            timer = null;
            currentIntervalIndex++;

            if (currentIntervalIndex < intervalObjects.length) {
                remainingTime = 0;
                startTimer(); // Start the next interval
            } else {
                endTimer();
            }
            return;
        }

        remainingTime--;
        updateIntervalCurrentTimeDisplay(remainingTime);
    }, 1000);
}

function pauseTimer() {
    if (pauseTimerButton.innerHTML === 'Pause') {
        pauseTimerButton.innerHTML = 'Resume';
        clearInterval(timer);
        timer = null;
    } else {
        pauseTimerButton.innerHTML = 'Pause';
        startTimer();
    }
}

function endTimer() {
    totalTimePanel.classList.remove('hidden');
    updateTimeStats(intervalObjects, remainingTime, currentIntervalIndex);
    clearTimer();
}

function clearTimer() {
    clearInterval(timer);
    timer = null;
    currentIntervalIndex = 0;
    remainingTime = 0;
}

function updateIntervalCurrentTimeDisplay(time) {
    intervalCurrentTimeDisplay.innerText = formatTime(time);
}

function updateTimerModal(name, color) {
    intervalTitle.innerHTML = name;
    timerModal.style.backgroundColor = color;
}

function updateTimeStats(intervals, intervalRemainingTime, intervalIndex) {
    const intervalTime = intervals.reduce((total, interval) => {
        const intervalSeconds = interval.minutes * 60 + interval.seconds;
        return total + intervalSeconds;
    }, 0);

    const totalTime = intervals.slice(0, intervalIndex + 1)
        .reduce((total, interval) => {
            const intervalSeconds = interval.minutes * 60 + interval.seconds;
            return total + intervalSeconds;
        }, 0) - intervalRemainingTime;

    intervalTimeStats.innerHTML = `Intervals Time: ${formatTime(intervalTime)}`;
    totalTimeStats.innerHTML = `Passed Time: ${formatTime(totalTime)}`;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

pauseTimerButton.addEventListener('click', () => {
    pauseTimer();
});

endTimerButton.addEventListener('click', () => {
    endTimer();
});

closeTimerButton.addEventListener('click', () => {
    totalTimePanel.classList.add("hidden");
    timerModal.classList.add("hidden");
});

// Initialize sortable
new Sortable(intervalList, {
    handle: '.drag-handle',
    animation: 150
});

const observer = new MutationObserver(() => {
    if (intervalList.children.length === 0) {
        noIntervalsMessage.classList.remove("hidden");
    } else {
        noIntervalsMessage.classList.add("hidden");
    }
});

observer.observe(intervalList, { childList: true });
