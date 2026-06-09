(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var forms = document.querySelectorAll('.site-search-form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = 'search.html?q=' + encodeURIComponent(query);
            } else {
                window.location.href = 'search.html';
            }
        });
    });

    var heroCards = Array.prototype.slice.call(document.querySelectorAll('[data-hero-card]'));
    if (heroCards.length > 1) {
        var activeIndex = 0;
        window.setInterval(function () {
            heroCards[activeIndex].classList.remove('active');
            activeIndex = (activeIndex + 1) % heroCards.length;
            heroCards[activeIndex].classList.add('active');
        }, 4200);
    }

    var catalog = document.querySelector('[data-catalog]');
    if (catalog) {
        var grid = catalog.querySelector('[data-catalog-grid]');
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-movie-card]'));
        var search = catalog.querySelector('[data-catalog-search]');
        var region = catalog.querySelector('[data-catalog-region]');
        var type = catalog.querySelector('[data-catalog-type]');
        var year = catalog.querySelector('[data-catalog-year]');
        var sort = catalog.querySelector('[data-catalog-sort]');

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var applyCatalog = function () {
            var query = normalize(search && search.value);
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' '));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    matched = false;
                }

                card.classList.toggle('hidden', !matched);
            });

            if (grid && sort) {
                var sorted = cards.slice().sort(function (a, b) {
                    if (sort.value === 'oldest') {
                        return Number(a.dataset.year) - Number(b.dataset.year);
                    }
                    if (sort.value === 'title') {
                        return a.dataset.title.localeCompare(b.dataset.title, 'zh-CN');
                    }
                    return Number(b.dataset.year) - Number(a.dataset.year);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        };

        [search, region, type, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyCatalog);
                control.addEventListener('change', applyCatalog);
            }
        });
    }
}());
