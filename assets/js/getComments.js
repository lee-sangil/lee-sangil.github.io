// Read every Discussion page before treating an unmatched post as having no comments.
$(document).ready(async function() {
  const tags = document.querySelectorAll('.comment_count[pathname]');
  if (!tags.length) return;
  const counts = new Map();
  tags.forEach((tag) => { tag.textContent = '—'; });
  try {
    for (let page = 1; ; page++) {
      const response = await fetch('https://api.github.com/repos/lee-sangil/lee-sangil.github.io/discussions?per_page=10&page=' + page);
      if (!response.ok) throw new Error('GitHub returned ' + response.status);
      const discussions = await response.json();
      if (!Array.isArray(discussions)) throw new Error('Invalid Discussions response');
      discussions.forEach((discussion) => {
        if (discussion.category && discussion.category.name === 'Announcements') {
          const path = '/' + discussion.title.replace(/^\//, '');
          counts.set(path, (counts.get(path) || 0) + discussion.comments);
        }
      });
      if (discussions.length < 10) break;
    }
    tags.forEach((tag) => { tag.textContent = counts.get(tag.getAttribute('pathname')) || 0; });
  } catch (error) {
    console.error('Discussion lookup failed:', error);
  }
});
