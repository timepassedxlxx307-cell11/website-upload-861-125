(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function includes(value, query) {
    return String(value || '').toLowerCase().indexOf(query) !== -1;
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');

    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        mobile.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      startHero();
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          startHero();
        });
      }
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          startHero();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          startHero();
        });
      });
    }

    var queryInput = document.querySelector('[data-filter-query]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-line')
        ].join(' ').toLowerCase();
        var ok = true;

        if (q && !includes(text, q)) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    if (queryInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && !queryInput.value) {
        queryInput.value = q;
      }
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}());
