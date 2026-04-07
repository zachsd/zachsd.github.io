(function () {
  var canvas = document.querySelector('[data-particle-background]');

  if (!canvas) {
    return;
  }

  var context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var animationFrame;
  var particleCount = 0;

  function readParticleColorBase() {
    var isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    return isLightTheme ? '76, 96, 230' : '125, 142, 255';
  }

  function setCanvasSize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: 0.3 + Math.random() * 0.5,
      radius: 0.8 + Math.random() * 2.1,
      alpha: 0.1 + Math.random() * 0.28
    };
  }

  function populateParticles() {
    particleCount = Math.max(24, Math.floor(window.innerWidth / 32));
    particles = Array.from({ length: particleCount }, createParticle);
  }

  function resetParticle(particle) {
    particle.x = Math.random() * window.innerWidth;
    particle.y = -8 - Math.random() * window.innerHeight * 0.2;
    particle.vx = (Math.random() - 0.5) * 0.22;
    particle.vy = 0.3 + Math.random() * 0.5;
    particle.radius = 0.8 + Math.random() * 2.1;
    particle.alpha = 0.1 + Math.random() * 0.28;
  }

  function draw() {
    var colorBase = readParticleColorBase();

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (var i = 0; i < particles.length; i += 1) {
      var particle = particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.y - particle.radius > window.innerHeight + 12) {
        resetParticle(particle);
      }

      if (particle.x < -10) {
        particle.x = window.innerWidth + 10;
      }

      if (particle.x > window.innerWidth + 10) {
        particle.x = -10;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(' + colorBase + ', ' + particle.alpha.toFixed(3) + ')';
      context.fill();
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  function stopAnimation() {
    window.cancelAnimationFrame(animationFrame);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function startAnimation() {
    stopAnimation();
    setCanvasSize();
    populateParticles();

    if (!prefersReducedMotion.matches) {
      draw();
    }
  }

  prefersReducedMotion.addEventListener('change', startAnimation);
  window.addEventListener('resize', startAnimation);
  window.addEventListener('orientationchange', startAnimation);

  startAnimation();
})();
