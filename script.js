const addButton = document.querySelector("button");
const taskInput = document.querySelector("input");
const taskList = document.querySelector("ul");

addButton.addEventListener("click", function() {
  const taskText = taskInput.value;
  if (taskText === "") return;

  const newTask = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  checkbox.addEventListener("change", function() {
    if (checkbox.checked) {
      newTask.style.textDecoration = "line-through";
    } else {
      newTask.style.textDecoration = "none";
    }
  });

  newTask.appendChild(checkbox);
  newTask.append(taskText);
  taskList.appendChild(newTask);
  taskInput.value = "";
});