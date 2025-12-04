/**
 * Waitlist Page - Main JavaScript
 * Handles animations, form submission, and interactions
 */

// ===========================================
// Initialize on DOM Load
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initAmbientGlow();
    initFormHandler();
    initScatteredIntro();
});

// ===========================================
// Ambient Glow Effect
// ===========================================
function initAmbientGlow() {
    const glow = document.getElementById('glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        glow.style.transform = `translate(${glowX - 300}px, ${glowY - 300}px)`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

// ===========================================
// Scattered Intro Animation
// ===========================================
function initScatteredIntro() {
    const icons = document.querySelectorAll('.floating-icon');
    const wrapper = document.querySelector('.icons-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();

    // Store physics data for each icon
    const iconData = [];

    // Initialize icons with random positions outside the viewport
    icons.forEach((icon, index) => {
        const rect = icon.getBoundingClientRect();
        const iconWidth = rect.width || 60;
        const iconHeight = rect.height || 60;

        // Random starting position from edges
        const side = Math.floor(Math.random() * 4);
        let startX, startY;

        switch (side) {
            case 0: // top
                startX = Math.random() * window.innerWidth;
                startY = -100 - Math.random() * 150;
                break;
            case 1: // right
                startX = window.innerWidth + 50 + Math.random() * 150;
                startY = Math.random() * window.innerHeight;
                break;
            case 2: // bottom
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50 + Math.random() * 150;
                break;
            case 3: // left
                startX = -100 - Math.random() * 150;
                startY = Math.random() * window.innerHeight;
                break;
        }

        // Get final position from CSS
        const computedStyle = window.getComputedStyle(icon);
        const finalTop = icon.offsetTop;
        const finalLeft = icon.offsetLeft;
        const finalX = wrapperRect.left + finalLeft + iconWidth / 2;
        const finalY = wrapperRect.top + finalTop + iconHeight / 2;

        // Initial velocity toward center with some randomness (slower)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const angle = Math.atan2(centerY - startY, centerX - startX);
        const speed = 5 + Math.random() * 3;

        iconData.push({
            el: icon,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 3,
            width: iconWidth,
            height: iconHeight,
            finalX: finalX,
            finalY: finalY,
            mass: iconWidth * iconHeight / 1000
        });

        // Set initial styles
        icon.style.position = 'fixed';
        icon.style.left = startX + 'px';
        icon.style.top = startY + 'px';
        icon.style.opacity = '1';
        icon.style.transition = 'none';
        icon.style.zIndex = '100';
    });

    let frame = 0;
    const scatterDuration = 140;   // Frames for scattering (slower)
    const collideDuration = 180;   // Frames for collision physics (slower)
    const settleDuration = 90;     // Frames for settling to final positions (slower)
    const totalDuration = scatterDuration + collideDuration + settleDuration;

    function animate() {
        frame++;

        if (frame <= scatterDuration + collideDuration) {
            // Phase 1 & 2: Movement with collision physics

            // Apply physics to each icon
            iconData.forEach((data, i) => {
                // Add slight gravity toward center during collision phase
                if (frame > scatterDuration) {
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    const dx = centerX - data.x;
                    const dy = centerY - data.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 50) {
                        const force = 0.08;
                        data.vx += (dx / dist) * force;
                        data.vy += (dy / dist) * force;
                    }
                }

                // Apply friction (more friction = slower)
                data.vx *= 0.985;
                data.vy *= 0.985;

                // Update position
                data.x += data.vx;
                data.y += data.vy;

                // Bounce off screen edges
                const padding = 20;
                if (data.x < padding) {
                    data.x = padding;
                    data.vx *= -0.8;
                }
                if (data.x > window.innerWidth - padding - data.width) {
                    data.x = window.innerWidth - padding - data.width;
                    data.vx *= -0.8;
                }
                if (data.y < padding) {
                    data.y = padding;
                    data.vy *= -0.8;
                }
                if (data.y > window.innerHeight - padding - data.height) {
                    data.y = window.innerHeight - padding - data.height;
                    data.vy *= -0.8;
                }
            });

            // Check collisions between icons
            for (let i = 0; i < iconData.length; i++) {
                for (let j = i + 1; j < iconData.length; j++) {
                    const a = iconData[i];
                    const b = iconData[j];

                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = (a.width + b.width) / 2;

                    if (dist < minDist && dist > 0) {
                        // Collision detected
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const overlap = minDist - dist;

                        // Separate icons
                        const totalMass = a.mass + b.mass;
                        a.x -= nx * overlap * (b.mass / totalMass);
                        a.y -= ny * overlap * (b.mass / totalMass);
                        b.x += nx * overlap * (a.mass / totalMass);
                        b.y += ny * overlap * (a.mass / totalMass);

                        // Elastic collision response
                        const dvx = a.vx - b.vx;
                        const dvy = a.vy - b.vy;
                        const dot = dvx * nx + dvy * ny;

                        if (dot > 0) {
                            const restitution = 0.7;
                            const impulse = (2 * dot) / totalMass * restitution;

                            a.vx -= impulse * b.mass * nx;
                            a.vy -= impulse * b.mass * ny;
                            b.vx += impulse * a.mass * nx;
                            b.vy += impulse * a.mass * ny;
                        }
                    }
                }
            }

            // Update DOM
            iconData.forEach(data => {
                data.el.style.left = data.x + 'px';
                data.el.style.top = data.y + 'px';
                data.el.style.transform = `rotate(${data.vx * 2}deg)`;
            });

            requestAnimationFrame(animate);

        } else if (frame <= totalDuration) {
            // Phase 3: Settle to final positions
            const progress = (frame - scatterDuration - collideDuration) / settleDuration;
            const easeProgress = easeOutCubic(progress);

            iconData.forEach((data, index) => {
                // Store starting position for settle phase
                if (!data.settleStartX) {
                    data.settleStartX = data.x;
                    data.settleStartY = data.y;
                }

                // Interpolate to final position
                const newX = data.settleStartX + (data.finalX - data.width / 2 - data.settleStartX) * easeProgress;
                const newY = data.settleStartY + (data.finalY - data.height / 2 - data.settleStartY) * easeProgress;

                data.el.style.left = newX + 'px';
                data.el.style.top = newY + 'px';
                data.el.style.transform = `rotate(${(1 - easeProgress) * data.vx * 2}deg) scale(${0.9 + easeProgress * 0.1})`;
                data.el.style.opacity = 0.7 + easeProgress * 0.3;
            });

            requestAnimationFrame(animate);

        } else {
            // Animation complete - switch to loop animation
            iconData.forEach((data, index) => {
                const icon = data.el;

                // First, set opacity to 1 and keep it visible at final position
                icon.style.opacity = '1';
                icon.style.transform = 'scale(1)';

                // Add smooth transition for the handoff
                icon.style.transition = 'opacity 0.3s ease';

                // Brief delay then fade out and switch to CSS positioning
                setTimeout(() => {
                    icon.style.opacity = '0';

                    setTimeout(() => {
                        // Reset to CSS-controlled positioning
                        icon.style.position = '';
                        icon.style.left = '';
                        icon.style.top = '';
                        icon.style.transform = '';
                        icon.style.zIndex = '';
                        icon.style.transition = '';

                        // Enable the looping animation
                        icon.classList.add('loop-active');
                    }, 300);
                }, index * 80);
            });

            // Initialize hover effects after intro completes
            setTimeout(() => {
                initFloatingIconHover();
            }, iconData.length * 80 + 500);
        }
    }

    // Start animation after a brief delay
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 300);
}

// ===========================================
// Form Handler
// ===========================================
function initFormHandler() {
    const form = document.getElementById('waitlistForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const waitlistCount = document.getElementById('waitlistCount');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Button loading state
        submitBtn.textContent = 'Joining...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.textContent = 'Joined! ✓';
            submitBtn.classList.add('success');
            successMessage.classList.add('show');

            // Increment counter with animation
            const currentCount = parseInt(waitlistCount.textContent.replace(/,/g, ''));
            animateCounter(currentCount, currentCount + 1);

            // Reset form
            form.reset();
        }, 1500);
    });
}

// ===========================================
// Counter Animation
// ===========================================
function animateCounter(start, end) {
    const waitlistCount = document.getElementById('waitlistCount');
    const duration = 500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        waitlistCount.innerHTML = current.toLocaleString() + '<span>+</span>';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

// ===========================================
// Floating Icon Hover Effects
// ===========================================
function initFloatingIconHover() {
    document.querySelectorAll('.floating-icon').forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.15)';
            icon.style.boxShadow = '0 15px 50px rgba(173, 251, 246, 0.3)';
        });

        icon.addEventListener('mouseleave', () => {
            icon.style.transform = '';
            icon.style.boxShadow = '';
        });
    });
}
