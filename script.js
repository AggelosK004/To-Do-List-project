// API Base URL
const API_URL = 'http://localhost:3001';

// Store user data and token
let currentUser = null;
let authToken = null;
let tasks = [];

// DOM Elements
const authContainer = document.getElementById('authContainer');
const todoContainer = document.getElementById('todoContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

// Check if user is already logged in (token in localStorage)
function checkAuth() {
  authToken = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (authToken && userData) {
    currentUser = JSON.parse(userData);
    showTodoApp();
    loadTasks();
  } else {
    showAuthForm();
  }
}

// Show authentication form
function showAuthForm() {
  authContainer.classList.add('active');
  todoContainer.classList.remove('active');
}

// Show to-do app
function showTodoApp() {
  authContainer.classList.remove('active');
  todoContainer.classList.add('active');
  document.getElementById('currentUsername').textContent = currentUser.username;
}

// Show error message
function showError(message) {
  authError.textContent = message;
  authError.classList.add('active');
  setTimeout(() => {
    authError.classList.remove('active');
  }, 5000);
}

// Toggle between login and register forms
document.getElementById('showRegister').addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  authError.classList.remove('active');
});

document.getElementById('showLogin').addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
  authError.classList.remove('active');
});

// Register
document.getElementById('registerButton').addEventListener('click', async () => {
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Registration failed');
      return;
    }

    // Save token and user data
    authToken = data.access_token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(currentUser));

    // Show to-do app
    showTodoApp();
    loadTasks();
  } catch (error) {
    showError('Network error. Please try again.');
    console.error('Register error:', error);
  }
});

// Login
document.getElementById('loginButton').addEventListener('click', async () => {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Invalid credentials');
      return;
    }

    // Save token and user data
    authToken = data.access_token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(currentUser));

    // Show to-do app
    showTodoApp();
    loadTasks();
  } catch (error) {
    showError('Network error. Please try again.');
    console.error('Login error:', error);
  }
});

// Logout
document.getElementById('logoutButton').addEventListener('click', () => {
  authToken = null;
  currentUser = null;
  tasks = [];
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  showAuthForm();
  
  // Clear forms
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
});

// Load tasks
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, logout
        document.getElementById('logoutButton').click();
        return;
      }
      throw new Error('Failed to load tasks');
    }

    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    const message = document.createElement('p');
    message.id = 'emptyMessage';
    message.textContent = 'You have no tasks yet!';
    taskList.parentNode.insertBefore(message, taskList);
  } else {
    const existingMessage = document.getElementById('emptyMessage');
    if (existingMessage) existingMessage.remove();
    
    tasks.forEach(task => createTaskElement(task));
  }
}

// Create task element
function createTaskElement(task) {
  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => updateTask(task.id, { completed: checkbox.checked }));

  const taskTextSpan = document.createElement('span');
  taskTextSpan.className = 'task-text';
  taskTextSpan.textContent = task.text;
  if (task.completed) {
    taskTextSpan.classList.add('completed');
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'task-buttons';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => editTask(li, task));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(taskTextSpan);
  li.appendChild(buttonContainer);
  taskList.appendChild(li);
}

// Add task
document.getElementById('addButton').addEventListener('click', async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      taskInput.value = '';
      await loadTasks();
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
});

// Update task
async function updateTask(taskId, updates) {
  try {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updates)
    });
    await loadTasks();
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

// Delete task
async function deleteTask(taskId) {
  try {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    await loadTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

// Edit task
function editTask(li, task) {
  const taskTextSpan = li.querySelector('.task-text');
  const buttonContainer = li.querySelector('.task-buttons');

  const editInput = document.createElement('input');
  editInput.className = 'edit-input';
  editInput.value = task.text;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    const newText = editInput.value.trim();
    if (newText) {
      await updateTask(task.id, { text: newText });
    }
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'delete-btn';
  cancelBtn.addEventListener('click', () => loadTasks());

  li.removeChild(taskTextSpan);
  li.removeChild(buttonContainer);

  const newButtonContainer = document.createElement('div');
  newButtonContainer.className = 'task-buttons';
  newButtonContainer.appendChild(saveBtn);
  newButtonContainer.appendChild(cancelBtn);

  li.appendChild(editInput);
  li.appendChild(newButtonContainer);
  editInput.focus();
}

// Enter key support
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('addButton').click();
});

document.getElementById('loginPassword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('loginButton').click();
});

document.getElementById('registerPassword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('registerButton').click();
});

// Initialize
checkAuth();