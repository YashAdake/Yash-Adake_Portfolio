// ============================================
// EFFECTS — Cursor, Particles, Tilt, Konami, Magnetic
// ============================================

// ============================================
// Floating Particles
// ============================================
(function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    const count = window.innerWidth > 768 ? 15 : 6;
    for (let i = 0; i < count; i++) {
        const orb = document.createElement('div');
        orb.className = 'particle';
        orb.style.left = Math.random() * 100 + '%';
        const size = Math.random() * 80 + 30;
        orb.style.width = size + 'px';
        orb.style.height = size + 'px';
        orb.style.animationDuration = (Math.random() * 30 + 20) + 's';
        orb.style.animationDelay = (Math.random() * -30) + 's';
        container.appendChild(orb);
    }
})();

// ============================================
// Comet Cursor + Trail (desktop only)
// ============================================
if (window.innerWidth > 768 && !('ontouchstart' in window)) {
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    if (cursor && cursorDot) {
        document.body.classList.add('custom-cursor-enabled');
        const TRAIL = 12;
        const dots = [];
        const pos = [];
        const colors = [
            'rgba(25,167,206,0.9)', 'rgba(25,167,206,0.8)', 'rgba(70,140,200,0.7)',
            'rgba(102,126,234,0.6)', 'rgba(102,126,234,0.5)', 'rgba(118,75,162,0.4)',
            'rgba(118,75,162,0.35)', 'rgba(118,75,162,0.3)', 'rgba(118,75,162,0.25)',
            'rgba(118,75,162,0.2)', 'rgba(118,75,162,0.15)', 'rgba(118,75,162,0.1)'
        ];
        for (let i = 0; i < TRAIL; i++) {
            const d = document.createElement('div');
            d.className = 'cursor-trail';
            const size = 14 - i * 0.9;
            d.style.cssText = `width:${size}px;height:${size}px;background:${colors[i]};box-shadow:0 0 ${6 - i * 0.4}px ${colors[i]}`;
            document.body.appendChild(d);
            dots.push(d);
            pos.push({ x: 0, y: 0 });
        }
        let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

        function animate() {
            cx += (mx - cx) * 0.25;
            cy += (my - cy) * 0.25;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
            rx += (mx - rx) * 0.08;
            ry += (my - ry) * 0.08;
            cursorDot.style.left = rx + 'px';
            cursorDot.style.top = ry + 'px';
            pos[0].x += (cx - pos[0].x) * 0.35;
            pos[0].y += (cy - pos[0].y) * 0.35;
            for (let i = 1; i < TRAIL; i++) {
                const s = 0.35 - i * 0.02;
                pos[i].x += (pos[i - 1].x - pos[i].x) * s;
                pos[i].y += (pos[i - 1].y - pos[i].y) * s;
            }
            dots.forEach((d, i) => { d.style.left = pos[i].x + 'px'; d.style.top = pos[i].y + 'px'; });
            requestAnimationFrame(animate);
        }
        animate();

        const interactive = document.querySelectorAll('a, button, input, textarea, .social-link, .btn, .project-card, .blog-card, .skill-tag, .floating-badge, .nav-each-link');
        interactive.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
                dots.forEach((d, i) => {
                    d.style.background = `rgba(102,126,234,${0.9 - i * 0.07})`;
                    d.style.boxShadow = `0 0 ${8 - i * 0.5}px rgba(102,126,234,${0.8 - i * 0.06})`;
                });
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
                dots.forEach((d, i) => {
                    d.style.background = colors[i];
                    d.style.boxShadow = `0 0 ${6 - i * 0.4}px ${colors[i]}`;
                });
            });
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('cursor-click');
            cursorDot.classList.add('cursor-click');
        });
        document.addEventListener('mouseup', () => {
            cursor.classList.remove('cursor-click');
            cursorDot.classList.remove('cursor-click');
        });
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
            dots.forEach(d => d.style.opacity = '0');
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '0.3';
            dots.forEach(d => d.style.opacity = '1');
        });
    }
}

// ============================================
// Mouse Follower Glow
// ============================================
if (window.innerWidth > 768) {
    const follower = document.getElementById('mouseFollower');
    if (follower) {
        let fx = 0, fy = 0, tx = 0, ty = 0;
        document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
        function loop() {
            fx += (tx - fx) * 0.05;
            fy += (ty - fy) * 0.05;
            follower.style.left = fx + 'px';
            follower.style.top = fy + 'px';
            requestAnimationFrame(loop);
        }
        loop();
        document.querySelectorAll('section').forEach(s => {
            s.addEventListener('mouseenter', () => follower.classList.add('expanded'));
            s.addEventListener('mouseleave', () => follower.classList.remove('expanded'));
        });
    }
}

