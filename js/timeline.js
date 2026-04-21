// ============================================
// TIMELINE — Interactive experience section
// ============================================

const experienceItems = document.querySelectorAll('.experience-item');

experienceItems.forEach(item => {
    item.addEventListener('click', () => {
        const wasActive = item.classList.contains('expanded');
        experienceItems.forEach(i => i.classList.remove('expanded'));
        if (!wasActive) item.classList.add('expanded');
    });

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});

// Timeline scrubber — highlight item as it enters viewport
const timelineObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
}, { threshold: 0.3 });

document.querySelectorAll('.timeline-item, .experience-item').forEach(el => timelineObserver.observe(el));
