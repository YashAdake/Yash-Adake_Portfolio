// ============================================
// MOTION — v6.0
// Scroll-driven reveals, cursor gradient, marquee
// Letter-by-letter hero entrance, text-reveal section titles
// ============================================

// ============================================
// 1. Split hero name into letters for staggered entrance
// ============================================
(function splitHeroName() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    const html = heroName.innerHTML.trim();
    const wrapper = document.createElement('span');
    wrapper.className = 'hero-name-inner';

    // Parse existing structure: "Yash <em>Adake</em>"
    const parser = new DOMParser();
    const parsed = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = parsed.body.firstChild;

    function wrapText(text, isItalic) {
        const frag = document.createDocumentFragment();
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'hero-letter' + (isItalic ? ' hero-letter-italic' : '');
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            span.style.setProperty('--i', frag.childNodes.length);
            frag.appendChild(span);
        });
        return frag;
    }

    heroName.innerHTML = '';
    let index = 0;
    container.childNodes.forEach(node => {
        if (node.nodeType === 3) {
            [...node.textContent].forEach(ch => {
                const s = document.createElement('span');
                s.className = 'hero-letter';
                s.textContent = ch === ' ' ? '\u00A0' : ch;
                s.style.setProperty('--i', index++);
                heroName.appendChild(s);
            });
        } else if (node.tagName === 'EM') {
            [...node.textContent].forEach(ch => {
                const s = document.createElement('span');
                s.className = 'hero-letter hero-letter-italic';
                s.textContent = ch === ' ' ? '\u00A0' : ch;
                s.style.setProperty('--i', index++);
                heroName.appendChild(s);
            });
        }
    });

    // Trigger after load
    setTimeout(() => heroName.classList.add('hero-name-revealed'), 300);
})();

// ============================================
// 2. Section number count-up on scroll-into-view
// ============================================
const sectionNumbers = document.querySelectorAll('.section-number');
const numberObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const fullText = el.textContent.trim();
            const target = parseInt(fullText, 10);
            if (!isNaN(target) && !el.dataset.animated) {
                el.dataset.animated = 'true';
                let cur = 0;
                const tick = () => {
                    cur++;
                    el.textContent = String(cur).padStart(2, '0');
                    if (cur < target) setTimeout(tick, 80);
                };
                tick();
            }
        }
    });
}, { threshold: 0.5 });
sectionNumbers.forEach(n => numberObserver.observe(n));

// ============================================
// 3. Section title reveal with mask animation
// ============================================
const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('title-revealed');
            titleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));

// ============================================
// 4. Cursor-following gradient blob (low-opacity depth layer)
// ============================================
(function cursorGradient() {
    if (window.innerWidth <= 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const blob = document.createElement('div');
    blob.className = 'cursor-gradient-blob';
    document.body.appendChild(blob);

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;

    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

    function loop() {
        x += (tx - x) * 0.04;
        y += (ty - y) * 0.04;
        blob.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
    }
    loop();
})();

// ============================================
// 5. Project card 3D tilt with shine sweep
// ============================================
document.querySelectorAll('.work-card').forEach(card => {
    if (card.classList.contains('work-card-draft')) return;

    const visual = card.querySelector('.work-visual');
    if (!visual) return;

    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotX = (y - 0.5) * -8;
        const rotY = (x - 0.5) * 8;
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        // Shine position
        visual.style.setProperty('--shine-x', `${x * 100}%`);
        visual.style.setProperty('--shine-y', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ============================================
// 6. Tech marquee — infinite scroll ticker
// Injects itself right after .about-stack
// ============================================
(function buildMarquee() {
    const aboutStack = document.querySelector('.about-stack');
    if (!aboutStack) return;

    const techs = [
        'Python', 'Docker', 'PostgreSQL', 'Go', 'Java', 'Spring Boot',
        'Apache NiFi', 'CloudJiffy', 'Azure', 'KrakenD', 'Swagger',
        'Git', 'Linux', 'REST APIs', 'Microservices', 'CI/CD',
        'GenAI', 'Agentic AI', 'LLM Tooling', 'Observability'
    ];

    const marquee = document.createElement('div');
    marquee.className = 'tech-marquee';
    marquee.setAttribute('aria-hidden', 'true');

    const track = document.createElement('div');
    track.className = 'tech-marquee-track';

    // Duplicate list twice for seamless loop
    for (let i = 0; i < 2; i++) {
        techs.forEach(t => {
            const chip = document.createElement('span');
            chip.className = 'tech-chip';
            chip.textContent = t;
            track.appendChild(chip);
        });
    }

    marquee.appendChild(track);
    aboutStack.parentNode.insertBefore(marquee, aboutStack.nextSibling);
})();

// ============================================
// 7. Hero scroll parallax on photo
// ============================================
const heroPhoto = document.getElementById('mypic');
if (heroPhoto && window.innerWidth > 768) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y < window.innerHeight) {
                    heroPhoto.style.transform = `translateY(${y * 0.12}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// 8. Work card reveal on scroll (clip-path)
// ============================================
const workCards = document.querySelectorAll('.work-card');
const workObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('work-card-revealed'), i * 100);
            workObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
workCards.forEach(c => workObserver.observe(c));

// ============================================
// 9. Writing item reveal
// ============================================
const writingItems = document.querySelectorAll('.writing-item');
const writingObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('writing-revealed');
            writingObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
writingItems.forEach(w => writingObs.observe(w));
