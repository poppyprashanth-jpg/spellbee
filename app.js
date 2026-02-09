const state = {
  entries: [],
  levels: ["One Bee", "Two Bee", "Three Bee"],
  currentStudyWord: null,
  sessionId: null,
  sessionStartedAt: null,
  testSession: null,
  testCurrentIndex: 0,
  testStartedAt: null,
  currentProfileId: null,
  dictCache: new Map(),
};

const ui = {
  modeButtons: document.querySelectorAll(".mode-btn"),
  sections: document.querySelectorAll(".panel-section"),
  studyLevel: document.getElementById("study-level"),
  studySearch: document.getElementById("study-search"),
  studySchoolOnly: document.getElementById("study-school-only"),
  studyMissedOnly: document.getElementById("study-missed-only"),
  studyShuffle: document.getElementById("study-shuffle"),
  studyPrompt: document.getElementById("study-prompt"),
  studyWord: document.getElementById("study-word"),
  studyStreak: document.getElementById("study-streak"),
  studyLevelLabel: document.getElementById("study-level-label"),
  studyDefinition: document.getElementById("study-definition"),
  studyAudio: document.getElementById("study-audio"),
  studySlow: document.getElementById("study-slow"),
  studyNext: document.getElementById("study-next"),
  studyInput: document.getElementById("study-input"),
  studySubmit: document.getElementById("study-submit"),
  studyFeedback: document.getElementById("study-feedback"),
  studyGoalText: document.getElementById("study-goal-text"),
  studyGoalFill: document.getElementById("study-goal-fill"),
  studySplash: document.getElementById("study-splash"),
  testLevel: document.getElementById("test-level"),
  testSchoolOnly: document.getElementById("test-school-only"),
  testCount: document.getElementById("test-count"),
  testStart: document.getElementById("test-start"),
  testAudio: document.getElementById("test-audio"),
  testSlow: document.getElementById("test-slow"),
  testInput: document.getElementById("test-input"),
  testSubmit: document.getElementById("test-submit"),
  testFeedback: document.getElementById("test-feedback"),
  testStatus: document.getElementById("test-status"),
  testTimer: document.getElementById("test-timer"),
  testSplash: document.getElementById("test-splash"),
  progressReset: document.getElementById("progress-reset"),
  statOverall: document.getElementById("stat-overall"),
  statStudied: document.getElementById("stat-studied"),
  statLevels: document.getElementById("stat-levels"),
  statSession: document.getElementById("stat-session"),
  statAverageTime: document.getElementById("stat-average-time"),
  statTotalAttempts: document.getElementById("stat-total-attempts"),
  statSessionStart: document.getElementById("stat-session-start"),
  statAttempts: document.getElementById("stat-attempts"),
  statWrongWords: document.getElementById("stat-wrong-words"),
  profileSelect: document.getElementById("profile-select"),
  profileName: document.getElementById("profile-name"),
  profileCreate: document.getElementById("profile-create"),
  profileDelete: document.getElementById("profile-delete"),
  mwKey: document.getElementById("mw-key"),
  mwType: document.getElementById("mw-type"),
  ttsVoice: document.getElementById("tts-voice"),
  ttsSpeed: document.getElementById("tts-speed"),
  mwSave: document.getElementById("mw-save"),
};

