// ============================================
// CORE — Form, Theme, Nav, Counter, Copy
// ============================================

// ----------------------------------------------------
// FORM ENDPOINT CONFIGURATION
// ----------------------------------------------------
// The current direct Google Script URL (Client-exposed).
// To switch to your new secure Serverless Edge API:
// 1. Deploy the code from `cloudflare-worker-api.js` to Cloudflare Workers (Free)
// 2. Uncomment the line below and paste your worker URL:
// const SCRIPT_URL = 'https://your-worker-name.workers.dev/'; 

const SCRIPT_URL = 'https://yashadake-form.yashadake91.workers.dev/';

// ============================================
// Form Validation + Submission
// ============================================
const validators = {
    name: { validate: v => v.trim().length >= 2, message: '⚠️ Name must be at least 2 characters' },
    email: { validate: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v), message: '⚠️ Please enter a valid email (e.g., name@example.com)' },
    subject: { validate: v => v.trim().length >= 3, message: '⚠️ Subject must be at least 3 characters' },
    message: { validate: v => v.trim().length >= 10, message: '⚠️ Message must be at least 10 characters' }
};

function validateField(field, errorSpan, validator) {
    const isValid = validator.validate(field.value);
    field.classList.toggle('error', !isValid);
    field.classList.toggle('valid', isValid);
    errorSpan.textContent = isValid ? '' : validator.message;
    return isValid;
}

function validateAllFields() {
    let valid = true;
    Object.keys(validators).forEach(name => {
        const field = document.getElementById(name);
        const err = document.getElementById(name + 'Error');
        if (field && err && !validateField(field, err, validators[name])) valid = false;
    });
    return valid;
}

function clearValidationStyles() {
    Object.keys(validators).forEach(name => {
        const field = document.getElementById(name);
        const err = document.getElementById(name + 'Error');
        if (field) field.classList.remove('error', 'valid');
        if (err) err.textContent = '';
    });
}

Object.keys(validators).forEach(name => {
    const field = document.getElementById(name);
    const err = document.getElementById(name + 'Error');
    if (field && err) {
        field.addEventListener('blur', () => validateField(field, err, validators[name]));
        field.addEventListener('input', () => {
            if (field.classList.contains('error') || field.classList.contains('valid')) {
                validateField(field, err, validators[name]);
            }
        });
    }
});

const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById('msg');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateAllFields()) {
            msg.textContent = '⚠️ Please fix the errors above before submitting.';
            msg.className = 'message msg-error';
            setTimeout(() => { msg.textContent = ''; msg.className = 'message'; }, 3000);
            return;
        }
        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const btnIcon = btn.querySelector('i');
        btnText.textContent = 'Sending…';
        btnIcon.classList.remove('bx-send');
        btnIcon.classList.add('bx-loader-alt', 'bx-spin');
        btn.disabled = true;
        fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form), mode: 'no-cors' })
            .then(() => {
                msg.textContent = '✨ Thank you for reaching out. I\'ll respond within 1–2 business days.';
                msg.className = 'message msg-success';
                btnText.textContent = 'Message Sent';
                btnIcon.classList.remove('bx-loader-alt', 'bx-spin');
                btnIcon.classList.add('bx-check');
                setTimeout(() => {
                    msg.textContent = ''; msg.className = 'message';
                    btnText.textContent = 'Send message';
                    btnIcon.classList.remove('bx-check');
                    btnIcon.classList.add('bx-send');
                    btn.disabled = false;
                }, 5000);
                form.reset();
                clearValidationStyles();
            })
            .catch(() => {
                msg.textContent = '⚠️ Something went wrong. Please try again or reach out via email.';
                msg.className = 'message msg-error';
                btnText.textContent = 'Send message';
                btnIcon.classList.remove('bx-loader-alt', 'bx-spin');
                btnIcon.classList.add('bx-send');
                btn.disabled = false;
            });
    });
}

// ============================================
// Loading Screen
// ============================================
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    if (!loading) return;
    setTimeout(() => {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
            document.body.classList.add('loaded');
        }, 400);
    }, 300);
});

// ============================================
// Dynamic Year
// ============================================
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================
// Unified Scroll Handler (RAF-throttled)
// ============================================
const navbar = document.querySelector('.navbar');
const scrollBtn = document.getElementById('scrollToTop');
const scrollProgress = document.getElementById('scrollProgress');
const scrollHint = document.querySelector('.scroll-hint');
const parallaxEls = document.querySelectorAll('.about-image');

let scrollTicking = false;
let lastScrollY = 0;

function onScrollFrame() {
    const y = lastScrollY;

    // Navbar scrolled state
    if (navbar) navbar.classList.toggle('scrolled', y > 80);

    // Scroll-to-top button
    if (scrollBtn) {
        if (y > 300) {
            scrollBtn.style.display = 'flex';
            scrollBtn.style.opacity = '1';
        } else {
            scrollBtn.style.opacity = '0';
            setTimeout(() => { if (window.scrollY <= 300) scrollBtn.style.display = 'none'; }, 200);
        }
    }

    // Scroll progress bar
    if (scrollProgress) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? (y / docH) * 100 : 0;
        scrollProgress.style.width = pct + '%';
        scrollProgress.classList.toggle('active', pct > 0);
    }

    // Scroll hint auto-hide
    if (scrollHint) {
        if (y > 100) {
            scrollHint.style.opacity = '0';
            scrollHint.style.visibility = 'hidden';
        } else {
            scrollHint.style.opacity = '0.6';
            scrollHint.style.visibility = 'visible';
        }
    }

    // Parallax
    parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yPos = (rect.top - window.innerHeight / 2) * 0.05;
            el.style.transform = `translateY(${yPos}px)`;
        }
    });

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!scrollTicking) {
        requestAnimationFrame(onScrollFrame);
        scrollTicking = true;
    }
}, { passive: true });

