(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector(".movie-search");
        var list = document.querySelector(".searchable-list");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        var empty = document.querySelector(".empty-state");
        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        var currentCategory = "all";

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var categoryMatched = currentCategory === "all" || category === currentCategory;
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                var matched = categoryMatched && keywordMatched;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener("input", apply);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                currentCategory = chip.getAttribute("data-filter") || "all";
                apply();
            });
        });
        apply();
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".video-cover");
            var streamAddress = shell.getAttribute("data-stream");
            var started = false;
            var hlsInstance = null;

            function setAddress() {
                if (!video || !streamAddress || started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamAddress;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamAddress);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = streamAddress;
                video.play().catch(function () {});
            }

            function begin() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                setAddress();
                if (video) {
                    video.play().catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        begin();
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
