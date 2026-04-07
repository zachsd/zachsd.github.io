(function () {
  'use strict';

  function applyTheme(theme) {
    var nextTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme-preference', nextTheme);

    var toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    var icon = toggle.querySelector('.theme-toggle__icon');
    var label = toggle.querySelector('.theme-toggle__text');

    toggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

    if (icon) {
      icon.textContent = nextTheme === 'dark' ? '🌙' : '☀️';
    }

    if (label) {
      label.textContent = nextTheme === 'dark' ? 'Dark' : 'Light';
    }
  }

  function bootThemeToggle() {
    var toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle || toggle.dataset.initialized === 'true') return;

    toggle.dataset.initialized = 'true';

    var initialTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme-preference') || 'dark';
    applyTheme(initialTheme);

    toggle.addEventListener('click', function () {
      var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  document.addEventListener('DOMContentLoaded', bootThemeToggle);
  document.addEventListener('pjax:end', bootThemeToggle);
})();
