(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-mobile-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    setupHeroCarousel();
    setupLocalFilters();
    setupHeroSearch();
  });

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupHeroSearch() {
    var form = document.querySelector('[data-hero-search-form]');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-target') || 'search.html';
      var separator = target.indexOf('?') === -1 ? '?' : '&';
      window.location.href = target + separator + 'q=' + encodeURIComponent(query);
    });
  }

  function setupLocalFilters() {
    var filter = document.querySelector('[data-local-filter]');
    var grid = document.querySelector('[data-local-grid]');
    var empty = document.querySelector('[data-empty-state]');

    if (!filter || !grid) {
      return;
    }

    var keywordInput = filter.querySelector('[data-filter-keyword]');
    var yearSelect = filter.querySelector('[data-filter-year]');
    var typeSelect = filter.querySelector('[data-filter-type]');
    var regionSelect = filter.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function value(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value(keywordInput);
      var year = value(yearSelect);
      var type = value(typeSelect);
      var region = value(regionSelect);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();

        var matched = true;
        matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
        matched = matched && (!year || String(card.getAttribute('data-year')).toLowerCase() === year);
        matched = matched && (!type || String(card.getAttribute('data-type')).toLowerCase().indexOf(type) !== -1);
        matched = matched && (!region || String(card.getAttribute('data-region')).toLowerCase().indexOf(region) !== -1);

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