function normalize(word) {
  return word
    .toLowerCase()
    .replace(/[\s\-']/g, "")
    .trim();
}

function getStoredSettings() {
  return {
    key: localStorage.getItem("mwApiKey") || "",
    type: localStorage.getItem("mwApiType") || "collegiate",
    ttsVoice: localStorage.getItem("ttsVoice") || "",
    ttsSpeed: Number(localStorage.getItem("ttsSpeed") || "0.8"),
  };
}

function saveSettings() {
  localStorage.setItem("mwApiKey", ui.mwKey.value.trim());
  localStorage.setItem("mwApiType", ui.mwType.value);
  localStorage.setItem("ttsVoice", ui.ttsVoice.value);
  localStorage.setItem("ttsSpeed", ui.ttsSpeed.value);
  ui.mwSave.textContent = "Saved!";
  setTimeout(() => (ui.mwSave.textContent = "Save Settings"), 1200);
}

function getProgress() {
  const raw = localStorage.getItem(`spellbeeProgress:${state.currentProfileId}`);
  return raw
    ? JSON.parse(raw)
    : { attempts: {}, studied: {}, totals: { correct: 0, wrong: 0 } };
}

function setProgress(progress) {
  localStorage.setItem(`spellbeeProgress:${state.currentProfileId}`, JSON.stringify(progress));
}

function getAttemptLog() {
  const raw = localStorage.getItem(`spellbeeAttempts:${state.currentProfileId}`);
  return raw ? JSON.parse(raw) : [];
}

function setAttemptLog(attempts) {
  localStorage.setItem(`spellbeeAttempts:${state.currentProfileId}`, JSON.stringify(attempts));
}

function getReviewMap() {
  const raw = localStorage.getItem(`spellbeeReview:${state.currentProfileId}`);
  return raw ? JSON.parse(raw) : {};
}

function setReviewMap(map) {
  localStorage.setItem(`spellbeeReview:${state.currentProfileId}`, JSON.stringify(map));
}

function getReviewMap() {
  const raw = localStorage.getItem(`spellbeeReview:${state.currentProfileId}`);
  return raw ? JSON.parse(raw) : {};
}

function setReviewMap(map) {
  localStorage.setItem(`spellbeeReview:${state.currentProfileId}`, JSON.stringify(map));
}

function getStudyStreak() {
  const raw = localStorage.getItem(`spellbeeStreak:${state.currentProfileId}`);
  return raw ? Number(raw) : 0;
}

function setStudyStreak(value) {
  localStorage.setItem(`spellbeeStreak:${state.currentProfileId}`, String(value));
}

function getDailyGoalCount() {
  const key = `spellbeeDailyGoal:${state.currentProfileId}`;
  const today = new Date().toISOString().slice(0, 10);
  const raw = localStorage.getItem(key);
  if (!raw) return { date: today, count: 0 };
  const data = JSON.parse(raw);
  if (data.date !== today) return { date: today, count: 0 };
  return data;
}

function setDailyGoalCount(data) {
  const key = `spellbeeDailyGoal:${state.currentProfileId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

function updateDailyGoalUI() {
  if (!ui.studyGoalText || !ui.studyGoalFill) return;
  const goal = 20;
  const data = getDailyGoalCount();
  ui.studyGoalText.textContent = `Daily goal: ${data.count} / ${goal}`;
  const pct = Math.min(100, Math.round((data.count / goal) * 100));
  ui.studyGoalFill.style.width = `${pct}%`;
}

function getDailyGoalCount() {
  const key = `spellbeeDailyGoal:${state.currentProfileId}`;
  const today = new Date().toISOString().slice(0, 10);
  const raw = localStorage.getItem(key);
  if (!raw) return { date: today, count: 0 };
  const data = JSON.parse(raw);
  if (data.date !== today) return { date: today, count: 0 };
  return data;
}

function setDailyGoalCount(data) {
  const key = `spellbeeDailyGoal:${state.currentProfileId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

function updateDailyGoalUI() {
  if (!ui.studyGoalText || !ui.studyGoalFill) return;
  const goal = 20;
  const data = getDailyGoalCount();
  ui.studyGoalText.textContent = `Daily goal: ${data.count} / ${goal}`;
  const pct = Math.min(100, Math.round((data.count / goal) * 100));
  ui.studyGoalFill.style.width = `${pct}%`;
}

function recordAttempt(word, correct) {
  const progress = getProgress();
  if (!progress.attempts[word]) {
    progress.attempts[word] = { correct: 0, wrong: 0 };
  }
  if (correct) {
    progress.attempts[word].correct += 1;
    progress.totals.correct += 1;
  } else {
    progress.attempts[word].wrong += 1;
    progress.totals.wrong += 1;
  }
  setProgress(progress);
  renderProgress();
}

function recordAttemptExtended(word, correct, mode, durationMs) {
  recordAttempt(word, correct);
  const attempts = getAttemptLog();
  attempts.push({
    ts: new Date().toISOString(),
    word,
    correct,
    mode,
    durationMs,
    sessionId: state.sessionId,
  });
  setAttemptLog(attempts);
  renderProgress();
}

function saveTestSession() {
  if (!state.testSession) return;
  localStorage.setItem(`spellbeeTestSession:${state.currentProfileId}`, JSON.stringify(state.testSession));
}

function loadTestSession() {
  const raw = localStorage.getItem(`spellbeeTestSession:${state.currentProfileId}`);
  return raw ? JSON.parse(raw) : null;
}

function clearTestSession() {
  localStorage.removeItem(`spellbeeTestSession:${state.currentProfileId}`);
}

function getUsedTestWords(level, schoolOnly) {
  const key = `spellbeeTestUsed:${state.currentProfileId}:${level}:${schoolOnly ? "school" : "all"}`;
  const raw = localStorage.getItem(key);
  return raw ? new Set(JSON.parse(raw)) : new Set();
}

function setUsedTestWords(level, schoolOnly, usedSet) {
  const key = `spellbeeTestUsed:${state.currentProfileId}:${level}:${schoolOnly ? "school" : "all"}`;
  localStorage.setItem(key, JSON.stringify([...usedSet]));
}

function markStudied(word) {
  const progress = getProgress();
  progress.studied[word] = true;
  setProgress(progress);
  renderProgress();
}

function getMissedWordsSet() {
  const progress = getProgress();
  const missed = Object.entries(progress.attempts)
    .filter(([, stats]) => stats.wrong > 0)
    .map(([word]) => word);
  return new Set(missed);
}

function renderProgress() {
  if (!ui.statOverall) return;
  const progress = getProgress();
  const total = progress.totals.correct + progress.totals.wrong;
  const accuracy = total ? Math.round((progress.totals.correct / total) * 100) : 0;
  ui.statOverall.textContent = `${progress.totals.correct} correct / ${progress.totals.wrong} incorrect · ${accuracy}% accuracy`;
  ui.statStudied.textContent = `${Object.keys(progress.studied).length} words marked studied`;

  ui.statLevels.innerHTML = "";
  state.levels.forEach((level) => {
    const levelWords = state.entries.filter((entry) => entry.level === level).map((entry) => entry.word);
    const studied = levelWords.filter((w) => progress.studied[w]).length;
    const li = document.createElement("li");
    li.textContent = `${level}: ${studied} / ${levelWords.length} studied`;
    ui.statLevels.appendChild(li);
  });

  const attempts = getAttemptLog();
  const sessionAttempts = attempts.filter((item) => item.sessionId === state.sessionId);
  const avgMs = sessionAttempts.length
    ? Math.round(sessionAttempts.reduce((sum, item) => sum + (item.durationMs || 0), 0) / sessionAttempts.length)
    : 0;
  ui.statSession.textContent = `Session attempts: ${sessionAttempts.length}`;
  ui.statAverageTime.textContent = `Average time: ${avgMs} ms`;
  ui.statTotalAttempts.textContent = `Total attempts (all time): ${attempts.length}`;
  ui.statSessionStart.textContent = `Session started: ${new Date(state.sessionStartedAt).toLocaleString()}`;

  ui.statAttempts.innerHTML = "";
  attempts.slice(-30).reverse().forEach((item) => {
    const li = document.createElement("li");
    const time = new Date(item.ts).toLocaleString();
    const duration = item.durationMs ? `${item.durationMs} ms` : "n/a";
    li.textContent = `${time} · ${item.mode} · ${item.word} · ${item.correct ? "correct" : "wrong"} · ${duration}`;
    ui.statAttempts.appendChild(li);
  });

  if (ui.statWrongWords) {
    const wrongWords = Object.entries(progress.attempts)
      .filter(([, stats]) => stats.wrong > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong);
    ui.statWrongWords.innerHTML = "";
    if (!wrongWords.length) {
      const li = document.createElement("li");
      li.textContent = "No missed words yet.";
      ui.statWrongWords.appendChild(li);
    } else {
      wrongWords.slice(0, 50).forEach(([word, stats]) => {
        const li = document.createElement("li");
        li.textContent = `${word} · missed ${stats.wrong}x`;
        ui.statWrongWords.appendChild(li);
      });
    }
  }
}

function populateLevelSelect(select) {
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select Level";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);
  state.levels.forEach((level) => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level;
    select.appendChild(option);
  });
}

function getEntries(level, schoolOnly) {
  return state.entries.filter((entry) => {
    if (level !== "all" && entry.level !== level) return false;
    if (schoolOnly && !entry.schoolList) return false;
    return true;
  });
}

function getLevelWords(level, schoolOnly) {
  return getEntries(level, schoolOnly).map((entry) => entry.word);
}

function pickRandom(words) {
  if (!words.length) return null;
  return words[Math.floor(Math.random() * words.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

 

async function fetchDictionaryEntry(word) {
  if (state.dictCache.has(word)) return state.dictCache.get(word);
  const { key, type } = getStoredSettings();
  if (!key) return null;
  const url = `https://www.dictionaryapi.com/api/v3/references/${type}/json/${encodeURIComponent(word)}?key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length || typeof data[0] === "string") {
      return null;
    }
    const entry = data[0];
    const shortdef = entry.shortdef ? entry.shortdef[0] : "";
    let audio = null;
    const sound = entry.hwi && entry.hwi.prs && entry.hwi.prs[0] && entry.hwi.prs[0].sound;
    if (sound && sound.audio) {
      const audioName = sound.audio;
      let subdir = audioName[0];
      if (audioName.startsWith("bix")) subdir = "bix";
      else if (audioName.startsWith("gg")) subdir = "gg";
      else if (/^[0-9]/.test(audioName)) subdir = "number";
      audio = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioName}.mp3`;
    }
    const result = { definition: shortdef, audio };
    state.dictCache.set(word, result);
    return result;
  } catch (error) {
    return null;
  }
}

async function playAudioFor(word) {
  const settings = getStoredSettings();
  if (!("speechSynthesis" in window)) return false;
  const utterance = new SpeechSynthesisUtterance(word);
  const voices = speechSynthesis.getVoices();
  const selected = voices.find((voice) => voice.name === settings.ttsVoice);
  if (selected) utterance.voice = selected;
  let rate = settings.ttsSpeed;
  if (ui.studySlow && ui.studySlow.checked) rate = 0.75;
  if (ui.testSlow && ui.testSlow.checked) rate = 0.7;
  utterance.rate = rate;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}

async function updateStudyWord(word) {
  if (!word) return;
  state.currentStudyWord = word;
  ui.studyWord.textContent = "••••";
  const entry = state.entries.find((item) => item.word === word);
  if (entry) {
    ui.studyLevelLabel.textContent = entry.schoolList
      ? `${entry.level} • School List`
      : entry.level;
  } else {
    ui.studyLevelLabel.textContent = "";
  }
  ui.studyInput.value = "";
  ui.studyFeedback.textContent = "";
  ui.studyFeedback.className = "quiz-feedback";
  
  const entryData = await fetchDictionaryEntry(word);
  ui.studyDefinition.textContent = entryData && entryData.definition
    ? entryData.definition
    : "Set your dictionary key in Settings to fetch definitions.";
  await playAudioFor(word);
}

function renderStudyList() {
  const level = ui.studyLevel.value;
  if (!level) return;
  const schoolOnly = ui.studySchoolOnly.checked;
  const missedOnly = ui.studyMissedOnly && ui.studyMissedOnly.checked;
  const search = ui.studySearch.value.trim().toLowerCase();
  let words = getLevelWords(level, schoolOnly).filter((w) => w.toLowerCase().includes(search));
  if (missedOnly) {
    const missed = getMissedWordsSet();
    words = words.filter((w) => missed.has(w));
  }
  if (!state.currentStudyWord && words.length) {
    updateStudyWord(words[0]);
  }
}

function setupStudy() {
  if (!ui.studyLevel) return;
  populateLevelSelect(ui.studyLevel);
  ui.studyLevel.addEventListener("change", renderStudyList);
  ui.studySearch.addEventListener("input", renderStudyList);
  ui.studySchoolOnly.addEventListener("change", renderStudyList);
  if (ui.studyMissedOnly) ui.studyMissedOnly.addEventListener("change", renderStudyList);
  ui.studyShuffle.addEventListener("click", () => {
    if (!ui.studyLevel.value) return;
    const word = pickStudyWord();
    updateStudyWord(word);
  });
  ui.studyNext.addEventListener("click", () => {
    if (!ui.studyLevel.value) return;
    const word = pickStudyWord();
    updateStudyWord(word);
  });
  const checkStudyAnswer = () => {
    if (!state.currentStudyWord) return;
    const guess = normalize(ui.studyInput.value);
    const answer = normalize(state.currentStudyWord);
    const correct = guess === answer;
    const durationMs = state.sessionStartedAt ? Date.now() - state.sessionStartedAt : null;
    recordAttemptExtended(state.currentStudyWord, correct, "study", durationMs);
    ui.studyFeedback.textContent = correct
      ? "Correct!"
      : `Not quite. The correct spelling is “${state.currentStudyWord}.”`;
    ui.studyFeedback.className = `quiz-feedback ${correct ? "is-good" : "is-bad"}`;
    ui.studyWord.textContent = state.currentStudyWord;
    if (ui.studySplash) {
      showSplash(ui.studySplash, state.currentStudyWord, false);
    }
    if (correct) {
      const daily = getDailyGoalCount();
      daily.count += 1;
      setDailyGoalCount(daily);
      updateDailyGoalUI();
    }
    updateReviewSchedule(state.currentStudyWord, correct);
    const streak = correct ? getStudyStreak() + 1 : 0;
    setStudyStreak(streak);
    if (ui.studyStreak) {
      ui.studyStreak.textContent = `Streak: ${streak}`;
      ui.studyStreak.classList.remove("streak-badge");
      if (correct && streak > 0) {
        void ui.studyStreak.offsetWidth;
        ui.studyStreak.classList.add("streak-badge");
      }
    }
  };
  if (ui.studySubmit) {
    ui.studySubmit.addEventListener("click", checkStudyAnswer);
  }
  ui.studyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkStudyAnswer();
  });
  
  ui.studyAudio.addEventListener("click", async () => {
    if (!state.currentStudyWord) return;
    const played = await playAudioFor(state.currentStudyWord);
    if (!played) ui.studyDefinition.textContent = "No audio found for this word.";
  });
  if (ui.studyStreak) ui.studyStreak.textContent = `Streak: ${getStudyStreak()}`;
  updateDailyGoalUI();
  renderStudyList();
}

function pickStudyWord() {
  const level = ui.studyLevel.value;
  const schoolOnly = ui.studySchoolOnly.checked;
  const missedOnly = ui.studyMissedOnly && ui.studyMissedOnly.checked;
  if (!level) return null;
  let words = getLevelWords(level, schoolOnly);
  if (missedOnly) {
    const missed = getMissedWordsSet();
    words = words.filter((w) => missed.has(w));
  }
  if (!words.length) return null;
  const now = Date.now();
  const reviewMap = getReviewMap();
  const due = words.filter((w) => reviewMap[w] && reviewMap[w].nextReview <= now);
  if (due.length) return pickRandom(due);
  const missed = getMissedWordsSet();
  const weighted = [];
  words.forEach((word) => {
    const weight = missed.has(word) ? 3 : 1;
    for (let i = 0; i < weight; i += 1) weighted.push(word);
  });
  return pickRandom(weighted);
}

function updateReviewSchedule(word, correct) {
  const map = getReviewMap();
  const current = map[word] || { intervalHours: 0.2, nextReview: Date.now() };
  const interval = correct ? Math.min(72, current.intervalHours * 2) : 0.2;
  map[word] = {
    intervalHours: interval,
    nextReview: Date.now() + interval * 60 * 60 * 1000,
  };
  setReviewMap(map);
}

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 1;
  const matches = cleaned.match(/[aeiouy]+/g);
  return matches ? matches.length : 1;
}

function showSplash(target, text, isWrong) {
  if (!target) return;
  target.textContent = text;
  target.classList.toggle("is-wrong", !!isWrong);
  target.classList.add("is-showing");
  const dismiss = () => {
    target.classList.remove("is-showing");
    document.removeEventListener("click", dismiss, true);
    document.removeEventListener("keydown", dismiss, true);
  };
  document.addEventListener("click", dismiss, true);
  document.addEventListener("keydown", dismiss, true);
}

function setupTest() {
  if (!ui.testLevel) return;
  populateLevelSelect(ui.testLevel);
  ui.testStart.addEventListener("click", startTest);
  ui.testSubmit.addEventListener("click", submitTestAnswer);
  ui.testInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitTestAnswer();
  });
  ui.testAudio.addEventListener("click", async () => {
    if (!state.testSession || !state.testSession.items[state.testCurrentIndex]) return;
    const word = state.testSession.items[state.testCurrentIndex];
    const played = await playAudioFor(word);
    if (!played) ui.testFeedback.textContent = "No audio found for this word.";
  });
}


