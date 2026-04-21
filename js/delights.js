// ============================================
// DELIGHTS — v10.0
// Scramble text · GitHub heatmap · Currently strip · Spotlight cursor
// ============================================

// ============================================
// 1. Scramble/Decode Text Effect
// Characters cycle through random glyphs before locking.
// ============================================
const scrambleChars = '!<>-_\\/[]{}—=+*^?#$%&@'.split('');

function scrambleReveal(element, finalText, duration = 1400) {
    if (!element) return;
    const chars = finalText.split('');
    const startTime = performance.now();
    const lockTime = chars.map((_, i) => (i / chars.length) * duration * 0.7 + 150);

    function frame(now) {
        const elapsed = now - startTime;
        let out = '';
        let locked = 0;
        chars.forEach((ch, i) => {
            if (elapsed > lockTime[i]) {
                out += ch;
                locked++;
            } else if (ch === ' ') {
                out += ' ';
            } else {
                out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
        });
        element.textContent = out;
        if (locked < chars.length) {
            requestAnimationFrame(frame);
        } else {
            element.textContent = finalText;
        }
    }
    requestAnimationFrame(frame);
}

// Scramble hero name (replaces the letter-by-letter reveal from motion.js)
(function heroScramble() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    // Capture the original text before any other script rewrites it
    const originalText = heroName.dataset.text || heroName.textContent.trim();
    heroName.dataset.text = originalText;

    // Wait a tick so motion.js's letter-split doesn't conflict
    setTimeout(() => {
        // Clear letter spans; we'll use plain text for scramble then rebuild italic styling
        heroName.classList.add('scramble-mode');
        const italicText = 'Adake';
        const beforeText = 'Yash ';

        const span1 = document.createElement('span');
        span1.className = 'scramble-part';
        const span2 = document.createElement('span');
        span2.className = 'scramble-part scramble-italic';
        heroName.innerHTML = '';
        heroName.appendChild(span1);
        heroName.appendChild(span2);

        scrambleReveal(span1, beforeText, 900);
        setTimeout(() => scrambleReveal(span2, italicText, 1100), 200);
        setTimeout(() => heroName.classList.add('scramble-done'), 1500);
    }, 400);
})();

// Scramble section titles on scroll-into-view
const scrambleTitleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.scrambled) {
            entry.target.dataset.scrambled = 'true';
            scrambleTitleNode(entry.target);
        }
    });
}, { threshold: 0.35 });

function scrambleTitleNode(titleEl) {
    // Titles look like: "<em>Selected</em> work"
    const html = titleEl.innerHTML;
    const plainText = titleEl.textContent.trim();
    if (!plainText) return;
    const originalHTML = html;

    // Phase 1: scramble plain text
    titleEl.innerHTML = '<span class="scramble-title-text"></span>';
    const span = titleEl.querySelector('.scramble-title-text');
    scrambleReveal(span, plainText, 900);

    // Phase 2: after scramble completes, restore original HTML (italic em etc.)
    setTimeout(() => {
        titleEl.innerHTML = originalHTML;
    }, 1000);
}

document.querySelectorAll('.section-title').forEach(t => scrambleTitleObserver.observe(t));

// Spotlight cursor removed in v11 — native cursor is the senior design call.

// ============================================
// 5. Konami easter egg hook (triggered from palette)
// ============================================
window.addEventListener('activate-easter-egg', () => {
    // Replay the easter egg that effects.js defines
    const event = new KeyboardEvent('keydown', { key: 'a' });
    // Simulate the full sequence faster
    const keys = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    keys.forEach(k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k })));
});
