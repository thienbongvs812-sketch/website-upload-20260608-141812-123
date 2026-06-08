(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
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

        function schedule() {
            if (!slides.length) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                schedule();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                schedule();
            });
        });

        schedule();

        var searchInput = document.querySelector(".movie-search");
        var yearSelect = document.querySelector(".filter-select");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var rankItems = Array.prototype.slice.call(document.querySelectorAll(".rank-item"));
        var quickFilters = Array.prototype.slice.call(document.querySelectorAll(".quick-filter"));
        var quickValue = "";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
        }

        function matchesYear(card, year) {
            return !year || normalize(card.getAttribute("data-year")) === normalize(year);
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : "");
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var text = cardText(card);
                var visible = (!query || text.indexOf(query) !== -1) && matchesYear(card, year) && (!quickValue || text.indexOf(normalize(quickValue)) !== -1);
                card.classList.toggle("is-hidden", !visible);
            });

            rankItems.forEach(function (item) {
                var text = normalize(item.textContent);
                var visible = !query || text.indexOf(query) !== -1;
                item.classList.toggle("is-hidden", !visible);
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }

        quickFilters.forEach(function (button) {
            button.addEventListener("click", function () {
                quickValue = quickValue === button.getAttribute("data-filter") ? "" : button.getAttribute("data-filter");
                quickFilters.forEach(function (item) {
                    item.classList.toggle("is-active", item === button && quickValue);
                });
                applyFilters();
            });
        });
    });
})();
