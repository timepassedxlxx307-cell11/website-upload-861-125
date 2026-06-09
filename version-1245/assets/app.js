(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var button = $("[data-nav-toggle]");
        var menu = $("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = $("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = $all("[data-hero-slide]", slider);
        var dots = $all("[data-hero-dot]", slider);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function getFilterMap(scope) {
        var map = {};
        $all("[data-filter-button].is-active", scope).forEach(function (button) {
            var key = button.getAttribute("data-filter-key");
            var value = button.getAttribute("data-filter-value");
            if (key && value && value !== "all") {
                map[key] = normalize(value);
            }
        });
        return map;
    }

    function cardMatches(card, query, filters) {
        var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-channel")
        ].join(" "));
        if (query && haystack.indexOf(query) === -1) {
            return false;
        }
        return Object.keys(filters).every(function (key) {
            var value = normalize(card.getAttribute("data-" + key));
            return value.indexOf(filters[key]) !== -1;
        });
    }

    function applySearch(scope) {
        var input = $("[data-site-search]", scope);
        var cards = $all("[data-search-card]", scope);
        var empty = $("[data-empty-state]", scope);
        var query = normalize(input ? input.value : "");
        var filters = getFilterMap(scope);
        var visible = 0;
        cards.forEach(function (card) {
            var matched = cardMatches(card, query, filters);
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initSearch() {
        $all("[data-search-scope]").forEach(function (scope) {
            var input = $("[data-site-search]", scope);
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            if (input) {
                input.addEventListener("input", function () {
                    applySearch(scope);
                });
            }
            $all("[data-filter-button]", scope).forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-filter-key");
                    $all('[data-filter-button][data-filter-key="' + key + '"]', scope).forEach(function (peer) {
                        peer.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    applySearch(scope);
                });
            });
            var form = $("[data-home-search]", scope);
            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    var field = $("[data-home-query]", form);
                    var value = field ? field.value.trim() : "";
                    window.location.href = value ? "movies.html?q=" + encodeURIComponent(value) : "movies.html";
                });
            }
            applySearch(scope);
        });
    }

    window.initMoviePlayer = function (videoId, overlayId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var button = document.getElementById(buttonId);
        var started = false;
        if (!video || !overlay || !button || !streamUrl) {
            return;
        }
        function startPlayback() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            overlay.classList.add("is-hidden");
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
            video.play().catch(function () {});
        }
        overlay.addEventListener("click", startPlayback);
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            startPlayback();
        });
        video.addEventListener("click", function () {
            if (!started) {
                startPlayback();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearch();
    });
})();