function setupProgress() {
  ui.progressReset.addEventListener("click", () => {
    localStorage.removeItem(`spellbeeProgress:${state.currentProfileId}`);
    localStorage.removeItem(`spellbeeAttempts:${state.currentProfileId}`);
    renderProgress();
  });
  renderProgress();
}

function getProfiles() {
  const raw = localStorage.getItem("spellbeeProfiles");
  if (raw) return JSON.parse(raw);
  const defaultProfile = { id: `profile_${Date.now()}`, name: "Default" };
  localStorage.setItem("spellbeeProfiles", JSON.stringify([defaultProfile]));
  localStorage.setItem("spellbeeCurrentProfile", defaultProfile.id);
  return [defaultProfile];
}

function saveProfiles(profiles) {
  localStorage.setItem("spellbeeProfiles", JSON.stringify(profiles));
}

function setCurrentProfile(id) {
  state.currentProfileId = id;
  localStorage.setItem("spellbeeCurrentProfile", id);
  renderProgress();
}

function ensureProfile() {
  const profiles = getProfiles();
  let current = localStorage.getItem("spellbeeCurrentProfile");
  if (current && profiles.find((p) => p.id === current)) {
    state.currentProfileId = current;
    return;
  }
  const profile = { id: `profile_${Date.now()}`, name: "Player" };
  profiles.push(profile);
  saveProfiles(profiles);
  setCurrentProfile(profile.id);
}

