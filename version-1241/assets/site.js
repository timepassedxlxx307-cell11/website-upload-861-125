(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var text = panel.querySelector('[data-filter-text]');
      var year = panel.querySelector('[data-filter-year]');
      var genre = panel.querySelector('[data-filter-genre]');
      var reset = panel.querySelector('[data-filter-reset]');
      var container = document.querySelector('[data-card-container]');
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));

      function apply() {
        var q = normalize(text && text.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region')
          ].join(' '));
          var matchesText = !q || haystack.indexOf(q) !== -1;
          var matchesYear = !y || normalize(card.getAttribute('data-year')) === y;
          var matchesGenre = !g || normalize(card.getAttribute('data-genre')).indexOf(g) !== -1;
          card.classList.toggle('is-filter-hidden', !(matchesText && matchesYear && matchesGenre));
        });
      }

      [text, year, genre].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (text) {
            text.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (genre) {
            genre.value = '';
          }
          apply();
        });
      }
    });
  }

  function createResultCard(item) {
    var tags = String(item.tags || '').split(/[,，、/|]+/).filter(Boolean).slice(0, 3);
    var tagHtml = tags.map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHtml(item.url) + '" data-movie-card>' +
      '<span class="poster-frame">' +
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-gradient"></span>' +
      '<span class="poster-play">▶</span>' +
      '<span class="poster-type">' + escapeHtml(item.type) + '</span>' +
      '<span class="poster-year">' + escapeHtml(item.year) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(item.title) + '</strong>' +
      '<span class="movie-line">' + escapeHtml(item.line) + '</span>' +
      '<span class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></span>' +
      '<span class="movie-tags">' + tagHtml + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearch() {
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !form || !input || !window.SITE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(value) {
      var q = normalize(value);
      if (!q) {
        return;
      }
      var output = window.SITE_SEARCH_INDEX.filter(function (item) {
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.line
        ].join(' ')).indexOf(q) !== -1;
      }).slice(0, 120);
      if (!output.length) {
        results.innerHTML = '<div class="search-empty">未找到相关作品，请尝试其他关键词。</div>';
        return;
      }
      results.innerHTML = output.map(createResultCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var nextUrl = q ? './search.html?q=' + encodeURIComponent(q) : './search.html';
      window.history.replaceState(null, '', nextUrl);
      render(q);
    });

    render(query);
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var source = shell.getAttribute('data-hls');
      var started = false;
      var hls = null;

      function start() {
        if (!video || !source) {
          return;
        }
        if (!started) {
          started = true;
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            start();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
