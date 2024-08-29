/****************************
 * Utility functions
 ****************************/
const saveToLocalStorage = () => localStorage.setItem("todos", JSON.stringify(todos));

/****************************
 * Dark - Light Mode
 ****************************/
function initDarkMode() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const setDarkMode = isDark => document.body.classList.toggle('dark-mode', isDark);
  setDarkMode(prefersDarkScheme.matches);
  prefersDarkScheme.addEventListener('change', e => setDarkMode(e.matches));
}

/****************************
 * Scrollbar visibility
 ****************************/
function initScrollbar() {
  const scrollElement = document.querySelector('.scroll');
  const updateScrollbarVisibility = () => {
    scrollElement.classList.toggle('scrollbar-visible', scrollElement.scrollHeight > scrollElement.clientHeight);
  };
  updateScrollbarVisibility();
  new MutationObserver(updateScrollbarVisibility).observe(scrollElement, { childList: true, subtree: true });
}

/****************************
 * Todo functionality
 ****************************/
let todos = JSON.parse(localStorage.getItem("todos")) || [];
const elements = {
  todoInput: document.getElementById("todoInput"),
  todoList: document.getElementById("todoList"),
  todoCount: document.getElementById("todoCount"),
  addButton: document.querySelector(".btn"),
  deleteButton: document.getElementById("deleteButton")
};

/****************************
 * Task management functions
 ****************************/
function addTask(event) {
  event.preventDefault();
  const newTask = elements.todoInput.value.trim();
  if (newTask) {
    todos.push({ text: newTask, disabled: false });
    saveToLocalStorage();
    elements.todoInput.value = "";
    displayTasks();
  }
}

function editTask(index) {
  const todoContainer = document.querySelector(`#todo-${index}`).closest('.todo-container');
  const todoText = todos[index].text;
  const originalContent = todoContainer.innerHTML;
  
  todoContainer.innerHTML = `
    <input type="checkbox" class="todo-checkbox" id="input-${index}" ${todos[index].disabled ? "checked" : ""} disabled>
    <input type="text" class="edit-input" value="${todoText}">
    <button class="confirm-edit" data-index="${index}">
      <i class="fas fa-check" aria-hidden="true"></i>
    </button>
    <button class="cancel-edit" data-index="${index}">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  `;
  
  const newInput = todoContainer.querySelector('.edit-input');
  if (newInput) {
    newInput.focus();
    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
  }

  todoContainer.querySelector('.confirm-edit').addEventListener('click', () => confirmEdit(index));
  todoContainer.querySelector('.cancel-edit').addEventListener('click', () => {
    todoContainer.innerHTML = originalContent;
    todoContainer.querySelector('.edit-item').addEventListener('click', () => editTask(index));
  });
}

function confirmEdit(index) {
  const todoContainer = document.querySelector(`#input-${index}`).closest('.todo-container');
  const updatedText = todoContainer.querySelector('.edit-input').value.trim();
  
  if (updatedText) {
    todos[index].text = updatedText;
    saveToLocalStorage();
    displayTasks();
  } else {
    displayTasks();
  }
}

const toggleTask = index => {
  todos[index].disabled = !todos[index].disabled;
  saveToLocalStorage();
  displayTasks();
};

const deleteTask = index => {
  todos.splice(index, 1);
  saveToLocalStorage();
  displayTasks();
};

const deleteAllTasks = () => {
  todos = [];
  saveToLocalStorage();
  displayTasks();
};

/****************************
 * Display function
 ****************************/
function displayTasks() {
  elements.todoList.innerHTML = todos.map((item, index) => `
    <li>
      <div class="todo-container">
        <input type="checkbox" class="todo-checkbox" id="input-${index}" ${item.disabled ? "checked" : ""}>
        <p id="todo-${index}" class="${item.disabled ? "disabled" : ""}">${item.text}</p>
        <button class="edit-item" data-index="${index}">
          <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </button>
        <button class="delete-item" data-index="${index}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </li>
  `).join('');

  elements.todoList.querySelectorAll('.todo-checkbox').forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => toggleTask(index));
  });

  elements.todoList.querySelectorAll('.edit-item').forEach(button => {
    button.addEventListener('click', e => editTask(parseInt(e.currentTarget.dataset.index)));
  });

  elements.todoList.querySelectorAll('.delete-item').forEach(button => {
    button.addEventListener('click', e => deleteTask(parseInt(e.currentTarget.dataset.index)));
  });

  elements.todoCount.textContent = todos.length;
}

/****************************
 * Initialize
 ****************************/
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  initScrollbar();
  
  document.getElementById("todoForm").addEventListener("submit", addTask);

  elements.todoInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask(event);
    }
  });
  elements.deleteButton.addEventListener("click", deleteAllTasks);
  displayTasks();
});