function renderProfiles() {
  if (!ui.profileSelect) return;
  const profiles = getProfiles();
  ui.profileSelect.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    ui.profileSelect.appendChild(option);
  });
  ui.profileSelect.value = state.currentProfileId;
}

function setupProfiles() {
  if (!ui.profileSelect) return;
  const profiles = getProfiles();
  const current = localStorage.getItem("spellbeeCurrentProfile") || profiles[0].id;
  state.currentProfileId = current;
  renderProfiles();
  ui.profileSelect.addEventListener("change", () => {
    setCurrentProfile(ui.profileSelect.value);
    renderProgress();
  });
  ui.profileCreate.addEventListener("click", () => {
    const name = ui.profileName.value.trim();
    if (!name) return;
    const list = getProfiles();
    const profile = { id: `profile_${Date.now()}`, name };
    list.push(profile);
    saveProfiles(list);
    ui.profileName.value = "";
    setCurrentProfile(profile.id);
    renderProfiles();
  });
  ui.profileDelete.addEventListener("click", () => {
    const list = getProfiles();
    if (list.length <= 1) return;
    const next = list.filter((p) => p.id !== state.currentProfileId);
    saveProfiles(next);
    const newCurrent = next[0].id;
    setCurrentProfile(newCurrent);
    renderProfiles();
  });
}

