// ============================================
// CONTACT PAGE — contact.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ── MOBILE NAV ────────────────────────────
    const navToggle  = document.getElementById('nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#site-header') && !e.target.closest('.mobile-menu')) {
            mobileMenu.classList.remove('open');
        }
    });

    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });

    // ── SCROLL TO TOP ─────────────────────────
    const scrollBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('show', window.scrollY > 300);
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── AOS INIT ──────────────────────────────
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 80 });
    }

    // ── FORM VALIDATION ───────────────────────
    const form     = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');

    const rules = {
        name:    { required: true,  minLength: 2,   label: 'Full name' },
        email:   { required: true,  email: true,    label: 'Email address' },
        phone:   { required: false, phone: true,    label: 'Phone number' },
        subject: { required: true,  minLength: 3,   label: 'Subject' },
        message: { required: true,  minLength: 10,  label: 'Message' },
    };

    function validate(id) {
        const input   = document.getElementById(id);
        const errEl   = document.getElementById(id + 'Error');
        const rule    = rules[id];
        if (!input || !rule) return true;

        const val = input.value.trim();
        let msg   = '';

        if (rule.required && !val) {
            msg = `${rule.label} is required.`;
        } else if (val && rule.minLength && val.length < rule.minLength) {
            msg = `${rule.label} must be at least ${rule.minLength} characters.`;
        } else if (val && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            msg = 'Please enter a valid email address.';
        } else if (val && rule.phone && !/^[\d\s\-\+\(\)]+$/.test(val)) {
            msg = 'Please enter a valid phone number.';
        }

        if (errEl) errEl.textContent = msg;
        input.classList.toggle('invalid', !!msg);
        return !msg;
    }

    // Live validation: show error on blur, clear as user fixes it
    Object.keys(rules).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('blur',  () => validate(id));
        input.addEventListener('input', () => { if (input.classList.contains('invalid')) validate(id); });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all text fields
        const fieldsOk = Object.keys(rules).map(id => validate(id)).every(Boolean);

        // Validate checkbox separately
        const privacy      = document.getElementById('privacy');
        const privacyError = document.getElementById('privacyError');
        const privacyOk    = privacy.checked;
        privacyError.textContent = privacyOk ? '' : 'You must accept the privacy policy.';

        if (!fieldsOk || !privacyOk) {
            showFeedback('Please fix the errors above and try again.', 'error');
            return;
        }

        // Disable button and show loading state
        const btn      = form.querySelector('.btn-send');
        const btnLabel = btn.querySelector('.btn-text');
        btn.disabled   = true;
        btnLabel.textContent = 'Sending…';

        // Simulate network request — swap with real API call here
        setTimeout(() => {
            showFeedback('✓ Message sent! We\'ll get back to you within 24 hours.', 'success');
            form.reset();
            Object.keys(rules).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('invalid');
            });
            btn.disabled         = false;
            btnLabel.textContent = 'Send Message';

            setTimeout(() => feedback.classList.remove('show'), 6000);
        }, 1200);
    });

    function showFeedback(msg, type) {
        feedback.textContent = msg;
        feedback.className   = `form-feedback show ${type}`;
    }

    // ── FAQ ACCORDION ─────────────────────────
    document.querySelectorAll('.faq-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item   = trigger.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
            });

            // Open clicked one if it was closed
            if (!isOpen) {
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

});