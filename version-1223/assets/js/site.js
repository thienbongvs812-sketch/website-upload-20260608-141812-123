(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (input && !input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var bgs = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-bg]"),
    );
    var index = 0;
    var timer = null;

    function showHero(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      bgs.forEach(function (bg, i) {
        bg.classList.toggle("is-active", i === index);
      });
    }

    function playHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showHero(i);
        playHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", playHero);
    if (slides.length) {
      showHero(0);
      playHero();
    }
  }

  var scope = document.querySelector("[data-filter-scope]");
  if (scope) {
    var textInput = scope.querySelector("[data-filter-text]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-card]"),
    );
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (textInput && query) {
      textInput.value = query;
    }

    function filterCards() {
      var text = textInput ? textInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      cards.forEach(function (card) {
        var meta = (card.getAttribute("data-meta") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var okText =
          !text || meta.indexOf(text) !== -1 || title.indexOf(text) !== -1;
        var okYear = !year || cardYear === year;
        var okType = !type || cardType === type;
        card.classList.toggle("is-hidden", !(okText && okYear && okType));
      });
    }

    [textInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    filterCards();
  }
})();