function setupSettings() {
  const settings = getStoredSettings();
  ui.mwKey.value = settings.key;
  ui.mwType.value = settings.type;
  populateVoices();
  ui.ttsVoice.value = settings.ttsVoice;
  ui.ttsSpeed.value = settings.ttsSpeed;
  ui.mwSave.addEventListener("click", saveSettings);
}

function populateVoices() {
  if (!("speechSynthesis" in window)) return;
  const current = ui.ttsVoice.value;
  const voices = speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en"));
  ui.ttsVoice.innerHTML = '<option value=\"\">Default voice</option>';
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    ui.ttsVoice.appendChild(option);
  });
  if (current) {
    ui.ttsVoice.value = current;
  } else {
    ui.ttsVoice.value = "";
  }
}

function setupModeSwitching() {
  if (!document.getElementById("mode-study-group")) return;
  const studyGroup = document.getElementById("mode-study-group");
  ui.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      ui.modeButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const mode = button.dataset.mode;
      if (mode === "study") {
        studyGroup.classList.remove("is-hidden");
        ui.sections.forEach((section) => {
          if (section.id === "mode-progress" || section.id === "mode-settings") {
            section.classList.add("is-hidden");
          }
        });
        return;
      }
      studyGroup.classList.add("is-hidden");
      ui.sections.forEach((section) => {
        section.classList.toggle("is-hidden", section.id !== `mode-${mode}`);
      });
    });
  });
}

