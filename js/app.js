/* ============================================================
   YASH ADAKE — PORTFOLIO · app.js
   Consolidated, framework-free. Replaces core/effects/motion/
   delights/palette/hero3d/elite-improvements + Bootstrap + AOS.
   ============================================================ */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCRIPT_URL = 'https://yashadake-form.yashadake91.workers.dev/';

    /* ---------- Preloader -------------------------------------- */
    window.addEventListener('load', () => {
        const el = $('#loading');
        if (el) setTimeout(() => el.classList.add('done'), 250);
    });

    /* ---------- Year ------------------------------------------- */
    const yearEl = $('#currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Theme ------------------------------------------ */
    (function theme() {
        const btn = $('#themeToggle');
        const use = $('#themeIcon use');
        if (!btn || !use) return;
        const setIcon = (light) => use.setAttribute('href', light ? '#i-moon' : '#i-sun');
        const stored = localStorage.getItem('theme');
        const light = stored ? stored === 'light' : false;
        document.body.classList.toggle('light-mode', light);
        setIcon(light);
        btn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            setIcon(isLight);
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            const meta = $('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', isLight ? '#F6F7F9' : '#0B0E14');
        });
    })();

    /* ---------- Mobile nav panel ------------------------------- */
    (function navPanel() {
        const toggle = $('#navToggle');
        const panel = $('#navPanel');
        if (!toggle || !panel) return;
        const useEl = $('use', toggle);
        const setOpen = (open) => {
            panel.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (useEl) useEl.setAttribute('href', open ? '#i-close' : '#i-menu');
        };
        toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
        panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
    })();

    /* ---------- Scroll: progress, nav state, to-top, hint ------ */
    (function scrollChrome() {
        const nav = $('#siteNav');
        const progress = $('#scrollProgress');
        const toTop = $('#scrollToTop');
        const hint = $('.scroll-hint');
        let docH = 0, ticking = false;
        const measure = () => { docH = document.documentElement.scrollHeight - window.innerHeight; };
        measure();
        window.addEventListener('resize', measure, { passive: true });

        function frame() {
            const y = window.scrollY;
            if (nav) nav.classList.toggle('scrolled', y > 12);
            if (toTop) toTop.classList.toggle('visible', y > 600);
            if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
            if (hint) hint.style.opacity = y > 80 ? '0' : '';
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(frame); ticking = true; }
        }, { passive: true });

        toTop && toTop.addEventListener('click', () =>
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
    })();

    /* ---------- Close mobile panel on any in-page anchor ------- */
    // Native smooth scroll + scroll-padding-top handle the offset (CSS).

    /* ---------- Active nav link (IntersectionObserver) -------- */
    (function activeNav() {
        const links = $$('.nav-link');
        if (!links.length) return;
        const byId = new Map(links.map(l => [l.getAttribute('href').slice(1), l]));
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    byId.get(e.target.id)?.classList.add('active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        $$('main section[id]').forEach(s => io.observe(s));
    })();

    /* ---------- Scroll reveal (replaces AOS) ------------------ */
    (function reveal() {
        const items = $$('[data-reveal]');
        if (!items.length) return;
        if (prefersReduced) { items.forEach(i => i.classList.add('is-visible')); return; }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
        items.forEach(i => io.observe(i));
    })();

    /* ---------- Copy buttons ---------------------------------- */
    $$('.copy-btn[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copy;
            const done = () => {
                const orig = btn.textContent;
                btn.textContent = 'Copied';
                setTimeout(() => { btn.textContent = orig; }, 1800);
            };
            navigator.clipboard?.writeText(text).then(done).catch(done);
        });
    });

    /* ---------- Contact form ---------------------------------- */
    (function contactForm() {
        const form = document.forms['submit-to-google-sheet'];
        const msg = $('#msg');
        if (!form) return;
        const rules = {
            name: { ok: v => v.trim().length >= 2, msg: 'Name must be at least 2 characters.' },
            email: { ok: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), msg: 'Enter a valid email (name@example.com).' },
            subject: { ok: v => v.trim().length >= 3, msg: 'Subject must be at least 3 characters.' },
            message: { ok: v => v.trim().length >= 10, msg: 'Message must be at least 10 characters.' }
        };
        const fieldErr = (id) => $('#' + id + 'Error');
        const group = (id) => $('#' + id)?.closest('.form-group');
        function check(id) {
            const f = $('#' + id); if (!f) return true;
            const valid = rules[id].ok(f.value);
            group(id)?.classList.toggle('invalid', !valid);
            const e = fieldErr(id); if (e) e.textContent = valid ? '' : rules[id].msg;
            return valid;
        }
        Object.keys(rules).forEach(id => {
            const f = $('#' + id); if (!f) return;
            f.addEventListener('blur', () => check(id));
            f.addEventListener('input', () => { if (group(id)?.classList.contains('invalid')) check(id); });
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const allValid = Object.keys(rules).map(check).every(Boolean);
            if (!allValid) {
                msg.textContent = 'Please fix the errors above.';
                msg.className = 'message error';
                $('#' + Object.keys(rules).find(id => !rules[id].ok($('#' + id).value)))?.focus();
                return;
            }
            const btn = $('#submitBtn');
            const txt = $('.btn-text', btn);
            const reset = () => { txt.textContent = 'Send message'; btn.disabled = false; };
            txt.textContent = 'Sending…'; btn.disabled = true;
            msg.textContent = ''; msg.className = 'message';
            fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form) })
                .then(r => r.json().catch(() => ({ success: r.ok })))
                .then(data => {
                    if (!data || data.success === false) throw new Error('fail');
                    msg.textContent = 'Thanks for reaching out — I\'ll reply within 1–2 business days.';
                    msg.className = 'message success';
                    txt.textContent = 'Message sent';
                    form.reset();
                    Object.keys(rules).forEach(id => group(id)?.classList.remove('invalid'));
                    setTimeout(() => { msg.textContent = ''; msg.className = 'message'; reset(); }, 5000);
                })
                .catch(() => {
                    msg.textContent = 'Something went wrong. Please try again or email me directly.';
                    msg.className = 'message error';
                    reset();
                });
        });
    })();

    /* ---------- Visitor counter (cached + bg fetch, timeout) -- */
    (function visitors() {
        const el = $('#visitorCount');
        if (!el) return;
        const FALLBACK = 850;
        const cached = parseInt(localStorage.getItem('vc_last'), 10);
        if (cached) el.textContent = cached.toLocaleString();
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        fetch(`${SCRIPT_URL}?action=count`, { signal: ctrl.signal })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(d => {
                if (d && d.success && typeof d.count === 'number') {
                    el.textContent = d.count.toLocaleString();
                    localStorage.setItem('vc_last', d.count);
                } else if (!cached) { el.textContent = FALLBACK.toLocaleString(); }
            })
            .catch(() => { if (!cached) el.textContent = FALLBACK.toLocaleString(); })
            .finally(() => clearTimeout(t));
    })();

    /* ---------- Certificate carousel + lightbox -------------- */
    (function certi() {
        const carousel = $('#certiCarousel');
        const lb = $('#certiLightbox');
        if (!carousel || !lb) return;
        const img = $('#certiLightboxImg'), title = $('#certiLightboxTitle'), issuer = $('#certiLightboxIssuer');
        const closeBtn = $('.certi-lightbox-close', lb), backdrop = $('.certi-lightbox-backdrop', lb);
        let lastFocus = null;
        const step = 240;
        $('.certi-arrow-left')?.addEventListener('click', () => carousel.scrollBy({ left: -step, behavior: 'smooth' }));
        $('.certi-arrow-right')?.addEventListener('click', () => carousel.scrollBy({ left: step, behavior: 'smooth' }));
        function open(card) {
            lastFocus = card;
            img.src = card.dataset.img; img.alt = card.dataset.title;
            title.textContent = card.dataset.title; issuer.textContent = card.dataset.issuer;
            lb.classList.add('open'); document.body.style.overflow = 'hidden'; closeBtn?.focus();
        }
        function close() {
            lb.classList.remove('open'); document.body.style.overflow = '';
            if (lastFocus) { lastFocus.focus(); lastFocus = null; }
        }
        $$('.certi-card', carousel).forEach(card => {
            card.addEventListener('click', () => open(card));
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
            });
        });
        closeBtn?.addEventListener('click', close);
        backdrop?.addEventListener('click', close);
        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'Tab') { e.preventDefault(); closeBtn?.focus(); }
        });
    })();

    /* ---------- Command palette (⌘K console) ----------------- */
    const palette = (function cmdk() {
        const scrollTo = (sel) => { close(); $(sel)?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' }); };
        const go = (url, blank = true) => { close(); blank ? window.open(url, '_blank', 'noopener') : (location.href = url); };
        const copy = (t) => { navigator.clipboard?.writeText(t); close(); };
        const commands = [
            { g: 'Navigate', t: 'Home', run: () => scrollTo('#home') },
            { g: 'Navigate', t: 'Products', run: () => scrollTo('#products') },
            { g: 'Navigate', t: 'Selected work', run: () => scrollTo('#work') },
            { g: 'Navigate', t: 'About', run: () => scrollTo('#about') },
            { g: 'Navigate', t: 'Writing', run: () => scrollTo('#writing') },
            { g: 'Navigate', t: 'Contact', run: () => scrollTo('#contact') },
            { g: 'Products', t: 'Open MyJSON', s: 'live', run: () => go('https://myjson.yashadake.com') },
            { g: 'Products', t: 'Open AirDraw', s: 'live', run: () => go('https://airdraw.yashadake.com') },
            { g: 'Products', t: 'OptiResume', s: 'soon', run: () => go('coming-soon.html?product=optiresume', false) },
            { g: 'Actions', t: 'Toggle theme', run: () => { close(); $('#themeToggle')?.click(); } },
            { g: 'Actions', t: 'Copy email', s: 'yashadakeofficial@gmail.com', run: () => copy('yashadakeofficial@gmail.com') },
            { g: 'Actions', t: 'Download résumé', run: () => go('photos/Yash-Adake_Resume.pdf', false) },
            { g: 'Links', t: 'LinkedIn', run: () => go('https://www.linkedin.com/in/yash-adake/') },
            { g: 'Links', t: 'GitHub', run: () => go('https://github.com/YashAdake') },
            { g: 'Links', t: 'Twitter / X', run: () => go('https://twitter.com/yash_adake') },
            { g: 'Links', t: 'WhatsApp', run: () => go('https://wa.me/917715982570') }
        ];

        const root = document.createElement('div');
        root.className = 'cmdk';
        root.innerHTML =
            '<div class="cmdk-backdrop" data-close></div>' +
            '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Command menu">' +
            '<input class="cmdk-input" type="text" placeholder="Type a command or search…" aria-label="Command search" autocomplete="off" spellcheck="false">' +
            '<div class="cmdk-list" role="listbox"></div>' +
            '<div class="cmdk-footer">↑↓ navigate · ↵ select · esc close</div>' +
            '</div>';
        document.body.appendChild(root);
        const input = $('.cmdk-input', root);
        const list = $('.cmdk-list', root);
        let filtered = [], sel = 0, lastFocus = null;

        function render() {
            const q = input.value.trim().toLowerCase();
            filtered = commands.filter(c => !q || (c.t + ' ' + c.g + ' ' + (c.s || '')).toLowerCase().includes(q));
            sel = 0;
            let html = '', lastG = '';
            filtered.forEach((c, i) => {
                if (c.g !== lastG) { html += `<div class="cmdk-group-label">${c.g}</div>`; lastG = c.g; }
                html += `<div class="cmdk-item${i === 0 ? ' selected' : ''}" role="option" data-i="${i}">` +
                    `<span>${c.t}</span>${c.s ? `<span class="cmdk-item-sub">${c.s}</span>` : ''}</div>`;
            });
            list.innerHTML = html || '<div class="cmdk-group-label">No results</div>';
        }
        function move(d) {
            if (!filtered.length) return;
            sel = (sel + d + filtered.length) % filtered.length;
            $$('.cmdk-item', list).forEach((el, i) => el.classList.toggle('selected', i === sel));
            $$('.cmdk-item', list)[sel]?.scrollIntoView({ block: 'nearest' });
        }
        function open() {
            lastFocus = document.activeElement;
            root.classList.add('open');
            input.value = ''; render();
            input.focus();
            document.dispatchEvent(new CustomEvent('palette:open'));
        }
        function close() {
            root.classList.remove('open');
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (item) filtered[+item.dataset.i]?.run();
        });
        list.addEventListener('mousemove', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (item) { sel = +item.dataset.i; $$('.cmdk-item', list).forEach((el, i) => el.classList.toggle('selected', i === sel)); }
        });
        input.addEventListener('input', render);
        root.addEventListener('click', (e) => { if (e.target.dataset.close !== undefined) close(); });
        document.addEventListener('keydown', (e) => {
            const cmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
            if (cmdK) { e.preventDefault(); root.classList.contains('open') ? close() : open(); return; }
            if (!root.classList.contains('open')) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); filtered[sel]?.run(); }
        });
        $('#navConsole')?.addEventListener('click', open);
        $('#cmdkFab')?.addEventListener('click', open);
        return { open, close };
    })();

    /* ---------- Custom cursor (desktop, fine pointer) -------- */
    (function cursor() {
        if (prefersReduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const el = $('#cursor'), dot = $('.cursor-dot', el), label = $('#cursorLabel');
        if (!el) return;
        document.body.classList.add('cursor-on');
        const labels = [
            ['.work-card', 'View'], ['.certi-card', 'View cert'], ['.writing-item', 'Read'],
            ['a[href^="mailto"]', 'Email'], ['a[href*="wa.me"]', 'Chat'], ['.btn', '']
        ];
        let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
        function loop() {
            x += (tx - x) * 0.25; y += (ty - y) * 0.25;
            el.style.transform = `translate(${x}px, ${y}px)`;
            raf = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
        }
        window.addEventListener('pointermove', (e) => {
            tx = e.clientX; ty = e.clientY;
            if (!raf) raf = requestAnimationFrame(loop);
            const hit = labels.find(([sel]) => e.target.closest(sel));
            if (hit && hit[1]) { label.textContent = hit[1]; el.classList.add('has-label'); }
            else el.classList.remove('has-label');
            dot.style.transform = (hit ? 'translate(-50%,-50%) scale(1.8)' : 'translate(-50%,-50%) scale(1)');
        }, { passive: true });
        document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
    })();

    /* ---------- Hero topology pulses (desktop + motion) ------ */
    (function heroField() {
        const canvas = $('#heroCanvas');
        const hero = $('#home');
        if (!canvas || !hero || prefersReduced) return;
        if (!window.matchMedia('(min-width: 768px)').matches) return;

        document.body.classList.add('hero-canvas-on'); // hides static SVG (CSS)
        const ctx = canvas.getContext('2d');
        // Fractional node layout (0..1) — mirrors the static SVG topology
        const nodes = [
            [0.10, 0.23], [0.30, 0.43], [0.25, 0.73], [0.53, 0.30],
            [0.75, 0.50], [0.63, 0.70], [0.90, 0.33], [0.50, 0.87], [0.87, 0.77]
        ];
        const edges = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [4, 6], [4, 8], [2, 7], [5, 7], [7, 8]];
        const accent = new Set([3, 4]);
        let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), running = false, raf = 0;
        const pulses = edges.map((e, i) => ({ e, p: Math.random(), speed: 0.0016 + Math.random() * 0.0018, on: i % 2 === 0 }));

        const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();
        function resize() {
            const r = hero.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        const pt = (i) => [nodes[i][0] * W, nodes[i][1] * H];
        function draw() {
            ctx.clearRect(0, 0, W, H);
            const line = css('--line-strong') || 'rgba(255,255,255,.16)';
            const acc = css('--accent') || '#7C8CF8';
            const dim = css('--text-mute') || '#7B8698';
            ctx.lineWidth = 1;
            edges.forEach(([a, b]) => {
                const [ax, ay] = pt(a), [bx, by] = pt(b);
                ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
            });
            pulses.forEach(pl => {
                if (!pl.on) return;
                pl.p += pl.speed; if (pl.p > 1) { pl.p = 0; pl.on = Math.random() > 0.3; }
                const [a, b] = pl.e, [ax, ay] = pt(a), [bx, by] = pt(b);
                const px = ax + (bx - ax) * pl.p, py = ay + (by - ay) * pl.p;
                ctx.fillStyle = acc; ctx.globalAlpha = Math.sin(pl.p * Math.PI);
                ctx.shadowColor = acc; ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            });
            nodes.forEach((n, i) => {
                const isA = accent.has(i);
                ctx.fillStyle = isA ? acc : dim;
                ctx.globalAlpha = isA ? 0.95 : 0.5;
                if (isA) { ctx.shadowColor = acc; ctx.shadowBlur = 10; }
                ctx.beginPath(); ctx.arc(n[0] * W, n[1] * H, isA ? 3.6 : 2.2, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            });
            // occasionally re-arm pulses so the field keeps breathing
            if (Math.random() < 0.01) { const k = (Math.random() * pulses.length) | 0; pulses[k].on = true; }
            raf = requestAnimationFrame(draw);
        }
        function start() { if (!running) { running = true; resize(); raf = requestAnimationFrame(draw); } }
        function stop() { running = false; cancelAnimationFrame(raf); }

        let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(resize, 150); }, { passive: true });
        document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
        const io = new IntersectionObserver((es) => es[0].isIntersecting ? start() : stop(), { threshold: 0.01 });
        io.observe(hero);
    })();

    /* ---------- Metric count-up ------------------------------- */
    (function countUp() {
        if (prefersReduced) return;
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target, raw = el.textContent.trim();
                obs.unobserve(el);
                if (!/^\d+$/.test(raw)) return;
                const target = +raw, dur = 1000, t0 = performance.now();
                const tick = (now) => {
                    const p = Math.min(1, (now - t0) / dur);
                    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
                    if (p < 1) requestAnimationFrame(tick); else el.textContent = String(target);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.6 });
        $$('.metric-value').forEach(el => io.observe(el));
    })();

    /* ---------- Magnetic buttons (desktop, fine pointer) ------ */
    (function magnetic() {
        if (prefersReduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        $$('.btn').forEach(btn => {
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const mx = e.clientX - (r.left + r.width / 2);
                const my = e.clientY - (r.top + r.height / 2);
                btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.32}px)`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
        });
    })();

    /* ---------- Console banner -------------------------------- */
    console.log('%cYash Adake — Software Engineer', 'color:#7C8CF8;font:600 14px monospace');
    console.log('linkedin.com/in/yash-adake · github.com/YashAdake · ⌘K to explore');
})();
