// =========================================================
// Farmify — Three.js Particle Background for Login
// Floating emerald seed/spore particles
// =========================================================

(function() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animFrame;

    const PARTICLE_COUNT = 80;
    const CONNECT_DISTANCE = 120;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.15;
            // Green-ish hue variations
            this.hue = 140 + Math.random() * 30; // 140-170 range (emerald to teal)
            this.saturation = 50 + Math.random() * 30;
            this.lightness = 40 + Math.random() * 25;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Subtle mouse influence
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.x -= dx * 0.002;
                this.y -= dy * 0.002;
            }

            // Wrap around
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) this.y = height + 10;
            if (this.y > height + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DISTANCE) {
                    const opacity = (1 - dist / CONNECT_DISTANCE) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Background gradient
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
        grad.addColorStop(0, 'rgba(6, 78, 59, 0.15)');
        grad.addColorStop(1, 'rgba(10, 15, 26, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        drawConnections();

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animFrame = requestAnimationFrame(animate);
    }

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
        resize();
    });

    init();
    animate();
})();
