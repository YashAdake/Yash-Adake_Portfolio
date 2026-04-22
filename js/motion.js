// ============================================
// MOTION — v6.0
// Scroll-driven reveals, cursor gradient, marquee
// Letter-by-letter hero entrance, text-reveal section titles
// ============================================

// Hero name animation moved to delights.js (scramble handles it)


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

// Cursor gradient blob removed in v10.5 — redundant with spotlight-follow in delights.js;
// three cursor-follow RAF loops were fighting the hero WebGL for GPU time.

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

// ============================================
// 10. Section header slide-in
// ============================================
const sectionHeaderObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            sectionHeaderObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.section-header').forEach(h => sectionHeaderObserver.observe(h));

// ============================================
// 11. Scroll-marquee dividers between sections
// ============================================
(function injectMarquees() {
    const phrases = [
        ['Building backend systems', 'Systems thinking', 'Python · Docker · Cloud', 'DevOps', 'Applied AI'],
        ['Ship fast', 'Ship safe', 'Scale matters', 'Observability', 'Automation is leverage'],
        ['Writing notes on AI', 'Infrastructure as craft', 'Quiet confidence', 'Reliability wins']
    ];

    const insertPoints = [
        { after: '#work', direction: 'left', phrases: phrases[0] },
        { after: '#about', direction: 'right', phrases: phrases[1] },
        { after: '#writing', direction: 'left', phrases: phrases[2] }
    ];

    insertPoints.forEach(point => {
        const section = document.querySelector(point.after);
        if (!section) return;

        const divider = document.createElement('div');
        divider.className = 'scroll-marquee-divider' + (point.direction === 'right' ? ' right' : '');

        const track = document.createElement('div');
        track.className = 'marquee-track';

        // Duplicate for seamless loop
        for (let i = 0; i < 2; i++) {
            point.phrases.forEach(p => {
                const item = document.createElement('span');
                item.className = 'marquee-item';
                item.textContent = p;
                track.appendChild(item);
            });
        }

        divider.appendChild(track);
        section.parentNode.insertBefore(divider, section.nextSibling);
    });
})();

