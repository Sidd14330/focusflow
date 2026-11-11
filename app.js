const $ = (selector) => document.querySelector(selector);
const taskForm = $('#taskForm');
const taskInput = $('#taskInput');
const taskList = $('#taskList');
const emptyState = $('#emptyState');
let tasks = JSON.parse(localStorage.getItem('focusflow-tasks') || '[]');
let filter = 'all';

const quotes = [
  'Small steps every day add up to big results.',
  'Progress is better than perfection.',
  'Start where you are. Use what you have. Do what you can.',
  'Focus on the next step, not the whole staircase.',
  'Consistency turns effort into achievement.'
];

function save() { localStorage.setItem('focusflow-tasks', JSON.stringify(tasks)); }
function render() {
  const visible = tasks.filter(task => filter === 'all' || (filter === 'active' ? !task.done : task.done));
  taskList.innerHTML = '';
  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' done' : ''}`;
    const check = document.createElement('input');
    check.type = 'checkbox'; check.className = 'task-check'; check.checked = task.done;
    check.setAttribute('aria-label', `Mark ${task.text} ${task.done ? 'active' : 'completed'}`);
    check.addEventListener('change', () => { task.done = check.checked; save(); render(); });
    const name = document.createElement('span'); name.className = 'task-name'; name.textContent = task.text;
    const priority = document.createElement('span'); priority.className = `priority ${task.priority}`; priority.textContent = task.priority === 'high' ? 'HIGH' : task.priority === 'low' ? 'LOW' : 'NORMAL';
    const remove = document.createElement('button'); remove.className = 'delete-task'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Delete ${task.text}`);
    remove.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); save(); render(); });
    item.append(check, name, priority, remove); taskList.append(item);
  });
  emptyState.style.display = visible.length ? 'none' : 'block';
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const percent = total ? Math.round(done / total * 100) : 0;
  $('#taskCount').textContent = `${total} task${total === 1 ? '' : 's'}`;
  $('#progressPercent').textContent = `${percent}%`;
  $('#progressCircle').style.strokeDashoffset = 113.1 - (113.1 * percent / 100);
  $('#addedTotal').textContent = total;
  $('#completedTotal').textContent = done;
  $('#remainingTotal').textContent = total - done;
}
taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: `${Date.now()}-${Math.random()}`, text, priority: $('#priorityInput').value, done: false });
  save(); taskInput.value = ''; render(); taskInput.focus();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
  render();
}));
$('#clearCompleted').addEventListener('click', () => { tasks = tasks.filter(t => !t.done); save(); render(); });
$('#todayLabel').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
$('#newQuote').addEventListener('click', () => {
  const current = $('#quoteText').textContent;
  const choices = quotes.filter(q => q !== current);
  $('#quoteText').textContent = choices[Math.floor(Math.random() * choices.length)];
});

// Focus timer
let duration = 25 * 60, remaining = duration, interval = null;
const display = $('#timerDisplay');
function showTime() { display.textContent = `${String(Math.floor(remaining / 60)).padStart(2,'0')}:${String(remaining % 60).padStart(2,'0')}`; }
function stopTimer() { clearInterval(interval); interval = null; $('#startTimer').textContent = 'Start focus'; }
document.querySelectorAll('.mode').forEach(button => button.addEventListener('click', () => {
  stopTimer(); duration = Number(button.dataset.minutes) * 60; remaining = duration; showTime();
  document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b === button));
  $('#timerNote').textContent = `${button.textContent} session`;
  $('#startTimer').textContent = button.dataset.minutes === '25' ? 'Start focus' : 'Start timer';
}));
$('#startTimer').addEventListener('click', () => {
  if (interval) { stopTimer(); return; }
  $('#startTimer').textContent = 'Pause';
  interval = setInterval(() => {
    remaining--;
    showTime();
    if (remaining <= 0) {
      stopTimer();
      $('#timerNote').textContent = 'Session complete — take a moment before the next one.';
      document.title = 'Session complete · FocusFlow';
    }
  }, 1000);
});
$('#resetTimer').addEventListener('click', () => { stopTimer(); remaining = duration; showTime(); });
render(); showTime();
