const addButton = document.getElementById("addButton");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

let tasks = [];

function loadTasks() {
  const stored = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks = stored;
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    createTaskElement(task, index);
  });
  showEmptyMessage();
}

function createTaskElement(task, index) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  checkbox.addEventListener("change", function() {
    tasks[index].completed = checkbox.checked;
    saveTasks();
    taskTextSpan.classList.toggle('completed', checkbox.checked);
  });

  const taskTextSpan = document.createElement("span");
  taskTextSpan.className = "task-text";
  taskTextSpan.textContent = task.text;
  if (task.completed) {
    taskTextSpan.classList.add('completed');
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "task-buttons";

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", function() {
    editTask(li, task, index);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", function() {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(taskTextSpan);
  li.appendChild(buttonContainer);
  taskList.appendChild(li);
}

function editTask(li, task, index) {
  const taskTextSpan = li.querySelector('.task-text');
  const buttonContainer = li.querySelector('.task-buttons');

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = task.text;

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", function() {
    const newText = editInput.value.trim();
    if (newText !== "") {
      tasks[index].text = newText;
      saveTasks();
      renderTasks();
    }
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.className = "delete-btn";
  cancelBtn.addEventListener("click", function() {
    renderTasks();
  });

  li.removeChild(taskTextSpan);
  li.removeChild(buttonContainer);

  const newButtonContainer = document.createElement("div");
  newButtonContainer.className = "task-buttons";
  newButtonContainer.appendChild(saveBtn);
  newButtonContainer.appendChild(cancelBtn);

  li.appendChild(editInput);
  li.appendChild(newButtonContainer);
  editInput.focus();
}

addButton.addEventListener("click", function() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  tasks.push({
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
});

const clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", function() {
  tasks = [];
  saveTasks();
  renderTasks();
});

taskInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addButton.click();
  }
});

loadTasks();

function showEmptyMessage() {
  const existingMessage = document.getElementById("emptyMessage");
  if (existingMessage) existingMessage.remove();
    
  if (tasks.length === 0) {
    const message = document.createElement("p");
    message.id = "emptyMessage";
    message.textContent = "You have no tasks yet!";
    message.style.textAlign = "center";
    message.style.color = "#02349a92";
    taskList.parentNode.insertBefore(message, taskList);
  }
}