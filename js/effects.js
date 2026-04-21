// ============================================
// EFFECTS — Refined v5.0
// Minimal: cursor, subtle magnetics, reveal, konami
// ============================================

// ============================================
// Simple Custom Cursor (desktop, no trail)
// ============================================
if (window.innerWidth > 768 && !('ontouchstart' in window)) {
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');

    if (cursor && cursorDot) {
        document.body.classList.add('custom-cursor-enabled');

        let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

        function animate() {
            cx += (mx - cx) * 0.35;
            cy += (my - cy) * 0.35;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';

            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            cursorDot.style.left = rx + 'px';
            cursorDot.style.top = ry + 'px';

            requestAnimationFrame(animate);
        }
        animate();

        const interactive = document.querySelectorAll('a, button, .work-card, .writing-item, input, textarea');
        interactive.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '0.3';
        });
    }
}

// ============================================
// Subtle Magnetic Effect on Buttons (not nav — now that nav uses underline)
// ============================================
document.querySelectorAll('.btn-refined').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });
});

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
    notif.style.cssText = `
        position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(0);
        background:var(--bg-1); border:1px solid var(--accent); border-radius:12px;
        padding:32px 48px; text-align:center; z-index:99999;
        box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 40px var(--accent-soft);
        animation:easterPop 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
        font-family: var(--font-serif);
    `;
    notif.innerHTML = '<div style="font-size:2rem;margin-bottom:8px">🎮</div><h3 style="font-size:1.75rem;font-style:italic;color:var(--accent);margin:0 0 8px">You found it.</h3><p style="font-family:var(--font-sans);font-size:0.9rem;color:var(--text-1);margin:0">A true developer — thanks for exploring.</p>';
    document.body.appendChild(notif);
    createConfetti();

    if (!document.getElementById('ee-anim')) {
        const s = document.createElement('style');
        s.id = 'ee-anim';
        s.textContent = '@keyframes easterPop { to { transform:translate(-50%,-50%) scale(1); } }';
        document.head.appendChild(s);
    }

    setTimeout(() => {
        notif.style.animation = 'easterPop 0.3s ease reverse forwards';
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}

function createConfetti() {
    const colors = ['#5B8DEF', '#EDEDED', '#7BA5F5', '#A8A8A8'];
    for (let i = 0; i < 80; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:fixed;width:${Math.random() * 8 + 4}px;height:${Math.random() * 8 + 4}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-20px;border-radius:${Math.random() > 0.5 ? '50%' : '0'};pointer-events:none;z-index:100000;animation:confettiFall ${Math.random() * 2 + 2}s linear forwards`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4500);
    }
    if (!document.getElementById('confetti-style')) {
        const s = document.createElement('style');
        s.id = 'confetti-style';
        s.textContent = `@keyframes confettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(${Math.random() * 720}deg);opacity:0}}`;
        document.head.appendChild(s);
    }
}

// Triple-click YA logo → console signature
const brand = document.getElementById('mynav-brand');
if (brand) {
    let clicks = 0, clickTimer;
    brand.addEventListener('click', () => {
        clicks++;
        clearTimeout(clickTimer);
        if (clicks === 3) {
            console.log(
                '%c🛠 Stack\n%cInter · Instrument Serif · Bootstrap · Three.js · Google Apps Script\n%c✨ Built by Yash Adake — quiet confidence.',
                'color:#5B8DEF;font-size:14px;font-weight:bold',
                'color:#EDEDED;font-size:12px',
                'color:#A8A8A8;font-size:11px;font-style:italic'
            );
            clicks = 0;
        }
        clickTimer = setTimeout(() => { clicks = 0; }, 600);
    });
}

// Console helper
window.yash = {
    help() {
        console.log(
            '%cContact Yash\n\n%cEmail · yashadakeofficial@gmail.com\nPhone · +91 77159 82570\nLinkedIn · linkedin.com/in/yash-adake\nTwitter · @yash_adake',
            'color:#5B8DEF;font-size:16px;font-weight:600;font-family:Georgia,serif;font-style:italic',
            'color:#EDEDED;font-size:12px;font-family:monospace;line-height:1.8'
        );
    }
};

console.log(
    '%cYash Adake\n%cSoftware Engineer · Maharashtra, IN\n%cLook for: yash.help() · Konami code\n',
    'color:#EDEDED;font-size:18px;font-weight:600;font-family:Georgia,serif;font-style:italic',
    'color:#A8A8A8;font-size:11px;font-family:monospace;letter-spacing:0.05em',
    'color:#5B8DEF;font-size:10px;font-family:monospace;letter-spacing:0.1em'
);
