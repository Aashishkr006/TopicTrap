window.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});

window.addEventListener('auth:ready', () => {
  loadStreak();
});

window.addEventListener('auth:changed', () => {
  loadStreak();
});

// const API = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://topictrap-api-hvdcfmdxhvh4e8dk.centralindia-01.azurewebsites.net/api';
let currentTopic = null;
let currentMode = 'TopicTrap';
let timerInterval = null;
let timerSeconds = 30;
let timerTotal = 30;
let timerRunning = false;
let selectedFW = null;

async function loadCategories() {
  try {
    const res = await fetch(`${API}/topics/categories`);
    if (!res.ok) throw new Error('Category request failed');

    const data = await res.json();
    const select = document.getElementById('sel-cat');
    if (!select) return;

    select.innerHTML = data.categories.map(category =>
      `<option value="${category.id}">${category.emoji} ${category.label}</option>`
    ).join('');
  } catch (error) {
    console.error('Category error:', error);
  }
}

// ---- MODE ----
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + mode).classList.add('active');

  const catGroup = document.getElementById('category-group');
  if (mode === 'interview') {
    document.getElementById('sel-cat').value = 'interview';
    catGroup.style.display = 'none';
  } else if (mode === 'vocab') {
    catGroup.style.display = 'none';
    document.getElementById('main-card').innerHTML = buildVocabCard(null);
    document.getElementById('filters-row').style.display = 'none';
  } else {
    catGroup.style.display = '';
    document.getElementById('filters-row').style.display = '';
    if (document.getElementById('sel-cat').value === 'interview') {
      document.getElementById('sel-cat').value = 'random';
    }
  }

  if (mode === 'vocab') {
    document.getElementById('spin-btn').textContent = '🎲 Get Vocab';
    spinVocab();
  } else {
    document.getElementById('spin-btn').textContent = '⚡ Spin!';
  }
}

function buildVocabCard(v) {
  if (!v) return `
    <div class="topic-label">Vocabulary Builder</div>
    <div class="vocab-word">—</div>
    <div class="vocab-pos">noun</div>
    <div class="vocab-def">Press Spin to get a word</div>`;
  return `
    <div class="topic-label">Your Word</div>
    <div class="vocab-word">${v.word}</div>
    <div class="vocab-pos">${v.partOfSpeech || 'noun'}</div>
    <div class="vocab-def">${v.definition}</div>
    ${v.exampleSentence ? `<div class="vocab-example">"${v.exampleSentence}"</div>` : ''}`;
}

// ---- VOCAB SPIN ----
async function spinVocab() {
  try {
    const res = await fetch(`${API}/vocab/random`);
    if (!res.ok) throw new Error('No vocabulary found');
    const data = await res.json();
    document.getElementById('main-card').innerHTML = buildVocabCard(data.vocab);
  } catch (error) {
    document.getElementById('main-card').innerHTML = buildVocabCard(null);
    showToast('Unable to load vocabulary');
  }
}

// ---- FILTERS ----
function applyFilter() { /* reactive — just used by spin */ }

