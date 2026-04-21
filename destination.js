document.addEventListener('DOMContentLoaded', function() {


    // =============================================
    // 1. SCROLL EFFECT ON HEADER
    // =============================================

    var header = document.querySelector('header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // =============================================
    // 2. MOBILE HAMBURGER MENU
    // =============================================

    var navToggle = document.getElementById('nav-toggle');
    var mainNav = document.getElementById('main-nav');

    navToggle.addEventListener('click', function() {
        mainNav.classList.toggle('open');
    });

    // on mobile, dropdown items open/close like an accordion
    var hasDropdowns = document.querySelectorAll('.has-dropdown > a');

    hasDropdowns.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // only do this on mobile-sized screens
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });


    // =============================================
    // 3. FILTER BUTTONS + SEARCH
    // =============================================

    var filterBtns = document.querySelectorAll('.filter-btn');
    var allCards = document.querySelectorAll('.dest-card');
    var noResultsDiv = document.getElementById('noResults');
    var resultsCount = document.getElementById('resultsCount');
    var searchInput = document.getElementById('destSearch');
    var searchClear = document.getElementById('searchClear');

    // track what is currently selected
    var activeFilter = 'all';
    var activeSearch = '';

    // clicking a filter button
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // remove active class from all buttons
            filterBtns.forEach(function(b) {
                b.classList.remove('active');
            });

            // set this one as active
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;

            runFilters();
        });
    });

    // typing in the search box
    searchInput.addEventListener('input', function() {
        activeSearch = searchInput.value.trim().toLowerCase();

        // show X button only when something is typed
        if (activeSearch.length > 0) {
            searchClear.style.display = 'block';
        } else {
            searchClear.style.display = 'none';
        }

        runFilters();
    });

    // clicking the clear X button
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        activeSearch = '';
        searchClear.style.display = 'none';
        runFilters();
        searchInput.focus();
    });


    // =============================================
    // 4. runFilters() - main filtering function
    // =============================================

    function runFilters() {
        var count = 0; // count visible cards

        allCards.forEach(function(card) {
            // pull all the data attributes off the card
            var name      = card.dataset.name.toLowerCase();
            var type      = card.dataset.type.toLowerCase();
            var continent = card.dataset.continent.toLowerCase();
            var country   = card.dataset.country.toLowerCase();
            var region    = card.dataset.region ? card.dataset.region.toLowerCase() : '';
            var desc      = card.querySelector('.dest-desc').textContent.toLowerCase();

            // --- check the filter button ---
            var filterMatch = false;

            if (activeFilter === 'all') {
                // all button shows everything
                filterMatch = true;
            } else if (activeFilter === 'London') {
                // london filter only shows cards with region="London"
                filterMatch = (region === 'london');
            } else if (activeFilter === 'UK') {
                // UK filter shows both London AND other UK destinations
                filterMatch = (region === 'london' || region === 'uk');
            } else {
                // for Nature/Landmark/Mountain etc - check the type
                filterMatch = (type === activeFilter.toLowerCase());
            }

            // --- check the search text ---
            var searchMatch = true; // defaults to true (show everything if no search)

            if (activeSearch !== '') {
                searchMatch =
                    name.includes(activeSearch) ||
                    type.includes(activeSearch) ||
                    continent.includes(activeSearch) ||
                    country.includes(activeSearch) ||
                    desc.includes(activeSearch);
            }

            // show card only if it passes both checks
            if (filterMatch && searchMatch) {
                card.style.display = '';
                count++;
            } else {
                card.style.display = 'none';
            }
        });

        // update the results count text
        var total = allCards.length;
        if (count === total) {
            resultsCount.textContent = 'Showing all ' + total + ' destinations';
        } else {
            resultsCount.textContent = 'Showing ' + count + ' of ' + total + ' destinations';
        }

        // show the no results message if count is 0
        if (count === 0) {
            noResultsDiv.style.display = 'block';
        } else {
            noResultsDiv.style.display = 'none';
        }
    }


    // =============================================
    // =============================================

    var navFilterLinks = document.querySelectorAll('.dropdown a[data-filter]');

    navFilterLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var val = link.dataset.filter;

            // try to find a matching filter button and click it
            var found = false;
            filterBtns.forEach(function(btn) {
                if (btn.dataset.filter === val) {
                    btn.click();
                    found = true;
                }
            });

            // if no button matched, fall back to searching for the value
            if (!found) {
                activeFilter = 'all';
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

                searchInput.value = val;
                activeSearch = val.toLowerCase();
                searchClear.style.display = 'block';
                runFilters();
            }

            // smooth scroll down to the cards
            document.getElementById('destinations-grid').scrollIntoView({ behavior: 'smooth' });
        });
    });


    // =============================================
    // 6. FAVOURITES
    // =============================================

    // get favourites from storage (or empty array if nothing saved)
    function getFavs() {
        var stored = localStorage.getItem('geoquest_dest_favs');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    // save favourites back to storage
    function saveFavs(favArray) {
        localStorage.setItem('geoquest_dest_favs', JSON.stringify(favArray));
    }

    // update all the star buttons based on current favourites
    function updateStars() {
        var favs = getFavs();

        document.querySelectorAll('.fav-btn').forEach(function(btn) {
            var destName = btn.closest('.dest-card').dataset.name;

            if (favs.includes(destName)) {
                btn.textContent = '★'; // filled star
                btn.classList.add('active');
            } else {
                btn.textContent = '☆'; // empty star
                btn.classList.remove('active');
            }
        });
    }

    // add click listener to every star button
    document.querySelectorAll('.fav-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // dont let click bubble up to the card

            var name = btn.closest('.dest-card').dataset.name;
            var favs = getFavs();

            if (favs.includes(name)) {
                // already in favs - remove it
                favs = favs.filter(function(item) {
                    return item !== name;
                });
                showToast('Removed "' + name + '" from favourites');
            } else {
                // not in favs yet - add it
                favs.push(name);
                showToast('Added "' + name + '" to favourites ★');
            }

            saveFavs(favs);
            updateStars();
        });
    });

    // run once on load to restore saved favourites
    updateStars();


    // =============================================
    // 7. BOOKING MODAL
    // =============================================

    var bookingModal = document.getElementById('bookingModal');
    var bookingForm = document.getElementById('bookingForm');
    var bookingTitle = document.getElementById('bookingDestTitle');
    var closeBtn = document.querySelector('.close');

    // open the modal when Book Now is clicked
    document.querySelectorAll('.btn-book').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var dest = btn.dataset.dest;

            // update the heading in the modal with destination name
            bookingTitle.textContent = '📍 ' + dest;
            bookingModal.style.display = 'block';

            // prevent user picking a date in the past
            var todayStr = new Date().toISOString().split('T')[0];
            document.getElementById('bookDate').min = todayStr;

            // store the destination name on the form so we can use it on submit
            bookingForm.dataset.dest = dest;
        });
    });

    // close modal when X button is clicked
    closeBtn.addEventListener('click', function() {
        bookingModal.style.display = 'none';
        bookingForm.reset();
    });

    // close modal when clicking the dark overlay background
    window.addEventListener('click', function(e) {
        if (e.target === bookingModal) {
            bookingModal.style.display = 'none';
            bookingForm.reset();
        }
    });

    // handle form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault(); // dont actually submit - handle it ourselves

        var name = document.getElementById('bookName').value;
        var email = document.getElementById('bookEmail').value;
        var dest = bookingForm.dataset.dest;

        // replace the form with a success message
        var successMsg = document.createElement('div');
        successMsg.style.cssText = 'text-align: center; padding: 1.5rem 0;';
        successMsg.innerHTML =
            '<div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>' +
            '<h3 style="color: var(--teal-light); margin: 0 0 0.5rem;">Booking Confirmed!</h3>' +
            '<p style="color: var(--text-secondary);">' +
            'Thanks <strong style="color:var(--text-primary);">' + name + '</strong>!<br>' +
            'Your trip to <strong style="color:var(--gold-light);">' + dest + '</strong> is booked.<br>' +
            'Confirmation sent to <strong style="color:var(--text-primary);">' + email + '</strong>' +
            '</p>';

        var parent = bookingForm.parentElement;
        parent.replaceChild(successMsg, bookingForm);

        // close the modal after 3 seconds and reset everything
        setTimeout(function() {
            bookingModal.style.display = 'none';
            bookingForm.reset();
            parent.replaceChild(bookingForm, successMsg);
        }, 3000);
    });


    // =============================================
    // 8. TOAST NOTIFICATION
    // =============================================

    function showToast(msg) {
        // remove existing toast if there is one already showing
        var old = document.querySelector('.gq-toast');
        if (old) { old.remove(); }

        var toast = document.createElement('div');
        toast.className = 'gq-toast';
        toast.textContent = msg;

        toast.style.cssText =
            'position:fixed;' +
            'bottom:2rem;' +
            'left:50%;' +
            'transform:translateX(-50%) translateY(20px);' +
            'background:var(--bg-elevated);' +
            'border:1px solid var(--border-bright);' +
            'color:var(--text-primary);' +
            'padding:0.7rem 1.5rem;' +
            'border-radius:50px;' +
            'font-size:0.88rem;' +
            'font-weight:500;' +
            'z-index:9999;' +
            'box-shadow:0 8px 24px rgba(0,0,0,0.5);' +
            'transition:transform 0.3s ease, opacity 0.3s ease;' +
            'opacity:0;';

        document.body.appendChild(toast);

        // wait a tiny bit then animate in
        setTimeout(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // after 2.5 seconds fade it out and remove it
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2500);
    }


    // =============================================
    // 9. CURSOR GLOW 
    // =============================================

    var glow = document.getElementById('cursorGlow');

    if (glow) {
        document.addEventListener('mousemove', function(e) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }


    // =============================================
    // 10. SCROLL TO TOP BUTTON
    // =============================================

    var scrollTopBtn = document.createElement('div');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.title = 'Back to top';

    scrollTopBtn.style.cssText =
        'display:none;' +
        'position:fixed;' +
        'bottom:30px;' +
        'right:30px;' +
        'width:50px;' +
        'height:50px;' +
        'background:linear-gradient(135deg,#0EA5C2,#0A8FAA);' +
        'color:white;' +
        'border-radius:50%;' +
        'font-size:1.5rem;' +
        'cursor:pointer;' +
        'z-index:99;' +
        'box-shadow:0 4px 15px rgba(14,165,194,0.4);' +
        'text-align:center;' +
        'line-height:50px;' +
        'transition:all 0.3s ease;';

    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


}); 