function startTest() {
  const level = ui.testLevel.value;
  if (!level) return;
  const schoolOnly = ui.testSchoolOnly.checked;
  const count = Math.max(5, Math.min(50, Number(ui.testCount.value) || 10));
  const pool = getLevelWords(level, schoolOnly);
  let used = getUsedTestWords(level, schoolOnly);
  let available = pool.filter((word) => !used.has(word));
  if (available.length < count) {
    used = new Set();
    available = [...pool];
  }
  const items = shuffle(available).slice(0, count);
  items.forEach((word) => used.add(word));
  setUsedTestWords(level, schoolOnly, used);
  state.testSession = {
    id: `test_${Date.now()}`,
    startedAt: Date.now(),
    currentIndex: 0,
    total: items.length,
    correct: 0,
    wrong: 0,
    items,
    completed: false,
  };
  state.testCurrentIndex = 0;
  state.testStartedAt = Date.now();
  saveTestSession();
  renderTestStatus();
  const word = state.testSession.items[state.testCurrentIndex];
  if (word) playAudioFor(word);
}




function renderTestStatus() {
  if (!state.testSession) {
    ui.testStatus.textContent = "";
    ui.testTimer.textContent = "";
    return;
  }
  const idx = state.testCurrentIndex + 1;
  ui.testStatus.textContent = `Question ${idx} of ${state.testSession.total} · Correct ${state.testSession.correct} / Wrong ${state.testSession.wrong}`;
  const elapsed = Date.now() - state.testSession.startedAt;
  ui.testTimer.textContent = `Elapsed: ${Math.floor(elapsed / 1000)}s`;
  ui.testInput.value = "";
  ui.testFeedback.textContent = "";
  ui.testFeedback.className = "quiz-feedback";
}

