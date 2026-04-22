// ============================================
// GALLERY PAGE — gallery.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ── AOS INIT ──────────────────────────────
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, once: true, offset: 60 });
    }

    // ── CURSOR GLOW ───────────────────────────
    const glow = document.getElementById('cursorGlow');
    if (glow) {
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top  = e.clientY + 'px';
        });
    }

    // ── HEADER SCROLL ─────────────────────────
    const siteHeader = document.getElementById('site-header');
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            siteHeader.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ── MOBILE NAV ────────────────────────────
    const navToggle  = document.getElementById('nav-toggle');
    const mainNav    = document.getElementById('main-nav');
    const mobileMenu = document.getElementById('mobile-menu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('open');
            if (mainNav) mainNav.classList.toggle('open', open);
            navToggle.textContent = open ? '✕ Close' : '☰ Menu';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#site-header') && !e.target.closest('#mobile-menu')) {
                mobileMenu.classList.remove('open');
                if (mainNav) mainNav.classList.remove('open');
                navToggle.textContent = '☰ Menu';
            }
        });
    }

    // ── SCROLL TO TOP ─────────────────────────
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
        }, { passive: true });
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── FILTER ────────────────────────────────
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const cards        = document.querySelectorAll('.gallery-card');
    const visibleCount = document.getElementById('visible-count');
    const emptyState   = document.getElementById('gallery-empty');

    let activeFilter = 'all';

    function applyFilter(filter) {
        activeFilter = filter;
        let count = 0;

        cards.forEach((card) => {
            const cats = card.dataset.category || '';
            const show = filter === 'all' || cats.includes(filter);

            if (show) {
                card.style.display = '';
                card.classList.remove('hidden');
                count++;
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });

        if (visibleCount) visibleCount.textContent = count;
        if (emptyState)   emptyState.style.display = count === 0 ? 'block' : 'none';

        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    // ── FAVOURITES (safe localStorage) ────────
    let favourites = [];
    try { favourites = JSON.parse(localStorage.getItem('geoquest-favs') || '[]'); } catch(e) {}

    function saveFavourites() {
        try { localStorage.setItem('geoquest-favs', JSON.stringify(favourites)); } catch(e) {}
    }

    function updateFavBtn(btn, name) {
        const isFav = favourites.includes(name);
        btn.classList.toggle('active', isFav);
        btn.title = isFav ? 'Remove from favourites' : 'Add to favourites';
    }

    cards.forEach(card => {
        const btn  = card.querySelector('.card-fav-btn');
        const name = card.dataset.name;
        if (btn && name) {
            updateFavBtn(btn, name);
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (favourites.includes(name)) {
                    favourites = favourites.filter(f => f !== name);
                } else {
                    favourites.push(name);
                }
                saveFavourites();
                updateFavBtn(btn, name);
                syncLightboxFav();
            });
        }
    });

    // ── LIGHTBOX ──────────────────────────────
    const lightbox  = document.getElementById('lightbox');
    const lbImg     = document.getElementById('lb-img');
    const lbTitle   = document.getElementById('lb-title');
    const lbCountry = document.getElementById('lb-country');
    const lbDesc    = document.getElementById('lb-desc');
    const lbType    = document.getElementById('lb-type');
    const lbBest    = document.getElementById('lb-best');
    const lbCat     = document.getElementById('lb-cat');
    const lbClose   = document.getElementById('lb-close');
    const lbPrev    = document.getElementById('lb-prev');
    const lbNext    = document.getElementById('lb-next');
    const lbFav     = document.getElementById('lb-fav');
    const lbExplore = document.getElementById('lb-explore');

    let visibleCards = [];
    let currentIndex = 0;

    function getVisibleCards() {
        return [...cards].filter(c => c.style.display !== 'none');
    }

    function openLightbox(card) {
        visibleCards = getVisibleCards();
        currentIndex = visibleCards.indexOf(card);
        populateLightbox(card);
        // FIX: CSS uses .active not .open
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function populateLightbox(card) {
        const img     = card.querySelector('img');
        const name    = card.dataset.name    || '';
        const country = card.dataset.country || '';
        const desc    = card.dataset.desc    || '';
        const type    = card.dataset.type    || '';
        const best    = card.dataset.best    || '—';
        const cats    = card.dataset.category || '';

        lbImg.src             = img ? img.src : '';
        lbImg.alt             = name;
        lbTitle.textContent   = name;
        lbCountry.textContent = country;
        lbDesc.textContent    = desc;
        lbType.textContent    = type;
        lbBest.textContent    = best;
        lbCat.textContent     = cats.split(' ').map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');

        lbImg.style.opacity = '0';
        lbImg.onload = () => {
            lbImg.style.transition = 'opacity 0.4s ease';
            lbImg.style.opacity    = '1';
        };
        if (lbImg.complete) lbImg.style.opacity = '1';

        syncLightboxFav();
    }

    function syncLightboxFav() {
        if (!lbFav) return;
        const card = visibleCards[currentIndex];
        if (!card) return;
        const name  = card.dataset.name || '';
        const isFav = favourites.includes(name);
        lbFav.classList.toggle('active', isFav);
        lbFav.title = isFav ? 'Remove from favourites' : 'Add to favourites';
    }

    function navigate(dir) {
        if (!visibleCards.length) return;
        currentIndex = (currentIndex + dir + visibleCards.length) % visibleCards.length;
        populateLightbox(visibleCards[currentIndex]);
    }

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-fav-btn')) return;
            openLightbox(card);
        });
    });

    if (lbClose)   lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)    lbPrev.addEventListener('click',  () => navigate(-1));
    if (lbNext)    lbNext.addEventListener('click',  () => navigate(1));

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   navigate(-1);
        if (e.key === 'ArrowRight')  navigate(1);
    });

    if (lbFav) {
        lbFav.addEventListener('click', () => {
            const card = visibleCards[currentIndex];
            if (!card) return;
            const name = card.dataset.name || '';
            if (favourites.includes(name)) {
                favourites = favourites.filter(f => f !== name);
            } else {
                favourites.push(name);
            }
            saveFavourites();
            syncLightboxFav();
            const cardBtn = card.querySelector('.card-fav-btn');
            if (cardBtn) updateFavBtn(cardBtn, name);
        });
    }

    if (lbExplore) {
        lbExplore.addEventListener('click', () => {
            closeLightbox();
            window.location.href = 'destination.html';
        });
    }

    // ── TOUCH / SWIPE ─────────────────────────
    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // ── ANIMATED STAT COUNTERS ────────────────
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.textContent.replace(/\D/g, ''), 10);
            if (isNaN(target)) return;
            let current = 0;
            const step  = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = current + (el.dataset.suffix || '');
                if (current >= target) clearInterval(timer);
            }, 30);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));

});
