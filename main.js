    // -- 1. CURSOR GLOW --
    const glow = document.getElementById('cursorGlow');
    if (glow && window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX + 'px';
            glow.style.top  = e.clientY + 'px';
        }, { passive: true });
    }

 // -- 2. MODAL SYSTEM --
    const nearestModal = document.getElementById('nearestModal');
    const signUpModal  = document.getElementById('signUpModal');

    /**
     * Open a modal and trap focus inside it.
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

    // -- 3. SIGN-UP MODAL --
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

    // -- 4. HERO BUTTONS --
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

    // -- 5. GEOLOCATION & NEAREST ATTRACTION --
    /**
     * Haversine formula – returns distance in kilometres.
     */
    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) *
                  Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function findNearestDestination(userLat, userLng) {
        const cards = $$('.destination');
        let nearest = null, minDist = Infinity;
        cards.forEach(card => {
            const dist = getDistance(
                userLat, userLng,
                parseFloat(card.dataset.lat),
                parseFloat(card.dataset.lng)
            );
            if (dist < minDist) { minDist = dist; nearest = card; }
        });
        return { card: nearest, distance: Math.round(minDist) };
    }

    function showNearestModal(card, distanceKm) {
        const title = card.querySelector('h3').textContent;
        const img   = card.querySelector('img').src;
        const alt   = card.querySelector('img').alt;
        const desc  = card.querySelector('p').textContent;

        document.getElementById('modalDestination').innerHTML = `
            <div style="text-align:center;">
                <h3 style="margin-bottom:0.75rem;">${escapeHTML(title)}</h3>
                <img src="${img}" alt="${escapeHTML(alt)}"
                     style="width:100%;max-width:400px;border-radius:8px;margin:10px 0;">
                <p>${escapeHTML(desc)}</p>
                <p style="font-size:0.85rem; color:var(--text-dim); margin-top:0.5rem;">
                    📏 Approximately <strong>${distanceKm.toLocaleString()} km</strong> from your location
                </p>
            </div>`;
        openModal(nearestModal);
    }

    function handleGeolocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => {
                const { latitude, longitude } = pos.coords;
                const { card, distance } = findNearestDestination(latitude, longitude);
                if (card) showNearestModal(card, distance);
            },
            () => alert('Location access was denied. Please allow location permissions and try again.')
        );
    }
