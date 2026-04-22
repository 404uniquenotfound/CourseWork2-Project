(() => {
    /* ── Cursor glow ── */
    const glow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    });

    /* ── Header scroll ── */
    window.addEventListener('scroll', () => {
        document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* ── Mobile nav ── */
    const navToggle = document.getElementById('nav-toggle');
    const navEl     = document.getElementById('main-nav');
    const mobMenu   = document.getElementById('mobileMenu');
    navToggle.addEventListener('click', () => {
        const open = mobMenu.classList.toggle('open');
        navEl.classList.toggle('open', open);
        navToggle.textContent = open ? '✕ Close' : '☰ Menu';
    });

    /* ── Dropdown hover ── */
    document.querySelectorAll('.has-dropdown').forEach(li => {
        li.addEventListener('mouseenter', () => li.classList.add('open'));
        li.addEventListener('mouseleave', () => li.classList.remove('open'));
    });

    /* ── Scroll-to-top ── */
    const scrollBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ══════════════════════════════════════════════════
       LIGHTBOX — gallery-identical logic
       ══════════════════════════════════════════════════ */
    const lightbox    = document.getElementById('srvLightbox');
    const lbImg       = document.getElementById('lbImg');
    const lbTitle     = document.getElementById('lbTitle');
    const lbCat       = document.getElementById('lbCat');
    const lbDesc      = document.getElementById('lbDesc');
    const lbFeatures  = document.getElementById('lbFeatures');
    const lbStrip     = document.getElementById('lbStrip');
    const lbCounter   = document.getElementById('lbCounter');
    const lbBadgeIcon = document.getElementById('lbBadgeIcon');
    const lbBadgeTag  = document.getElementById('lbBadgeTag');
    const lbClose     = document.getElementById('lbClose');
    const lbPrev      = document.getElementById('lbPrev');
    const lbNext      = document.getElementById('lbNext');

    const cards = Array.from(document.querySelectorAll('.srv-card'));

    let currentIndex = 0;

    /* ── Make cards visible on scroll ── */
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    cards.forEach(card => cardObserver.observe(card));

    /* smooth image fade on navigate */
    lbImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    function populateLightbox(card) {
        const d = card.dataset;
        const total = cards.length;
        currentIndex = cards.indexOf(card);

        lbCounter.textContent =
            String(currentIndex + 1).padStart(2,'0') + ' / ' +
            String(total).padStart(2,'0');

        lbImg.src = d.img || '';
        lbImg.alt = d.title || '';

        lbBadgeIcon.innerHTML = `<i class="fas ${d.icon || 'fa-compass'}"></i>`;
        lbBadgeTag.textContent = d.cat || '';

        lbTitle.textContent = d.title || '';
        lbCat.textContent   = d.cat   || '';
        lbDesc.textContent  = d.desc  || '';

        lbFeatures.innerHTML = '';
        (d.features || '').split('|').forEach(f => {
            if (!f.trim()) return;
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle"></i> ${f.trim()}`;
            lbFeatures.appendChild(li);
        });

        lbStrip.innerHTML = '';
        (d.strip || '').split('|').forEach(src => {
            if (!src.trim()) return;
            const img = document.createElement('img');
            img.src = src.trim();
            img.alt = '';
            img.loading = 'lazy';
            lbStrip.appendChild(img);
        });
    }

    function openLightbox(card) {
        populateLightbox(card);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        currentIndex = (currentIndex + dir + cards.length) % cards.length;
        lbImg.style.opacity   = '0';
        lbImg.style.transform = 'scale(0.97)';
        setTimeout(() => {
            populateLightbox(cards[currentIndex]);
            lbImg.style.opacity   = '1';
            lbImg.style.transform = 'scale(1)';
        }, 180);
    }

    cards.forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    });

})();


// ------------------------------------------
// ANIMATED COUNTERS
// ------------------------------------------

function animateCounter(el, target, suffix = '') {
    const duration  = 1800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed  = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = Math.round(eased * target);

        el.textContent = value.toLocaleString() + suffix;

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el        = entry.target;
            const target    = parseInt(el.dataset.target, 10);
            const labelText = el.closest('.stat-item').querySelector('.stat-label').textContent;
            let suffix = '';

            if (labelText.includes('%')) {
                suffix = '%';
            } else if (labelText.includes('Countries') || labelText.includes('Travellers') || labelText.includes('Years')) {
                suffix = '+';
            }

            animateCounter(el, target, suffix);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));