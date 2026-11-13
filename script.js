const STORAGE_KEY = 'todo-list.tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty');
const counter = document.getElementById('counter');
const clearDoneBtn = document.getElementById('clear-done');
const filterButtons = document.querySelectorAll('.filters__btn');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage недоступен (например, приватный режим) — работаем без сохранения
  }
}

function pluralize(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function render() {
  const visible = tasks.filter((t) =>
    currentFilter === 'active' ? !t.done : currentFilter === 'done' ? t.done : true
  );

  list.innerHTML = '';
  for (const task of visible) {
    const li = document.createElement('li');
    li.className = 'task' + (task.done ? ' is-done' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task__check';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Отметить как выполненную');

    const text = document.createElement('span');
    text.className = 'task__text';
    text.textContent = task.text; // textContent защищает от XSS

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'task__delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Удалить задачу');

    li.append(checkbox, text, del);
    list.append(li);
  }

  const total = tasks.length;
  const active = tasks.filter((t) => !t.done).length;
  counter.textContent = total
    ? `${active} ${pluralize(active, ['активная', 'активные', 'активных'])} из ${total}`
    : 'Нет задач';

  emptyMsg.hidden = visible.length > 0;
  emptyMsg.textContent = total ? 'В этом фильтре задач нет' : 'Задач пока нет — добавьте первую ✨';
  clearDoneBtn.disabled = total === active;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false });
  saveTasks();
  render();
  input.value = '';
  input.focus();
});

list.addEventListener('change', (e) => {
  if (!e.target.classList.contains('task__check')) return;
  const id = e.target.closest('.task').dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = e.target.checked;
  saveTasks();
  render();
});

list.addEventListener('click', (e) => {
  if (!e.target.classList.contains('task__delete')) return;
  const id = e.target.closest('.task').dataset.id;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
});

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });
});

render();
