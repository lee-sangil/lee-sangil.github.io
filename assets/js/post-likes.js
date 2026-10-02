// Metadata and footer share one subscription, transaction queue, and liked state.
const initialized = new Set();

export async function initLikes(postUrl) {
  if (initialized.has(postUrl)) return;
  initialized.add(postUrl);
  const buttons = [...document.querySelectorAll('[data-post-like]')];
  const counts = [...document.querySelectorAll('[data-post-like-count]')];
  if (!buttons.length) return;
  const postId = btoa(String.fromCharCode(...new TextEncoder().encode(postUrl)))
    .replace(/\//g, '_').replace(/=/g, '');
  const storageKey = `like_${postId}`;
  let ready = false;
  let busy = false;

  function updateLikedState() {
    const liked = localStorage.getItem(storageKey) === 'true';
    buttons.forEach(button => {
      button.classList.toggle('liked', liked);
      button.setAttribute('aria-pressed', String(liked));
      button.setAttribute('aria-label', liked ? button.dataset.unlikeLabel : button.dataset.likeLabel);
      const icon = button.querySelector('.fa-heart');
      if (icon) {
        icon.classList.toggle('fas', liked);
        icon.classList.toggle('far', !liked);
      }
    });
  }
  function setDisabled(disabled) { buttons.forEach(button => { button.disabled = disabled; }); }
  function setCount(count) { counts.forEach(element => { element.textContent = count; }); }
  setDisabled(true);
  updateLikedState();

  let firebase;
  let likeRef;
  try {
    firebase = await import('./firebase-init.js');
    likeRef = firebase.ref(firebase.db, `${postUrl}/like`);
    firebase.onValue(likeRef, snapshot => {
      setCount(snapshot.val() ?? 0);
      ready = true;
      setDisabled(busy);
      updateLikedState();
    }, error => console.error('Like count unavailable:', error));
  } catch (error) { console.error('Like count unavailable:', error); }
  window.addEventListener('likes-updated', updateLikedState);
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) updateLikedState();
  });

  buttons.forEach(button => button.addEventListener('click', async () => {
    if (!ready || busy) return;
    busy = true;
    setDisabled(true);
    const heart = button.querySelector('.heart-svg');
    if (heart) {
      heart.classList.add('heart-beat');
      setTimeout(() => heart.classList.remove('heart-beat'), 400);
    }
    try {
      const toggle = async () => {
        const liked = localStorage.getItem(storageKey) === 'true';
        const result = await firebase.runTransaction(likeRef,
          data => Math.max(0, (data || 0) + (liked ? -1 : 1)),
          { applyLocally: false });
        if (!result.committed) return;
        if (liked) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, 'true');
        window.dispatchEvent(new Event('likes-updated'));
      };
      if (navigator.locks) await navigator.locks.request(storageKey, toggle);
      else await toggle();
    } catch (error) { console.error('Like update failed:', error); }
    finally { busy = false; setDisabled(false); }
  }));
}
