(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var host = scope.parentElement || document;
      var cards = Array.prototype.slice.call(host.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var activeFilter = "";
      function cardText(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
      }
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = cardText(card);
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
          var matched = matchedQuery && matchedFilter;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-play-overlay]");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var wantsPlay = false;
      if (!video || !stream) {
        return;
      }
      function tryPlay() {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }
      function loadStream() {
        if (video.dataset.ready === "yes") {
          return;
        }
        video.dataset.ready = "yes";
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            if (wantsPlay) {
              tryPlay();
            }
          });
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (wantsPlay) {
              tryPlay();
            }
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function playVideo() {
        wantsPlay = true;
        loadStream();
        if (!window.Hls || !window.Hls.isSupported()) {
          tryPlay();
        }
      }
      player.addEventListener("click", function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === "video") {
          return;
        }
        playVideo();
      });
      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.stopPropagation();
          playVideo();
        });
      }
      Array.prototype.slice.call(document.querySelectorAll("[data-play-target]")).forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          player.scrollIntoView({ behavior: "smooth", block: "center" });
          playVideo();
        });
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
