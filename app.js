/**
 * Diva's Task - Application Logic
 */

// --- State Management ---
let tasks = [];
let filter = 'all';
let sortBy = 'date-new';

// --- DOM Elements ---
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');

const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-task-id');
const editTitleInput = document.getElementById('edit-title');
const editDescInput = document.getElementById('edit-desc');
const editPriorityInput = document.getElementById('edit-priority');
const editDueDateInput = document.getElementById('edit-due-date');
const closeModalBtns = document.querySelectorAll('.close-modal');

// --- Initialization ---
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

// --- LocalStorage ---
function saveTasks() {
    localStorage.setItem('divas_task', JSON.stringify(tasks));
    updateStats();
}

function loadTasks() {
    const saved = localStorage.getItem('divas_task');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

// --- Core Actions ---
function addTask(title, desc, priority, dueDate) {
    const newTask = {
        id: Date.now().toString(),
        title,
        desc,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function updateTask(id, updates) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        saveTasks();
        renderTasks();
    }
}

// --- UI Rendering ---
function renderTasks() {
    let filteredTasks = tasks;

    // Apply Filter
    if (filter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    // Apply Sort
    filteredTasks.sort((a, b) => {
        if (sortBy === 'date-new') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'date-old') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'priority') {
            const weights = { high: 3, medium: 2, low: 1 };
            return weights[b.priority] - weights[a.priority];
        }
        return 0;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                <p>${tasks.length === 0 ? 'No tasks yet. Start by adding one above!' : 'No tasks match your filter.'}</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox-wrapper">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="event.stopPropagation(); toggleComplete('${task.id}')"></div>
            </div>
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                    <div class="task-actions">
                        <button class="action-btn edit-btn" onclick="openEditModal('${task.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
                ${task.desc ? `<p class="task-desc">${escapeHTML(task.desc)}</p>` : ''}
                <div class="task-footer">
                    <div class="task-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>${task.priority}</span>
                    </div>
                    ${task.dueDate ? `
                        <div class="task-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>${formatDate(task.dueDate)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    totalCountEl.textContent = tasks.length;
    completedCountEl.textContent = tasks.filter(t => t.completed).length;
}

// --- Event Listeners ---
function setupEventListeners() {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const desc = taskDescInput.value.trim();
        const priority = taskPriorityInput.value;
        const dueDate = taskDueDateInput.value;

        if (title) {
            addTask(title, desc, priority, dueDate);
            taskForm.reset();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter = btn.dataset.filter;
            renderTasks();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderTasks();
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editIdInput.value;
        const updates = {
            title: editTitleInput.value.trim(),
            desc: editDescInput.value.trim(),
            priority: editPriorityInput.value,
            dueDate: editDueDateInput.value
        };
        updateTask(id, updates);
        closeEditModal();
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeEditModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
}

// --- Helpers ---
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        editIdInput.value = task.id;
        editTitleInput.value = task.title;
        editDescInput.value = task.desc || '';
        editPriorityInput.value = task.priority;
        editDueDateInput.value = task.dueDate || '';
        editModal.classList.add('active');
    }
}

function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Start the app
init();
