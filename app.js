'use strict';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function loadVideo(video) {
  if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const video = entry.target;
    if (entry.isIntersecting) {
      loadVideo(video);
      if (video.hasAttribute('data-autoplay') && !reduceMotion) video.play().catch(() => {});
    } else video.pause();
  }
}, {rootMargin: '100px 0px', threshold: 0.05});
for (const video of document.querySelectorAll('video')) {
  if (reduceMotion) video.removeAttribute('autoplay');
  observer.observe(video);
  video.addEventListener('pointerdown', () => loadVideo(video), {once: true});
  video.addEventListener('error', () => {
    if (video.parentElement.querySelector('.video-error')) return;
    const message = document.createElement('div'); message.className = 'video-error';
    const link = document.createElement('a'); link.href = video.dataset.src; link.textContent = 'Open video';
    message.append('Video could not load. ', link); video.parentElement.append(message);
  });
}
for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const view = button.dataset.view;
    for (const sibling of document.querySelectorAll('[data-view]')) {
      const selected = sibling === button;
      sibling.classList.toggle('active', selected);
      sibling.setAttribute('aria-pressed', String(selected));
    }
    for (const video of document.querySelectorAll('[data-demo]')) {
      video.pause(); video.removeAttribute('src');
      video.poster = 'assets/' + video.dataset.demo + '-' + view + '.jpg';
      video.dataset.src = 'assets/' + video.dataset.demo + '-' + view + '.mp4';
      video.setAttribute('aria-label', video.dataset.demo.replaceAll('-', ' ') + ' ' + view + ' view');
      video.parentElement.querySelector('.video-error')?.remove();
      video.load();
      const bounds = video.getBoundingClientRect();
      if (bounds.top < window.innerHeight + 100 && bounds.bottom > -100) loadVideo(video);
    }
    for (const label of document.querySelectorAll('.camera-label')) label.textContent = view === 'wrist' ? 'Wrist view' : 'External view';
  });
}
