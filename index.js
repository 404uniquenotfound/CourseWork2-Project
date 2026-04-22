// ============================================================
// GeoQuest — Main JavaScript  |  js/main.js
// Day 3: Cleaned, Fixed & Fully Commented
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── 0. UTILITY ────────────────────────────────────────────
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // ── 1. DYNAMIC FOOTER YEAR ───────────────────────────────
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ── 2. MODAL SYSTEM ──────────────────────────────────────
    const nearestModal = document.getElementById('nearestModal');
    const signUpModal  = document.getElementById('signUpModal');

    /**
     * Open a modal and trap focus inside it.
     * @param {HTMLElement} modal
     */
    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        // Move focus to the close button
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }

    /**
     * Close a modal and reset its form if present.
     * @param {HTMLElement} modal
     */
    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        const form = modal.querySelector('form');
        if (form) form.reset();
        clearError('signUpError');
    }

    // Close buttons
    $$('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Click outside to close
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });

    // Escape key to close
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            $$('.modal').forEach(closeModal);
            $$('.has-dropdown').forEach(d => d.classList.remove('open'));
        }
    });

    // ── 3. SIGN-UP MODAL ─────────────────────────────────────
    function showSignUpModal() { openModal(signUpModal); }

    // Trigger from nav "Get Offers"
    const navSignUp = document.getElementById('nav-signup');
    if (navSignUp) {
        navSignUp.addEventListener('click', e => { e.preventDefault(); showSignUpModal(); });
    }

    // Sign-up form submission with validation
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', e => {
            e.preventDefault();
            clearError('signUpError');

            const email   = document.getElementById('signUpEmail')?.value.trim() || '';
            const terms   = document.getElementById('termsCheckbox')?.checked;

            // Validate email format
            if (!isValidEmail(email)) {
                setError('signUpError', 'Please enter a valid email address.');
                return;
            }
            if (!terms) {
                setError('signUpError', 'Please agree to receive offers before subscribing.');
                return;
            }

            // Show success message
            const formParent = signUpForm.parentElement;
            const success = document.createElement('div');
            success.style.cssText = 'text-align:center; color:#2ecc71; padding:1rem;';
            success.innerHTML = `<h3>✓ Subscription Confirmed!</h3>
                <p>Check your inbox at <strong>${escapeHTML(email)}</strong></p>
                <p>You'll receive exclusive deals and travel offers soon!</p>`;
            formParent.replaceChild(success, signUpForm);

            setTimeout(() => {
                closeModal(signUpModal);
                formParent.replaceChild(signUpForm, success);
            }, 2500);
        });
    }

    // ── 4. HERO BUTTONS ──────────────────────────────────────
    const heroInner = $('.hero-inner');
    if (heroInner) {
        // Location / nearest destination button
        const locationBtn = document.createElement('button');
        locationBtn.textContent = '📍 Find Nearest Destination';
        locationBtn.className   = 'btn btn-secondary';
        locationBtn.setAttribute('aria-label', 'Find the nearest destination to your location');

        // Get Offers button
        const offersBtn = document.createElement('button');
        offersBtn.textContent = '✦ Get Offers';
        offersBtn.className   = 'btn btn-primary';
        offersBtn.setAttribute('aria-label', 'Open subscription offer sign-up');

        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:0.5rem;';
        btnGroup.appendChild(locationBtn);
        btnGroup.appendChild(offersBtn);
        heroInner.appendChild(btnGroup);

        offersBtn.addEventListener('click', showSignUpModal);
        locationBtn.addEventListener('click', handleGeolocation);
    }

  
   


    // ── 9. MOBILE NAV TOGGLE ─────────────────────────────────
    const navToggle = document.getElementById('nav-toggle');
    const mainNav   = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close mobile nav on non-dropdown link click
        $$('nav#main-nav a:not(.has-dropdown > a)').forEach(a => {
            a.addEventListener('click', () => {
                mainNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── 10. SCROLL TO TOP ─────────────────────────────────────
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.removeAttribute('hidden');
            } else {
                scrollBtn.setAttribute('hidden', '');
            }
        }, { passive: true });

        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ── 11. HEADER SCROLL STYLE ───────────────────────────────
    const siteHeader = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        siteHeader?.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ── 12. HERO PARALLAX ─────────────────────────────────────
    const heroBg = $('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        }, { passive: true });
    }

    // ── 13. SCROLL REVEAL — IntersectionObserver ──────────────
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-revealed');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    $$('section, .section-heading').forEach(el => sectionObserver.observe(el));

    // Card staggered entrance
    const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = $$('.destination', entry.target.parentElement);
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 0.1}s`;
                entry.target.classList.add('card-visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    $$('.destination').forEach(c => cardObserver.observe(c));

    // ── 14. SMOOTH SCROLL ─────────────────────────────────────
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '#signup' || link.dataset.filter) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ── 15. RIPPLE EFFECT ─────────────────────────────────────
    document.addEventListener('click', e => {
        const btn = e.target.closest('button, .btn');
        if (!btn || btn.classList.contains('favorite-star') || btn.classList.contains('close')) return;

        const ripple = document.createElement('span');
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            width:${size}px; height:${size}px;
            left:${e.clientX - rect.left - size / 2}px;
            top:${e.clientY  - rect.top  - size / 2}px;
            position:absolute; background:rgba(255,255,255,0.4);
            border-radius:50%; animation:rippleEffect 0.6s ease-out;
            pointer-events:none;`;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // ── 16. SEARCH WITH AUTOCOMPLETE ──────────────────────────
    const DESTINATIONS = $$('.destination').map(el => ({
        name:      el.querySelector('h3').textContent,
        desc:      el.querySelector('p').textContent,
        continent: el.dataset.continent || '',
        type:      el.dataset.type      || '',
        emoji:     DEST_EMOJI[el.querySelector('h3').textContent] || '📍',
    }));

    const searchInput    = document.getElementById('destinationSearch');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchClear    = document.getElementById('searchClear');

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('focus', () => buildDropdown(searchInput.value));

        searchInput.addEventListener('input', () => {
            const val = searchInput.value;
            searchClear ? (val ? searchClear.removeAttribute('hidden') : searchClear.setAttribute('hidden', '')) : null;
            buildDropdown(val);
            applyFilter(val);
        });

        searchInput.addEventListener('blur', () => setTimeout(closeDropdown, 150));

        searchInput.addEventListener('keydown', e => {
            const options = $$('.search-option', searchDropdown);
            const focused = searchDropdown.querySelector('.search-option.focused');
            let idx = options.indexOf(focused);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                focused?.classList.remove('focused');
                idx = (idx + 1) % options.length;
                options[idx]?.classList.add('focused');
                options[idx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focused?.classList.remove('focused');
                idx = (idx - 1 + options.length) % options.length;
                options[idx]?.classList.add('focused');
                options[idx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter' && focused) {
                e.preventDefault();
                focused.dispatchEvent(new Event('mousedown'));
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.setAttribute('hidden', '');
                applyFilter('');
                closeDropdown();
                searchInput.focus();
                $$('.dropdown a[data-filter]').forEach(l => l.classList.remove('active-filter'));
            });
        }
    }

    function buildDropdown(query) {
        if (!searchDropdown) return;
        searchDropdown.innerHTML = '';
        const q = query.trim().toLowerCase();

        if (!q) {
            addDropdownItem('🗺️', 'All Destinations', 'Show everything', () => {
                applyFilter('');
                searchInput.value = '';
                searchClear?.setAttribute('hidden', '');
                closeDropdown();
            });

            const continents = [...new Set(DESTINATIONS.map(d => d.continent).filter(Boolean))];
            if (continents.length) {
                addDropdownDivider();
                addDropdownLabel('Browse by Region');
                continents.forEach(cont => {
                    const count = DESTINATIONS.filter(d => d.continent === cont).length;
                    addDropdownItem('🌍', cont, `${count} destination${count > 1 ? 's' : ''}`, () => {
                        applyFilter(cont);
                        searchInput.value = cont;
                        searchClear?.removeAttribute('hidden');
                        closeDropdown();
                    });
                });
            }

            const types = [...new Set(DESTINATIONS.map(d => d.type).filter(Boolean))];
            if (types.length) {
                addDropdownDivider();
                addDropdownLabel('Browse by Type');
                types.forEach(type => {
                    const emoji = { Mountain: '🏔️', Nature: '🌿', Landmark: '🏛️' }[type] || '📍';
                    addDropdownItem(emoji, type, 'Filter by type', () => {
                        applyFilter(type);
                        searchInput.value = type;
                        searchClear?.removeAttribute('hidden');
                        closeDropdown();
                    });
                });
            }
            openDropdown();
            return;
        }

        const matches = DESTINATIONS.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.continent.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q) ||
            d.desc.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
            const li = document.createElement('li');
            li.className = 'search-no-results';
            li.textContent = `No destinations match "${query}"`;
            searchDropdown.appendChild(li);
        } else {
            addDropdownLabel(`${matches.length} result${matches.length > 1 ? 's' : ''}`);
            matches.forEach(dest => {
                addDropdownItem(dest.emoji, highlightMatch(dest.name, query),
                    `${dest.continent} · ${dest.type}`, () => {
                        searchInput.value = dest.name;
                        searchClear?.removeAttribute('hidden');
                        applyFilter(dest.name);
                        closeDropdown();
                    }, true);
            });
        }
        openDropdown();
    }

    function addDropdownItem(icon, nameHTML, meta, onClick, rawHTML = false) {
        const li = document.createElement('li');
        li.className = 'search-option';
        li.innerHTML = `<span class="search-option-icon">${icon}</span>
            <span class="search-option-text">
                <span class="search-option-name">${rawHTML ? nameHTML : escapeHTML(nameHTML)}</span>
                <span class="search-option-meta">${escapeHTML(meta)}</span>
            </span>`;
        li.addEventListener('mousedown', onClick);
        searchDropdown.appendChild(li);
    }

    function addDropdownLabel(text) {
        const li = document.createElement('li');
        li.className = 'search-dropdown-label';
        li.textContent = text;
        searchDropdown.appendChild(li);
    }

    function addDropdownDivider() {
        const li = document.createElement('li');
        li.className = 'search-dropdown-divider';
        li.setAttribute('role', 'separator');
        searchDropdown.appendChild(li);
    }

    function openDropdown()  { searchDropdown?.classList.add('open'); }
    function closeDropdown() { searchDropdown?.classList.remove('open'); }

    // ── 17. DESTINATION FILTER ────────────────────────────────
    function applyFilter(query) {
        const q = query.trim().toLowerCase();
        $$('.destination').forEach(card => {
            const name      = card.querySelector('h3').textContent.toLowerCase();
            const continent = (card.dataset.continent || '').toLowerCase();
            const type      = (card.dataset.type      || '').toLowerCase();
            const desc      = (card.querySelector('p').textContent || '').toLowerCase();
            const visible   = !q || name.includes(q) || continent.includes(q) || type.includes(q) || desc.includes(q);

            card.style.display = visible ? '' : 'none';

            if (visible && q && name.includes(q)) {
                card.classList.remove('highlight-pulse');
                void card.offsetWidth; // reflow
                card.classList.add('highlight-pulse');
            }
        });
    }

    // ── 18. CURSOR GLOW ───────────────────────────────────────
    const glow = document.getElementById('cursorGlow');
    if (glow && window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX + 'px';
            glow.style.top  = e.clientY + 'px';
        }, { passive: true });
    }

    // ── HELPERS ───────────────────────────────────────────────

    /**
     * Destination emoji lookup map.
     */
    const DEST_EMOJI = {
        'Mount Everest':       '🏔️',
        'Amazon Rainforest':   '🌿',
        'Grand Canyon':        '🏜️',
        'Eiffel Tower':        '🗼',
        'Great Wall of China': '🧱',
        'Niagara Falls':       '💧',
    };

    /**
     * Wrap matched substring in a highlight span.
     */
    function highlightMatch(text, query) {
        if (!query) return escapeHTML(text);
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return escapeHTML(text);
        return escapeHTML(text.slice(0, idx)) +
               `<span class="search-match">${escapeHTML(text.slice(idx, idx + query.length))}</span>` +
               escapeHTML(text.slice(idx + query.length));
    }

    /**
     * Escape HTML to prevent XSS in dynamically-built strings.
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(String(str)));
        return div.innerHTML;
    }

    /**
     * Show a form validation error.
     */
    function setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    function clearError(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    }

    /**
     * Validate an email address.
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

}); // end DOMContentLoaded
