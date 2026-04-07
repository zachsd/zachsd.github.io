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
	var worldHeight = 0;
	var parallaxFactor = 0.7;

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
		worldHeight = Math.max(
			document.documentElement.scrollHeight,
			document.body.scrollHeight,
			height
		);

		canvas.width = Math.floor(width * dpi);
		canvas.height = Math.floor(height * dpi);
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		context.setTransform(dpi, 0, 0, dpi, 0, 0);

		particleCount = Math.max(60, Math.floor((width * height) / 15000));
		maxDistance = Math.max(150, Math.min(240, width * 0.18));
		seedParticles(width, worldHeight);
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
				radius: 1.8 + Math.random() * 2.6
			});
		}
	}

	function draw() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var color = getThemeParticleColor();
		var scrollTop = window.scrollY || window.pageYOffset || 0;

		context.clearRect(0, 0, width, height);

		for (var i = 0; i < particles.length; i++) {
			var particle = particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;

			if (particle.x < -10) particle.x = width + 10;
			if (particle.x > width + 10) particle.x = -10;
			if (particle.y < -10) particle.y = worldHeight + 10;
			if (particle.y > worldHeight + 10) particle.y = -10;

			var renderY = particle.y - scrollTop * parallaxFactor;
			var renderX = particle.x;
			if (renderY < -20 || renderY > height + 20) continue;

			context.beginPath();
			context.arc(renderX, renderY, particle.radius, 0, Math.PI * 2);
			context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.48)";
			context.fill();
		}

		for (var a = 0; a < particles.length; a++) {
			for (var b = a + 1; b < particles.length; b++) {
				var dx = particles[a].x - particles[b].x;
				var dy = particles[a].y - particles[b].y;
				var distance = Math.sqrt(dx * dx + dy * dy);
				var ay = particles[a].y - scrollTop * parallaxFactor;
				var by = particles[b].y - scrollTop * parallaxFactor;
				if ((ay < -30 && by < -30) || (ay > height + 30 && by > height + 30)) continue;

				if (distance < maxDistance) {
					var opacity = (1 - distance / maxDistance) * 0.42;
					context.beginPath();
					context.moveTo(particles[a].x, ay);
					context.lineTo(particles[b].x, by);
					context.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")";
					context.lineWidth = 1.35;
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
	window.addEventListener("load", resizeCanvas);
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
