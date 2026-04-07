(function () {
	var canvas = document.getElementById("particle-background");
	if (!canvas) return;

	var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	var context = canvas.getContext("2d");
	if (!context) return;

	var particles = [];
	var rafId = null;
	var particleCount = 0;
	var dpi = Math.max(window.devicePixelRatio || 1, 1);
	var maxDistance = 140;

	function hexToRgb(hex) {
		var normalized = hex.replace("#", "");
		var chunk = normalized.length === 3
			? normalized.split("").map(function (char) { return char + char; }).join("")
			: normalized;

		return {
			r: parseInt(chunk.slice(0, 2), 16),
			g: parseInt(chunk.slice(2, 4), 16),
			b: parseInt(chunk.slice(4, 6), 16)
		};
	}

	function getThemeParticleColor() {
		var styles = getComputedStyle(document.documentElement);
		var accentColor = styles.getPropertyValue("--theme-accent").trim() || "#7d8eff";
		return hexToRgb(accentColor);
	}

	function resizeCanvas() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		dpi = Math.max(window.devicePixelRatio || 1, 1);

		canvas.width = Math.floor(width * dpi);
		canvas.height = Math.floor(height * dpi);
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		context.setTransform(dpi, 0, 0, dpi, 0, 0);

		particleCount = Math.max(22, Math.floor((width * height) / 38000));
		maxDistance = Math.max(110, Math.min(170, width * 0.12));
		seedParticles(width, height);
	}

	function randomVelocity() {
		return (Math.random() - 0.5) * 0.22;
	}

	function seedParticles(width, height) {
		particles = [];
		for (var i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: randomVelocity(),
				vy: randomVelocity(),
				radius: 0.7 + Math.random() * 1.8
			});
		}
	}

	function draw() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var color = getThemeParticleColor();

		context.clearRect(0, 0, width, height);

		for (var i = 0; i < particles.length; i++) {
			var particle = particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;

			if (particle.x < -10) particle.x = width + 10;
			if (particle.x > width + 10) particle.x = -10;
			if (particle.y < -10) particle.y = height + 10;
			if (particle.y > height + 10) particle.y = -10;

			context.beginPath();
			context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.22)";
			context.fill();
		}

		for (var a = 0; a < particles.length; a++) {
			for (var b = a + 1; b < particles.length; b++) {
				var dx = particles[a].x - particles[b].x;
				var dy = particles[a].y - particles[b].y;
				var distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < maxDistance) {
					var opacity = (1 - distance / maxDistance) * 0.15;
					context.beginPath();
					context.moveTo(particles[a].x, particles[a].y);
					context.lineTo(particles[b].x, particles[b].y);
					context.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")";
					context.lineWidth = 0.7;
					context.stroke();
				}
			}
		}

		rafId = window.requestAnimationFrame(draw);
	}

	function startAnimation() {
		if (rafId !== null) return;
		draw();
	}

	function stopAnimation() {
		if (rafId === null) return;
		window.cancelAnimationFrame(rafId);
		rafId = null;
		context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	}

	function updateMotionPreference() {
		if (prefersReducedMotion.matches) {
			stopAnimation();
			canvas.style.display = "none";
			return;
		}

		canvas.style.display = "block";
		resizeCanvas();
		startAnimation();
	}

	window.addEventListener("resize", resizeCanvas, { passive: true });
	prefersReducedMotion.addEventListener("change", updateMotionPreference);
	document.addEventListener("visibilitychange", function () {
		if (document.hidden) {
			stopAnimation();
		} else if (!prefersReducedMotion.matches) {
			startAnimation();
		}
	});

	updateMotionPreference();
})();
