/* Shared inner-page navigation. Homepage keeps its existing app controller. */
(() => {
  'use strict';
  const nav = document.getElementById('navbar');
  const menu = document.getElementById('mobile-menu');
  const trigger = document.getElementById('hamburger-btn');
  if (!nav || !menu || !trigger) return;
  let previousOverflow = '';
  function setOpen(open, restoreFocus = true) {
    if (open === menu.classList.contains('open')) return;
    menu.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menu.querySelector('button, a[href]')?.focus();
    } else {
      document.body.style.overflow = previousOverflow;
      if (restoreFocus) trigger.focus();
    }
  }
  document.querySelectorAll('button[data-shell-toggle]').forEach(button => {
    button.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  });
  menu.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', () => setOpen(false, false)));
  document.addEventListener('keydown', event => {
    if (!menu.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      const items = [...menu.querySelectorAll('a[href], button:not(:disabled)')].filter(el => el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (first && event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (last && !event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  });
  const sync = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', sync, {passive: true});
  window.addEventListener('pageshow', sync);
  window.addEventListener('hashchange', () => requestAnimationFrame(sync));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1140) setOpen(false, false);
  });
  document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  sync();
})();
