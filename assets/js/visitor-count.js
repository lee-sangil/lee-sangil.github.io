import { db, ref, onValue, runTransaction } from '/assets/js/firebase-init.js';

const countEl = document.getElementById('visitor-count');
const countRef = ref(db, 'visitors');
const storageKey = 'visitor-daily';
const kstOffset = 9 * 60 * 60 * 1000;
let dwellTimer;
let midnightTimer;
let unsubscribe;
let leftPage = false;
let pending = false;
let ready = false;
let serverTime;
let syncedAt;
let counts = null;

async function syncClock() {
  const response = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia%2FSeoul', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Time API returned ${response.status}`);
  const { year, month, day, hour, minute, seconds, milliSeconds } = await response.json();
  serverTime = Date.UTC(year, month - 1, day, hour - 9, minute, seconds, milliSeconds);
  syncedAt = performance.now();
}

function currentTime() {
  return serverTime + performance.now() - syncedAt;
}

function kstDate() {
  return new Date(currentTime() + kstOffset).toISOString().slice(0, 10);
}

function yesterday(date) {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}

function render() {
  let lang = 'en';
  try { lang = localStorage.getItem('site-lang') === 'ko' ? 'ko' : 'en'; } catch (_) {}
  const labels = lang === 'ko' ? ['오늘', '어제', '전체'] : ['Today', 'Yesterday', 'Total'];
  const date = counts ? kstDate() : null;
  const values = counts ? [
    counts.date === date ? counts.today : 0,
    counts.date === yesterday(date) ? counts.today : counts.date === date ? counts.yesterday : 0,
    counts.total
  ] : ['—', '—', '—'];
  countEl.textContent = labels.map((label, i) => `${label} ${values[i]}`).join(' / ');
}

// Keep just two days of receipts so a committed request can safely be retried
// after navigation, even if localStorage was not updated before the page closed.
function recordVisit(previous, date, id) {
  previous = previous || {};
  if (previous.date && previous.date > date) {
    if (yesterday(previous.date) !== date) return;
    const ids = previous.yesterdayIds || {};
    if (ids[id]) return previous;
    return { ...previous, yesterday: (previous.yesterday || 0) + 1,
      total: (previous.total || 0) + 1, yesterdayIds: { ...ids, [id]: true } };
  }
  const sameDay = previous.date === date;
  const ids = sameDay ? previous.todayIds || {} : {};
  if (ids[id]) return previous;
  const consecutive = previous.date === yesterday(date);
  return {
    date,
    today: (sameDay ? previous.today || 0 : 0) + 1,
    yesterday: sameDay ? previous.yesterday || 0 : consecutive ? previous.today || 0 : 0,
    total: (previous.total || 0) + 1,
    todayIds: { ...ids, [id]: true },
    yesterdayIds: sameDay ? previous.yesterdayIds || {} : consecutive ? previous.todayIds || {} : {}
  };
}

async function countVisit() {
  if (pending || leftPage || document.hidden) return;
  pending = true;
  try {
    // A shared lock also serializes first-time creation of the browser ID.
    // Without safe storage/locking, keep displaying counts but do not risk duplicates.
    if (!navigator.locks) return;
    await navigator.locks.request('visitor-daily', async () => {
      if (leftPage || document.hidden) return;
      const date = kstDate();
      let browser;
      try { browser = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (_) {}
      if (!browser || !/^[a-f0-9-]{36}$/i.test(browser.id || '')) {
        browser = { id: crypto.randomUUID(), date: null };
        localStorage.setItem(storageKey, JSON.stringify(browser));
      }
      if (browser.date && browser.date >= date) return;
      const result = await runTransaction(countRef,
        (previous) => recordVisit(previous, date, browser.id), { applyLocally: false });
      if (result.committed) {
        browser.date = date;
        localStorage.setItem(storageKey, JSON.stringify(browser));
      }
    });
  } catch (error) {
    console.error('Visitor count unavailable:', error);
  } finally {
    pending = false;
  }
}

function scheduleVisit() {
  clearTimeout(dwellTimer);
  if (!ready || leftPage || document.hidden) return;
  dwellTimer = setTimeout(countVisit, 5000);
}

function listen() {
  if (unsubscribe) return;
  unsubscribe = onValue(countRef, (snapshot) => {
    counts = snapshot.val();
    render();
  }, (error) => console.error('Visitor count unavailable:', error));
}

function refreshAtMidnight() {
  clearTimeout(midnightTimer);
  midnightTimer = setTimeout(async () => {
    try {
      await syncClock();
      render();
      scheduleVisit();
      refreshAtMidnight();
    } catch (error) {
      console.error('Time API unavailable:', error);
      midnightTimer = setTimeout(refreshAtMidnight, 60000);
    }
  }, 86400000 - (currentTime() + kstOffset) % 86400000 + 1000);
}

window.addEventListener('site-lang-change', render);
window.addEventListener('pagehide', () => {
  leftPage = true;
  clearTimeout(dwellTimer);
  clearTimeout(midnightTimer);
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
});
window.addEventListener('pageshow', () => {
  leftPage = false;
  if (!ready) return;
  listen();
  refreshAtMidnight();
  scheduleVisit();
});
document.addEventListener('visibilitychange', scheduleVisit);
// Also handles a sleeping computer waking after midnight and transient write errors.
setInterval(scheduleVisit, 60000);

try {
  await syncClock();
  ready = true;
  render();
  if (!leftPage) {
    listen();
    refreshAtMidnight();
    scheduleVisit();
  }
} catch (error) {
  console.error('Visitor count unavailable:', error);
}
