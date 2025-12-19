let tasks = JSON.parse(localStorage.getItem('focusTasks')) || [];
let history = JSON.parse(localStorage.getItem('productivityHistory')) || [];
let isDarkMode = localStorage.getItem('theme') === 'dark';


const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const slider = document.getElementById('productivity-slider');
const sliderVal = document.getElementById('slider-value');
const saveRatingBtn = document.getElementById('save-rating');


document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    renderTasks();
    updateStats();
    initChart();
});


themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
});

function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}


taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        text: taskInput.value,
        completed: false
    };
    tasks.push(newTask);
    saveAndRender();
    taskInput.value = '';
});

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('focusTasks', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}

function renderTasks() {
    taskList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span>${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
}


function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('remaining-tasks').textContent = total - completed;
}


slider.addEventListener('input', (e) => {
    sliderVal.textContent = e.target.value;
});

saveRatingBtn.addEventListener('click', () => {
    const entry = {
        date: new Date().toLocaleDateString(undefined, { weekday: 'short' }),
        score: parseInt(slider.value)
    };
    
    // Keep only last 7 days
    history.push(entry);
    if (history.length > 7) history.shift();
    
    localStorage.setItem('productivityHistory', JSON.stringify(history));
    updateChart();
    saveRatingBtn.textContent = "Logged!";
    setTimeout(() => saveRatingBtn.textContent = "Log Daily Score", 2000);
});

let prodChart;
function initChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    prodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                label: 'Productivity Level',
                data: history.map(h => h.score),
                borderColor: '#0984e3',
                backgroundColor: 'rgba(9, 132, 227, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 10, ticks: { stepSize: 1 } }
            }
        }
    });
}

function updateChart() {
    prodChart.data.labels = history.map(h => h.date);
    prodChart.data.datasets[0].data = history.map(h => h.score);
    prodChart.update();
}