if (scrollBtn) {
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============================================
// Active Nav Highlighting (IntersectionObserver)
// ============================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-each-link');
let isProgrammaticScroll = false;

const navObserver = new IntersectionObserver(entries => {
    if (isProgrammaticScroll) return;
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href && href.substring(1) === id);
            });
        }
    });
}, { rootMargin: '-30% 0px -50% 0px', threshold: 0 });

sections.forEach(s => navObserver.observe(s));

// ============================================
// Smooth Anchor Scroll
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        isProgrammaticScroll = true;
        navLinks.forEach(l => l.classList.remove('active'));
        if (a.classList.contains('nav-each-link')) a.classList.add('active');
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        setTimeout(() => { isProgrammaticScroll = false; }, 800);
        const navCollapse = document.querySelector('.navbar-collapse');
        if (navCollapse?.classList.contains('show')) {
            new bootstrap.Collapse(navCollapse, { toggle: false }).hide();
        }
    });
});

// ============================================
// Theme Toggle (Dark/Light)
// ============================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
if (themeToggle && themeIcon) {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.replace('bx-sun', 'bx-moon');
    }
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        themeIcon.classList.toggle('bx-moon', isLight);
        themeIcon.classList.toggle('bx-sun', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ============================================
// Copy to Clipboard
// ============================================
window.copyText = function(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const span = button.querySelector('.copy-text');
        const orig = span.textContent;
        span.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            span.textContent = orig;
            button.classList.remove('copied');
        }, 2000);
    }).catch(() => alert('Copied: ' + text));
};

// ============================================
// Typing Effect
// ============================================
const typedEl = document.getElementById('typed-text');
if (typedEl) {
    const roles = ['Software Engineer', 'DevOps Engineer', 'Backend Developer', 'Cloud Practitioner', 'AI Explorer'];
    let idx = 0, char = 0, deleting = false;
    function type() {
        const word = roles[idx];
        typedEl.textContent = word.substring(0, deleting ? --char : ++char);
        let speed = deleting ? 50 : 100;
        if (!deleting && char === word.length) { speed = 2000; deleting = true; }
        else if (deleting && char === 0) { deleting = false; idx = (idx + 1) % roles.length; speed = 500; }
        setTimeout(type, speed);
    }
    setTimeout(type, 1500);
}

// ============================================
// Visitor Counter — Universal server-side count
// Two-layer speed: cached count shown instantly,
// real count fetched in background and updated silently.
// ============================================
(function visitorCounter() {
    const el = document.getElementById('visitorCount');
    if (!el) return;

    const FALLBACK_COUNT = 850;

    // Layer 1: Show cached count INSTANTLY (zero delay for returning visitors)
    const cached = parseInt(localStorage.getItem('vc_last'), 10);
    if (cached) {
        el.textContent = cached.toLocaleString();
    } else {
        el.classList.add('vc-loading'); // shimmer for first-time visitors
    }

    // Layer 2: Fetch real count from server in background
    fetch(`${SCRIPT_URL}?action=count`, { method: 'GET' })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.success && typeof data.count === 'number') {
                el.classList.remove('vc-loading');
                el.textContent = data.count.toLocaleString();
                localStorage.setItem('vc_last', data.count);
            } else {
                el.classList.remove('vc-loading');
                el.textContent = (cached || FALLBACK_COUNT).toLocaleString();
            }
        })
        .catch(() => {
            el.classList.remove('vc-loading');
            el.textContent = (cached || FALLBACK_COUNT).toLocaleString();
        });
})();

// ============================================
// Form Input Focus
// ============================================
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
    input.addEventListener('blur', () => { if (!input.value) input.parentElement.classList.remove('focused'); });
});

// ============================================
// Console Banner
// ============================================
console.log(
    '%c👋 Hey, curious dev!\n\n%cWelcome to Yash Adake\'s portfolio.\nLet\'s connect:\n🔗 linkedin.com/in/yash-adake\n📧 yashadakeofficial@gmail.com\n💬 wa.me/917715982570\n',
    'color:#19a7ce;font-size:20px;font-weight:bold;',
    'color:#f6f1f1;font-size:14px;'
);

// ============================================
// Certificate Carousel + Lightbox
// ============================================
(function certiCarousel() {
    const carousel = document.getElementById('certiCarousel');
    const lightbox = document.getElementById('certiLightbox');
    if (!carousel || !lightbox) return;

    const lbImg    = document.getElementById('certiLightboxImg');
    const lbTitle  = document.getElementById('certiLightboxTitle');
    const lbIssuer = document.getElementById('certiLightboxIssuer');
    const lbClose  = lightbox.querySelector('.certi-lightbox-close');
    const backdrop = lightbox.querySelector('.certi-lightbox-backdrop');

    // Arrow scroll
    document.querySelector('.certi-arrow-left')?.addEventListener('click', () => {
        carousel.scrollBy({ left: -240, behavior: 'smooth' });
    });
    document.querySelector('.certi-arrow-right')?.addEventListener('click', () => {
        carousel.scrollBy({ left: 240, behavior: 'smooth' });
    });

    // Open lightbox on card click
    carousel.querySelectorAll('.certi-card').forEach(card => {
        card.addEventListener('click', () => {
            lbImg.src = card.dataset.img;
            lbImg.alt = card.dataset.title;
            lbTitle.textContent = card.dataset.title;
            lbIssuer.textContent = card.dataset.issuer;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    lbClose?.addEventListener('click', closeLightbox);
    backdrop?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
})();
