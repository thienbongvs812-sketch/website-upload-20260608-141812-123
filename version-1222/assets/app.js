(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    if (!cards.length || (!input && !select)) {
      return;
    }

    if (input && input.hasAttribute('data-query-sync')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        input.value = q;
      }
    }

    function apply() {
      var query = input ? normalize(input.value) : '';
      var selected = select ? normalize(select.value) : '';

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search-text'));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchSelect = !selected || haystack.indexOf(selected) !== -1;

        card.classList.toggle('is-filter-hidden', !(matchQuery && matchSelect));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