// ============================================
// 3D Tilt — Project & Blog Cards
// ============================================
document.querySelectorAll('.project-card, .blog-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 15;
        const rotateY = (rect.width / 2 - x) / 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ============================================
// Magnetic Effect — Buttons + Nav Links
// ============================================
document.querySelectorAll('.btn-primary, .btn-outline-primary, .nav-each-link').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = el.classList.contains('nav-each-link') ? 0.2 : 0.15;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
});

// ============================================
// Skill Tag Stagger Animation
// ============================================
document.querySelectorAll('.skill-tag').forEach((tag, i) => {
    tag.style.animationDelay = `${i * 0.05}s`;
});

// ============================================
// Animated Skill Proficiency Bars
// ============================================
const skillBarObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target.querySelector('.skill-bar-fill');
            if (bar && !bar.dataset.animated) {
                const level = entry.target.dataset.level || '70';
                bar.style.width = level + '%';
                bar.dataset.animated = 'true';
            }
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-item[data-level]').forEach(item => skillBarObserver.observe(item));

// ============================================
// Reveal on Scroll (for elements with .reveal)
// ============================================
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// Konami Code Easter Egg
// ============================================
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kIdx = 0;

document.addEventListener('keydown', e => {
    if (e.key === konami[kIdx]) {
        kIdx++;
        if (kIdx === konami.length) {
            activateEasterEgg();
            kIdx = 0;
        }
    } else {
        kIdx = 0;
    }
});

function activateEasterEgg() {
    const notif = document.createElement('div');
    notif.className = 'easter-egg-notification';
    notif.innerHTML = '<div class="confetti">🎮</div><h3>🎉 You found it!</h3><p>A true developer — thanks for exploring!</p>';
    document.body.appendChild(notif);
    const pic = document.getElementById('mypic');
    if (pic) pic.classList.add('easter-egg-active');
    createConfetti();
    setTimeout(() => {
        notif.style.animation = 'easterEggPop 0.5s ease reverse forwards';
        setTimeout(() => {
            notif.remove();
            if (pic) pic.classList.remove('easter-egg-active');
        }, 500);
    }, 4500);
}

function createConfetti() {
    const colors = ['#19a7ce', '#667eea', '#764ba2', '#f093fb', '#f5576c', '#00ff88'];
    for (let i = 0; i < 100; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:fixed;width:${Math.random() * 10 + 5}px;height:${Math.random() * 10 + 5}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-20px;border-radius:${Math.random() > 0.5 ? '50%' : '0'};pointer-events:none;z-index:100000;animation:confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5000);
    }
    if (!document.getElementById('confetti-style')) {
        const s = document.createElement('style');
        s.id = 'confetti-style';
        s.textContent = `@keyframes confettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(${Math.random() * 720}deg);opacity:0}}`;
        document.head.appendChild(s);
    }
}

// Secret: triple-click the "YA" logo
const brand = document.getElementById('mynav-brand');
if (brand) {
    let clicks = 0, clickTimer;
    brand.addEventListener('click', () => {
        clicks++;
        clearTimeout(clickTimer);
        if (clicks === 3) {
            console.log('%c🛠 Tech Stack: HTML5, CSS3, JS, Bootstrap 5.3, Three.js, Google Apps Script\n%c✨ Built by Yash Adake — crafted with care', 'color:#19a7ce;font-size:14px;font-weight:bold', 'color:#f093fb;font-size:12px');
            clicks = 0;
        }
        clickTimer = setTimeout(() => { clicks = 0; }, 600);
    });
}

// Console helper
window.yash = {
    help() {
        console.log(
            '%c📞 Contact Yash\n\n%cEmail: yashadakeofficial@gmail.com\nPhone: +91-7715982570\nLinkedIn: linkedin.com/in/yash-adake\nTwitter: @yash_adake',
            'color:#19a7ce;font-size:18px;font-weight:bold', 'color:#f6f1f1;font-size:13px'
        );
    }
};

console.log('%c✨ Premium UX Features Loaded', 'color:#19a7ce;font-size:14px;font-weight:bold;');
console.log('%c🎮 Try the Konami Code: ↑↑↓↓←→←→BA • Or call yash.help()', 'color:#667eea;font-size:12px;');
