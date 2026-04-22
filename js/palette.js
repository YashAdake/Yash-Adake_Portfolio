// ============================================
// COMMAND PALETTE — v10.0
// ⌘K / Ctrl+K activates. Raycast / Linear / Vercel style.
// ============================================

(function commandPalette() {
    const commands = [
        // Navigate
        { id: 'nav-home',    group: 'Navigate', icon: 'bx-home-alt',     title: 'Home',         sub: '#home',    action: () => scrollTo('#home') },
        { id: 'nav-work',    group: 'Navigate', icon: 'bx-briefcase',    title: 'Work',         sub: '#work',    action: () => scrollTo('#work') },
        { id: 'nav-about',   group: 'Navigate', icon: 'bx-user',         title: 'About',        sub: '#about',   action: () => scrollTo('#about') },
        { id: 'nav-writing', group: 'Navigate', icon: 'bx-edit-alt',     title: 'Writing',      sub: '#writing', action: () => scrollTo('#writing') },
        { id: 'nav-contact', group: 'Navigate', icon: 'bx-envelope',     title: 'Contact',      sub: '#contact', action: () => scrollTo('#contact') },

        // Contact / copy
        { id: 'copy-email',  group: 'Contact',  icon: 'bx-copy',         title: 'Copy email',   sub: 'yashadakeofficial@gmail.com',  action: () => copy('yashadakeofficial@gmail.com', 'Email copied') },
        { id: 'copy-phone',  group: 'Contact',  icon: 'bx-phone',        title: 'Copy phone',   sub: '+91 77159 82570',              action: () => copy('+917715982570', 'Phone copied') },
        { id: 'whatsapp',    group: 'Contact',  icon: 'bxl-whatsapp',    title: 'WhatsApp chat',sub: 'Opens in new tab',             action: () => open('https://wa.me/917715982570?text=Hi%20Yash!%20I%20visited%20your%20portfolio.') },
        { id: 'send-email',  group: 'Contact',  icon: 'bx-envelope',     title: 'Compose email',sub: 'Opens your mail client',       action: () => open('mailto:yashadakeofficial@gmail.com') },

        // Links
        { id: 'linkedin',    group: 'Links',    icon: 'bxl-linkedin',    title: 'LinkedIn',     sub: 'linkedin.com/in/yash-adake',   action: () => open('https://www.linkedin.com/in/yash-adake/') },
        { id: 'github',      group: 'Links',    icon: 'bxl-github',      title: 'GitHub',       sub: 'github.com/YashAdake',         action: () => open('https://github.com/YashAdake') },
        { id: 'twitter',     group: 'Links',    icon: 'bxl-twitter',     title: 'Twitter',      sub: '@yash_adake',                  action: () => open('https://twitter.com/yash_adake') },
        { id: 'instagram',   group: 'Links',    icon: 'bxl-instagram',   title: 'Instagram',    sub: '@yash_adake',                  action: () => open('https://www.instagram.com/yash_adake/') },

        // Projects
        { id: 'proj-navaved',group: 'Projects', icon: 'bx-link-external',title: 'Visit Navaved Agro', sub: 'navavedagro.in',          action: () => open('https://navavedagro.in/') },
        { id: 'proj-urja',   group: 'Projects', icon: 'bx-link-external',title: 'Visit Urja Solar',   sub: 'urjasolar.netlify.app',   action: () => open('https://urjasolar.netlify.app/') },
        { id: 'arthavedh',   group: 'Projects', icon: 'bx-building',     title: 'Visit ArthaVedh',    sub: 'arthavedh.com',           action: () => open('https://arthavedh.com/') },

        // Actions
        { id: 'resume',      group: 'Actions',  icon: 'bx-download',     title: 'Download résumé',sub: 'Yash-Adake_Resume.pdf',       action: () => open('photos/Yash-Adake_Resume.pdf', true) },
        { id: 'theme',       group: 'Actions',  icon: 'bx-moon',         title: 'Toggle theme',   sub: 'Dark ↔ Light',                action: () => document.getElementById('themeToggle')?.click() },
        { id: 'konami',      group: 'Actions',  icon: 'bx-game',         title: 'Trigger easter egg', sub: '↑↑↓↓←→←→BA',              action: () => window.dispatchEvent(new CustomEvent('activate-easter-egg')) },
    ];

    // Build DOM
    const overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML = `
        <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Command palette">
            <div class="cmdk-search">
                <i class='bx bx-search cmdk-search-icon'></i>
                <input type="text" class="cmdk-input" id="cmdkInput" placeholder="Type a command or search…" autocomplete="off" spellcheck="false" />
                <kbd class="cmdk-kbd">ESC</kbd>
            </div>
            <div class="cmdk-list" id="cmdkList" role="listbox"></div>
            <div class="cmdk-footer">
                <span class="cmdk-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                <span class="cmdk-hint"><kbd>↵</kbd> select</span>
                <span class="cmdk-hint"><kbd>esc</kbd> close</span>
                <span class="cmdk-brand">Yash · palette</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    const panel = overlay.querySelector('.cmdk-panel');

    let selectedIndex = 0;
    let filtered = [...commands];
    let isOpen = false;

    function render() {
        if (filtered.length === 0) {
            list.innerHTML = '<div class="cmdk-empty">No results. Try another search.</div>';
            return;
        }

        // Group by category
        const groups = {};
        filtered.forEach(cmd => {
            if (!groups[cmd.group]) groups[cmd.group] = [];
            groups[cmd.group].push(cmd);
        });

        let html = '';
        let globalIndex = 0;
        Object.keys(groups).forEach(groupName => {
            html += `<div class="cmdk-group-label">${groupName}</div>`;
            groups[groupName].forEach(cmd => {
                const isSelected = globalIndex === selectedIndex;
                html += `
                    <div class="cmdk-item ${isSelected ? 'selected' : ''}" data-idx="${globalIndex}" role="option">
                        <i class='bx ${cmd.icon} cmdk-item-icon'></i>
                        <div class="cmdk-item-text">
                            <div class="cmdk-item-title">${cmd.title}</div>
                            <div class="cmdk-item-sub">${cmd.sub}</div>
                        </div>
                        <i class='bx bx-right-arrow-alt cmdk-item-arrow'></i>
                    </div>
                `;
                globalIndex++;
            });
        });
        list.innerHTML = html;

        // Click handlers
        list.querySelectorAll('.cmdk-item').forEach(el => {
            const idx = parseInt(el.dataset.idx, 10);
            el.addEventListener('click', () => execute(filtered[idx]));
            el.addEventListener('mouseenter', () => {
                selectedIndex = idx;
                refreshSelection();
            });
        });

        // Scroll selected into view
        const selectedEl = list.querySelector('.cmdk-item.selected');
        if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
    }

    function refreshSelection() {
        list.querySelectorAll('.cmdk-item').forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === selectedIndex);
        });
        const selectedEl = list.querySelector('.cmdk-item.selected');
        if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
    }

    function filter(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            filtered = [...commands];
        } else {
            filtered = commands.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.sub.toLowerCase().includes(q) ||
                c.group.toLowerCase().includes(q)
            );
        }
        selectedIndex = 0;
        render();
    }

    function execute(cmd) {
        if (!cmd) return;
        close();
        setTimeout(() => cmd.action(), 150);
    }

    function open(href, download) {
        if (download) {
            const a = document.createElement('a');
            a.href = href;
            a.download = '';
            a.click();
        } else {
            window.open(href, '_blank', 'noopener,noreferrer');
        }
    }

    function copy(text, toastMsg) {
        navigator.clipboard.writeText(text).then(() => showToast(toastMsg));
    }

    function scrollTo(sel) {
        const t = document.querySelector(sel);
        if (!t) return;
        const top = t.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'cmdk-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('visible'));
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    function openPalette() {
        if (isOpen) return;
        isOpen = true;
        document.body.classList.add('cmdk-open');
        overlay.classList.add('visible');
        filter('');
        setTimeout(() => input.focus(), 50);
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        document.body.classList.remove('cmdk-open');
        overlay.classList.remove('visible');
        input.value = '';
    }

    // Keyboard
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            isOpen ? close() : openPalette();
            return;
        }
        if (!isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
            refreshSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(0, selectedIndex - 1);
            refreshSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            execute(filtered[selectedIndex]);
        }
    });

    input.addEventListener('input', e => filter(e.target.value));

    // Click outside to close
    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    // Floating trigger hint (small ⌘K badge bottom-right, hidden on mobile)
    if (window.innerWidth > 768) {
        const hint = document.createElement('button');
        hint.className = 'cmdk-trigger';
        hint.setAttribute('aria-label', 'Open command palette');
        const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
        hint.innerHTML = `<kbd>${isMac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd>`;
        hint.addEventListener('click', openPalette);
        document.body.appendChild(hint);
    }

    // Mobile: add trigger to navbar (text link)
    if (window.innerWidth <= 991) {
        // Floating action button for touch devices
        const fab = document.createElement('button');
        fab.className = 'cmdk-fab';
        fab.setAttribute('aria-label', 'Open command palette');
        fab.innerHTML = "<i class='bx bx-search-alt-2'></i>";
        fab.addEventListener('click', openPalette);
        document.body.appendChild(fab);
    }
})();
