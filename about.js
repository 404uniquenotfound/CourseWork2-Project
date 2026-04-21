
// ---------------------------------------------
// 1. STICKY HEADER
// ----------------------------------------------
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
});


// ---------------------------------------------
// 2. MOBILE NAV TOGGLE
// ---------------------------------------------
// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navEl     = document.getElementById('main-nav');
const mobMenu   = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
    const open = mobMenu.classList.toggle('open');
    navEl.classList.toggle('open', open);
    navToggle.textContent = open ? '✕ Close' : '☰ Menu';
});



// ---------------------------------------------
// 3. CURSOR GLOW
// ---------------------------------------------
const glow = document.getElementById('cursorGlow');

if (glow) {
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    });
}


// ---------------------------------------------
// 4. SCROLL-TO-TOP BUTTON
// ---------------------------------------------
const scrollBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
    // Show the button once the user has scrolled a decent way down
    scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ---------------------------------------------
// 5. SCROLL REVEAL
// ---------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target); // No need to keep watching
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// -------------------------------------------
// 6. TIMELINE REVEAL
// -------------------------------------------
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger: each item waits 120ms longer than the previous
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, i * 120);

            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.timeline-item').forEach(el => timelineObserver.observe(el));


// ------------------------------------------
// 7. ANIMATED COUNTERS
// ------------------------------------------

// Counts from 0 to `target` over 1800ms, then appends `suffix`
function animateCounter(el, target, suffix = '') {
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed  = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic — fast at first, slows near the end
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * target);

        el.textContent = value.toLocaleString() + suffix;

        // Keep running until we've reached 100%
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.target, 10);

            // Work out the right suffix from the nearby label text
            const labelText = el.closest('.stat-item').querySelector('.stat-label').textContent;
            let suffix = '';

            if (labelText.includes('%'))         suffix = '%';
            else if (labelText.includes('Countries'))  suffix = '+';
            else if (labelText.includes('Travellers')) suffix = '+';

            animateCounter(el, target, suffix);
            counterObserver.unobserve(el); // Only animate once
        }
    });
}, { threshold: 0.5 }); // Wait until the stat is 50% visible before counting

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));


// ----------------------------------------
// 8. FAQ ACCORDION
// ----------------------------------------
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close everything that's currently open
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

        // If this item was closed, open it now
        // If it was already open, clicking it just closed it above — done.
        if (!isOpen) {
            item.classList.add('open');
        }
    });
});


// ----------------------------------------
// 10. SMOOTH SCROLL FOR  'A' tags
// -----------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));

        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
 lo