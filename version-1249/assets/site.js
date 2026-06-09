(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function scheduleSlider() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      scheduleSlider();
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          scheduleSlider();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          scheduleSlider();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          scheduleSlider();
        });
      });
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (filterInput && cards.length) {
      filterInput.addEventListener('input', function () {
        var keyword = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');
    var searchInput = document.querySelector('[data-search-input]');

    if (searchResults && window.SITE_SEARCH_DATA) {
      var params = new URLSearchParams(window.location.search);
      var keywordValue = params.get('q') || '';
      if (searchInput) {
        searchInput.value = keywordValue;
      }
      renderSearch(keywordValue);
    }

    function renderSearch(keywordValue) {
      var keyword = String(keywordValue || '').trim().toLowerCase();
      var data = window.SITE_SEARCH_DATA || [];
      var results = keyword
        ? data.filter(function (item) {
            return [item.title, item.oneLine, item.genre, item.region, item.type, item.year, item.tags]
              .join(' ')
              .toLowerCase()
              .indexOf(keyword) !== -1;
          }).slice(0, 120)
        : data.slice(0, 60);

      if (searchStatus) {
        searchStatus.textContent = keyword ? '搜索结果：' + keyword : '热门推荐';
      }

      searchResults.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + escapeAttribute(item.url) + '" aria-label="观看' + escapeAttribute(item.title) + '">',
          '    <img src="' + escapeAttribute(item.cover) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy">',
          '    <span class="poster-gradient"></span>',
          '    <span class="poster-play">▶</span>',
          '    <span class="poster-title">' + escapeHtml(item.title) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <a class="movie-title" href="' + escapeAttribute(item.url) + '">' + escapeHtml(item.title) + '</a>',
          '    <p>' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="meta-row">',
          '      <span>' + escapeHtml(item.year) + '</span>',
          '      <span>' + escapeHtml(item.region) + '</span>',
          '      <span>' + escapeHtml(item.type) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replace(/`/g, '&#096;');
    }
  });
})();
