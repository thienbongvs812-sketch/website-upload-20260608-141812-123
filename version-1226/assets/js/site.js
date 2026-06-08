(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    function yearMatches(itemYear, selectedYear) {
        if (!selectedYear) {
            return true;
        }

        var year = Number(itemYear || 0);
        var selected = Number(selectedYear);

        if (selectedYear.length === 4 && selected >= 1990 && selected <= 2009) {
            return year >= selected && year < selected + 10;
        }

        if (selectedYear === '2010') {
            return year >= 2010 && year <= 2019;
        }

        if (selectedYear === '2000') {
            return year >= 2000 && year <= 2009;
        }

        if (selectedYear === '1990') {
            return year >= 1990 && year <= 1999;
        }

        return String(itemYear) === selectedYear;
    }

    function setupFilters() {
        var filterInput = document.querySelector('.js-filter-input');
        var yearFilter = document.querySelector('.js-year-filter');
        var categoryFilter = document.querySelector('.js-category-filter');
        var resultCount = document.querySelector('[data-result-count]');
        var items = Array.prototype.slice.call(document.querySelectorAll('.js-filter-item'));

        if (!items.length) {
            return;
        }

        var inputFromUrl = document.querySelector('.js-query-from-url');
        if (inputFromUrl) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                inputFromUrl.value = query;
            }
        }

        function applyFilter() {
            var keyword = (filterInput && filterInput.value ? filterInput.value : '').trim().toLowerCase();
            var selectedYear = yearFilter ? yearFilter.value : '';
            var selectedCategory = categoryFilter ? categoryFilter.value : '';
            var visibleCount = 0;

            items.forEach(function (item) {
                var searchText = (item.getAttribute('data-search') || '').toLowerCase();
                var itemYear = item.getAttribute('data-year') || '';
                var itemCategory = item.getAttribute('data-category') || '';
                var isVisible = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    isVisible = false;
                }

                if (selectedYear && !yearMatches(itemYear, selectedYear)) {
                    isVisible = false;
                }

                if (selectedCategory && itemCategory !== selectedCategory) {
                    isVisible = false;
                }

                item.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = String(visibleCount);
            }
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilter);
        }

        applyFilter();
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();
