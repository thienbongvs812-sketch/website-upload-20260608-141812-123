(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.getElementById("mobileToggle");
        var mobileNav = document.getElementById("mobileNav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var active = 0;
            var show = function (index) {
                active = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === active);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            window.setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }

        var grid = document.querySelector("[data-filter-grid]");
        if (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var input = document.getElementById("filterKeyword");
            var category = document.getElementById("filterCategory");
            var type = document.getElementById("filterType");
            var year = document.getElementById("filterYear");
            var empty = document.getElementById("emptyState");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) {
                input.value = initial;
            }
            var filter = function () {
                var q = input ? input.value.trim().toLowerCase() : "";
                var c = category ? category.value : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.category,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (c && card.dataset.category !== c) {
                        ok = false;
                    }
                    if (t && card.dataset.type !== t) {
                        ok = false;
                    }
                    if (y && card.dataset.year !== y) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            };
            [input, category, type, year].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", filter);
                    node.addEventListener("change", filter);
                }
            });
            filter();
        }
    });
}());
