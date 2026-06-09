(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindImages(root) {
    qsa("img", root).forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    qsa(".nav-link").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.indexOf(path) !== -1 || (path.indexOf("movie-") === 0 && href.indexOf("movies.html") !== -1)) {
        link.classList.add("is-active");
      }
    });
  }

  function initHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa("[data-hero-slide]", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
  }

  function initLocalFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var input = qs("[data-list-search]", scope);
      var select = qs("[data-list-filter]", scope);
      var cards = qsa("[data-card]", scope);

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var filter = select ? select.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var matchedText = !text || haystack.indexOf(text) !== -1;
          var matchedFilter = !filter || haystack.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !(matchedText && matchedFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-card>",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-link\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<span class=\"poster\"><img src=\"./" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"poster-year\">" + escapeHtml(movie.year) + "</span></span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-row\"><span class=\"category-pill\">" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var root = qs("[data-search-page]");
    if (!root || typeof searchData === "undefined") {
      return;
    }
    var input = qs("[data-search-input]", root);
    var select = qs("[data-search-category]", root);
    var clear = qs("[data-search-clear]", root);
    var results = qs("[data-search-results]", root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function render() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var category = select ? select.value.trim() : "";
      var matched = searchData.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return (!text || haystack.indexOf(text) !== -1) && (!category || movie.category === category);
      }).slice(0, 96);
      results.innerHTML = matched.map(createSearchCard).join("");
      bindImages(results);
    }

    if (input) {
      input.addEventListener("input", render);
    }
    if (select) {
      select.addEventListener("change", render);
    }
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (select) {
          select.value = "";
        }
        render();
      });
    }
    if (query) {
      render();
    }
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = qs("[data-movie-video]");
    var playButton = qs("[data-play-button]");
    var wrap = qs("[data-player-wrap]");
    var hlsInstance = null;
    var started = false;

    if (!video || !playButton || !streamUrl) {
      return;
    }

    function playVideo() {
      video.play().catch(function () {});
    }

    function start() {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
        video.controls = true;
        if (wrap) {
          wrap.classList.add("is-playing");
        }
      } else {
        playVideo();
      }
    }

    playButton.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindImages(document);
    initMenu();
    initActiveNav();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
