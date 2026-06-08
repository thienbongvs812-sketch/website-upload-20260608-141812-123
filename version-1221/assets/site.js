(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            toggle.classList.toggle("is-open");
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var next = carousel.querySelector("[data-hero-next]");
            var prev = carousel.querySelector("[data-hero-prev]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var queryInput = scope.querySelector(".filter-input");
            var selects = Array.prototype.slice.call(scope.querySelectorAll(".filter-select"));
            var container = scope.nextElementSibling;
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
            var empty = container.parentElement.querySelector(".empty-state");

            function currentValue(name) {
                var select = scope.querySelector('[data-filter="' + name + '"]');
                return select ? select.value : "";
            }

            function apply() {
                var words = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var year = currentValue("year");
                var region = currentValue("region");
                var type = currentValue("type");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.textContent
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (words && text.indexOf(words) === -1) {
                        ok = false;
                    }
                    if (year && card.dataset.year !== year) {
                        ok = false;
                    }
                    if (region && card.dataset.region !== region) {
                        ok = false;
                    }
                    if (type && card.dataset.type !== type) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (queryInput) {
                queryInput.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function attachStream(root, source) {
        var video = root.querySelector("video");
        if (!video || !source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            root._hls = hls;
            return;
        }
        video.src = source;
    }

    function bindMoviePlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var source = root.getAttribute("data-stream");
        var attached = false;

        function begin() {
            if (!video) {
                return;
            }
            if (!attached) {
                attachStream(root, source);
                attached = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }
        root.querySelectorAll("[data-play]").forEach(function (button) {
            button.addEventListener("click", begin);
        });
        if (root.id) {
            document.querySelectorAll('[data-play-for="' + root.id + '"]').forEach(function (button) {
                button.addEventListener("click", begin);
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
        }
    }

    function createPlayer(id, source) {
        var root = document.getElementById(id);
        if (!root) {
            return;
        }
        root.setAttribute("data-stream", source);
        bindMoviePlayer(root);
    }

    window.createPlayer = createPlayer;

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
