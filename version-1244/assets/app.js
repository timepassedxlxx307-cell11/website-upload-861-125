(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var cards = all('[data-movie-card]');
    var buttons = all('[data-filter-value]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
    }
    var year = 'all';
    function apply() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchYear = year === 'all' || cardYear === year;
        card.style.display = matchText && matchYear ? '' : 'none';
      });
    }
    input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        year = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();

function initializePlayer(streamUrl) {
  document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('player-layer');
    if (!video || !streamUrl) {
      return;
    }
    var ready = false;
    var hls = null;
    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      ready = true;
    }
    function play() {
      attach();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    if (layer) {
      layer.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
