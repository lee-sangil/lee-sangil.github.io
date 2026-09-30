import { db, ref, get, runTransaction } from '/assets/js/firebase-init.js';

const countEl = document.getElementById('visitor-count');
const countRef = ref(db, 'visitors');
const sessionKey = 'visitor-counted';
const kstOffset = 9 * 60 * 60 * 1000;
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
  const lang = localStorage.getItem('site-lang') === 'ko' ? 'ko' : 'en';
  const labels = lang === 'ko' ? ['오늘', '어제', '전체'] : ['Today', 'Yesterday', 'Total'];
  const date = counts ? kstDate() : null;
  const values = counts ? [
    counts.date === date ? counts.today : 0,
    counts.date === yesterday(date) ? counts.today : counts.date === date ? counts.yesterday : 0,
    counts.total
  ] : ['—', '—', '—'];
  countEl.textContent = labels.map((label, i) => `${label} ${values[i]}`).join(' / ');
}

window.addEventListener('site-lang-change', render);
function refreshAtMidnight() {
  setTimeout(async () => {
    try {
      await syncClock();
      render();
      refreshAtMidnight();
    } catch (error) {
      console.error('Time API unavailable:', error);
      setTimeout(refreshAtMidnight, 60000);
    }
  }, 86400000 - (currentTime() + kstOffset) % 86400000 + 1000);
}

try {
  await syncClock();
  refreshAtMidnight();
  render();
  const snapshot = sessionStorage.getItem(sessionKey)
    ? await get(countRef)
    : (await runTransaction(countRef, (current) => {
        const date = kstDate();
        const previous = current || {};
        const sameDay = previous.date === date;
        return {
          date,
          today: (sameDay ? previous.today || 0 : 0) + 1,
          yesterday: sameDay ? previous.yesterday || 0
            : previous.date === yesterday(date) ? previous.today || 0 : 0,
          total: (previous.total || 0) + 1
        };
      })).snapshot;
  counts = snapshot.val();
  if (!sessionStorage.getItem(sessionKey)) sessionStorage.setItem(sessionKey, '1');
  render();
} catch (error) {
  console.error('Visitor count unavailable:', error);
}