// ---- TOPIC SPIN ----
async function spinTopic() {
  if (currentMode === 'vocab') { spinVocab(); return; }

  const btn = document.getElementById('spin-btn');
  btn.disabled = true;
  btn.classList.add('spinning');
  btn.textContent = '🎲 Spinning...';

  document.getElementById('topic-label').textContent = 'Loading...';
  document.getElementById('topic-text').innerHTML = '<span class="loading-topic">Finding your topic…</span>';
  document.getElementById('topic-meta').innerHTML = '';
  document.getElementById('hint-example').classList.remove('visible');
  document.getElementById('hint-angle').classList.remove('visible');

  const cat = currentMode === 'interview' ? 'interview' : document.getElementById('sel-cat').value;
  const diff = document.getElementById('sel-diff').value;
  const lang = document.getElementById('sel-lang').value;

  let topic = null;
  try {
    const params = new URLSearchParams({ language: lang });
    if (cat !== 'random') params.set('category', cat);
    if (diff !== 'random') params.set('difficulty', diff);
    const res = await fetch(`${API}/topics/random?${params}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      topic = data.topic;
    }
  } catch (_) {}

  if (!topic) {
    showToast('Unable to load a topic from the database');
    btn.disabled = false;
    btn.classList.remove('spinning');
    btn.textContent = '⚡ Spin!';
    return;
  }

  currentTopic = topic;

  document.getElementById('topic-label').textContent = (topic.category || 'general').toUpperCase().replace('-', ' ');

  const topicText = document.getElementById('topic-text');
  topicText.classList.remove('topic-reveal');
  void topicText.offsetWidth;
  topicText.textContent = topic.text;
  topicText.classList.add('topic-reveal');

  const diffClass = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }[topic.difficulty] || 'badge-medium';
  const catLabel = (topic.category || '').replace('-', ' ');
  document.getElementById('topic-meta').innerHTML = `
    <span class="badge badge-cat">${catLabel}</span>
    <span class="badge ${diffClass}">${topic.difficulty || 'medium'}</span>
  `;

  if (topic.exampleSentence) document.getElementById('hint-example-text').textContent = topic.exampleSentence;
  if (topic.speakingAngle) document.getElementById('hint-angle-text').textContent = topic.speakingAngle;


  btn.disabled = false;
  btn.classList.remove('spinning');
  btn.textContent = currentMode === 'vocab' ? '🎲 Get Vocab' : '⚡ Spin!';

  resetTimer();
}

async function loadStreak() {
  const streakEl = document.getElementById('stat-streak');
  if (!streakEl) return;

  if (!isLoggedIn()) {
    streakEl.textContent = '0';
    return;
  }

  try {
    const token = await getAuthToken();
    const res = await fetch(`${API}/sessions/streak`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Streak request failed');
    const data = await res.json();
    streakEl.textContent = data.streak || 0;
  } catch (error) {
    console.error('Streak error:', error);
  }
}

async function saveCompletedPractice() {
  if (!currentTopic) {
    showToast('Spin a topic first');
    return;
  }

  if (!isLoggedIn()) {
    showToast('Sign in to maintain your streak');
    return;
  }

  try {
    const token = await getAuthToken();
    const res = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        topicId: currentTopic._id,
        topicText: currentTopic.text,
        category: currentTopic.category,
        difficulty: currentTopic.difficulty
      })
    });

    if (!res.ok) throw new Error('Could not save practice');
    await loadStreak();
    showToast('Practice saved 🔥');
  } catch (error) {
    console.error('Save practice error:', error);
    showToast('Could not save your streak');
  }
}

// ---- HINTS ----
function toggleHint(type) {
  const el = document.getElementById('hint-' + type);
  el.classList.toggle('visible');
}

function copyTopic() {
  if (!currentTopic) return;
  navigator.clipboard.writeText(currentTopic.text).then(() => showToast('Topic copied!'));
}

// ---- SAMPLE ANSWER ----
const sampleAnswers = {
  star: (topic) => `<div class="sample-para"><strong style="color:var(--accent)">Situation:</strong> "${topic ? topic.text : 'Topic'}" — let me set the scene. Imagine it's 2019, and I've just been handed a project no one wanted...</div><div class="sample-para"><strong style="color:var(--accent)">Task:</strong> My responsibility was to turn what looked like a disaster into a win — with half the budget and twice the timeline pressure...</div><div class="sample-para"><strong style="color:var(--accent)">Action:</strong> I broke the problem into three phases. First, I spoke to every stakeholder individually. Then I built a 48-hour prototype. Finally, I presented results before anyone expected them...</div><div class="sample-para"><strong style="color:var(--accent)">Result:</strong> We not only delivered — we delivered early. The approach became the company template for all future sprints.</div>`,
  prep: (topic) => `<div class="sample-para"><strong style="color:var(--accent)">Point:</strong> On the question of "${topic ? topic.text.substring(0,50) : 'this topic'}..." — my answer is yes, and here's why it matters more than most people realize...</div><div class="sample-para"><strong style="color:var(--accent)">Reason:</strong> The data is clear: when you look at the last decade of research, the pattern emerges consistently across industries and cultures...</div><div class="sample-para"><strong style="color:var(--accent)">Example:</strong> Take Japan in 2020. When they implemented the four-day workweek at Microsoft, productivity jumped 40%. This wasn't an anomaly...</div><div class="sample-para"><strong style="color:var(--accent)">Point:</strong> So to bring it home — this isn't just about productivity or wellbeing. It's about reimagining what work is actually for.</div>`,
  ppf: (topic) => `<div class="sample-para"><strong style="color:var(--accent)">Past:</strong> Five years ago, nobody was talking about this. The conversation was happening in academic circles, if at all. The mainstream had no vocabulary for it...</div><div class="sample-para"><strong style="color:var(--accent)">Present:</strong> Today, we're in a fascinating inflection point. The tools exist. The awareness is there. But the will — and the infrastructure — are lagging behind...</div><div class="sample-para"><strong style="color:var(--accent)">Future:</strong> In ten years, I believe this becomes the default. Not because we chose it, but because the alternatives become untenable. The question isn't if — it's who leads the transition.</div>`,
  mece: (topic) => `<div class="sample-para"><strong style="color:var(--accent)">Bucket 1 — Individual:</strong> At the personal level, this breaks down into mindset, skill, and access. These three are mutually exclusive — having one doesn't give you the others...</div><div class="sample-para"><strong style="color:var(--accent)">Bucket 2 — Organizational:</strong> At the company level, we're looking at culture, process, and incentives. Again — three distinct levers, none of which substitutes for another...</div><div class="sample-para"><strong style="color:var(--accent)">Bucket 3 — Systemic:</strong> And at the macro level: policy, infrastructure, and norms. Collectively, these three buckets — nine factors total — cover the entire problem space with no overlap.</div>`
};

function showSampleAnswer() {
  const overlay = document.getElementById('sample-overlay');
  const heading = document.getElementById('sample-topic-heading');
  const content = document.getElementById('sample-content');
  
  heading.textContent = currentTopic ? currentTopic.text.substring(0, 60) + (currentTopic.text.length > 60 ? '...' : '') : 'Sample Answer';
  
  const fw = selectedFW || 'prep';
  const template = sampleAnswers[fw] || sampleAnswers.prep;
  content.innerHTML = template(currentTopic);
  overlay.classList.add('show');
}

function closeSampleAnswer(e) {
  if (!e || e.target === document.getElementById('sample-overlay') || e.target.classList.contains('close-modal')) {
    document.getElementById('sample-overlay').classList.remove('show');
  }
}

// ---- FRAMEWORKS ----
function toggleFW(id) {
  const card = document.getElementById('fw-' + id);
  const expanded = document.getElementById('fwe-' + id);
  const wasActive = card.classList.contains('active');
  
  document.querySelectorAll('.fw-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.fw-expanded').forEach(e => e.classList.remove('open'));
  
  if (!wasActive) {
    card.classList.add('active');
    expanded.classList.add('open');
    selectedFW = id;
  } else {
    selectedFW = null;
  }
}

// ---- TIMER ----
let activePreset = 30;

function setPreset(secs) {
  activePreset = secs;

  document.querySelectorAll('.preset-btn').forEach(button => {
    button.classList.remove('active');
  });

  const selectedButton = document.getElementById('preset-' + secs);
  if (selectedButton) selectedButton.classList.add('active');

  timerTotal = secs;
  timerSeconds = secs;
  resetTimer();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  const ring = document.getElementById('ring-fill');

  if (!display || !ring) return;

  display.textContent = formatTime(timerSeconds);
  display.className = 'timer-display';

  if (timerSeconds <= 10 && timerSeconds > 0 && timerRunning) {
    display.classList.add('urgent');
  }

  if (timerSeconds === 0) {
    display.classList.add('done');
  }

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = timerTotal > 0 ? timerSeconds / timerTotal : 0;
  const offset = circumference * (1 - progress);

  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${offset}`;

  if (timerSeconds === 0) {
    ring.style.stroke = 'var(--green)';
  } else if (timerSeconds <= 10 && timerRunning) {
    ring.style.stroke = 'var(--accent2)';
  } else {
    ring.style.stroke = 'var(--accent)';
  }
}

function startTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timer-start-btn').textContent = '▶ Resume';
    document.getElementById('timer-label').textContent = 'Paused';
    updateTimerDisplay();
    return;
  }

  if (timerSeconds === 0) {
    resetTimer();
    return;
  }

  timerRunning = true;
  document.getElementById('timer-start-btn').textContent = '⏸ Pause';
  document.getElementById('timer-label').textContent = 'Speaking now...';
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    updateTimerDisplay();

    if (timerSeconds === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      document.getElementById('timer-start-btn').textContent = '▶ Start';
      document.getElementById('timer-label').textContent = "Time's up! Great job.";
      updateTimerDisplay();
      saveCompletedPractice();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerSeconds = activePreset;
  timerTotal = activePreset;

  const startButton = document.getElementById('timer-start-btn');
  const label = document.getElementById('timer-label');

  if (startButton) startButton.textContent = '▶ Start';
  if (label) label.textContent = 'Set your time';

  updateTimerDisplay();
}

// ---- VIEWS ----
function showView(view) {
  if (view === 'main') {
    document.getElementById('view-main').classList.add('active');
  }
}

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---- LOGO CLICK ----
document.querySelector('.logo').addEventListener('click', () => showView('main'));
document.getElementById('view-main').classList.add('active');

// ---- INIT ----
updateTimerDisplay();