function submitTestAnswer() {
  if (!state.testSession) return;
  const word = state.testSession.items[state.testCurrentIndex];
  if (!word) return;
  const guess = normalize(ui.testInput.value);
  const answer = normalize(word);
  const correct = guess === answer;
  const durationMs = state.testStartedAt ? Date.now() - state.testStartedAt : null;
  recordAttemptExtended(word, correct, "test", durationMs);
  if (correct) state.testSession.correct += 1;
  else state.testSession.wrong += 1;
  ui.testFeedback.textContent = correct
    ? "Correct!"
    : `Not quite. The correct spelling is “${word}.”`;
  ui.testFeedback.className = `quiz-feedback ${correct ? "is-good" : "is-bad"}`;
  if (ui.testSplash) {
    showSplash(ui.testSplash, word, !correct);
  }
  state.testCurrentIndex += 1;
  state.testSession.currentIndex = state.testCurrentIndex;
  state.testStartedAt = Date.now();
  if (state.testCurrentIndex >= state.testSession.total) {
    state.testSession.completed = true;
    saveTestSession();
    ui.testStatus.textContent = `Finished! Correct ${state.testSession.correct} / Wrong ${state.testSession.wrong}`;
    ui.testTimer.textContent = "";
    clearTestSession();
    return;
  }
  saveTestSession();
  renderTestStatus();
  const nextWord = state.testSession.items[state.testCurrentIndex];
  if (nextWord) playAudioFor(nextWord);
}

async function init() {
  ensureProfile();
  setupProfiles();
  state.sessionId = `sess_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  state.sessionStartedAt = Date.now();
  const data = window.SPELLBEE_DATA;
  state.entries = data.words;
  state.levels = data.levels;
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }
  setupModeSwitching();
  setupStudy();
  setupTest();
  setupProgress();
  setupSettings();
  renderProgress();
}

init();
