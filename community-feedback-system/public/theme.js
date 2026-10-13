/* Theme switcher — saves the visitor's choice in localStorage and applies it on every page. */
(function () {
    var STORAGE_KEY = 'cfs-theme';
    var DEFAULT_THEME = 'classic';

    // Add a theme here AND as a [data-theme="id"] block in theme.css
    var THEMES = [
        { id: 'classic', name: 'Classic Blue',      swatch: 'linear-gradient(135deg, #1A2A44, #3B5998)' },
        { id: 'dark',    name: 'Dark Neon',         swatch: 'linear-gradient(135deg, #050814, #00B8D4)' },
        { id: 'teal',    name: 'Teal & Green',      swatch: 'linear-gradient(135deg, #0B4F45, #84CC16)' },
        { id: 'purple',  name: 'Purple & Pink',     swatch: 'linear-gradient(135deg, #4A1D7A, #EC4899)' },
        { id: 'warm',    name: 'Warm Orange',       swatch: 'linear-gradient(135deg, #B4390A, #FACC15)' }
    ];

    function isValid(id) {
        return THEMES.some(function (t) { return t.id === id; });
    }

    function readSaved() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function apply(id) {
        if (!isValid(id)) id = DEFAULT_THEME;
        var root = document.documentElement;
        root.setAttribute('data-theme', id);
        // Lets Bootstrap's own components (inputs, cards, lists) switch to dark styling too
        root.setAttribute('data-bs-theme', id === 'dark' ? 'dark' : 'light');
        var options = document.querySelectorAll('#theme-switcher .ts-option');
        for (var i = 0; i < options.length; i++) {
            options[i].classList.toggle('active', options[i].getAttribute('data-theme-id') === id);
        }
        return id;
    }

    function save(id) {
        try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* storage blocked: theme just won't persist */ }
    }

    // Apply immediately (script runs in <head>) so the page doesn't flash the wrong theme
    apply(readSaved());

    function buildSwitcher() {
        if (document.getElementById('theme-switcher')) return;

        var wrap = document.createElement('div');
        wrap.id = 'theme-switcher';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'ts-toggle';
        toggle.setAttribute('aria-label', 'Change theme');
        toggle.title = 'Change theme';
        toggle.textContent = '\uD83C\uDFA8';

        var panel = document.createElement('div');
        panel.className = 'ts-panel';

        var title = document.createElement('div');
        title.className = 'ts-title';
        title.textContent = 'Theme';
        panel.appendChild(title);

        THEMES.forEach(function (t) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ts-option';
            btn.setAttribute('data-theme-id', t.id);

            var sw = document.createElement('span');
            sw.className = 'ts-swatch';
            sw.style.background = t.swatch;

            var label = document.createElement('span');
            label.textContent = t.name;

            btn.appendChild(sw);
            btn.appendChild(label);
            btn.addEventListener('click', function () {
                save(apply(t.id));
                wrap.classList.remove('open');
            });
            panel.appendChild(btn);
        });

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            wrap.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) wrap.classList.remove('open');
        });

        wrap.appendChild(toggle);
        wrap.appendChild(panel);
        document.body.appendChild(wrap);

        apply(readSaved()); // mark the active option
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildSwitcher);
    } else {
        buildSwitcher();
    }

    // Keep other open tabs in sync
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) apply(e.newValue);
    });
})();