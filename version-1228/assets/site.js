(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      }, { once: true });
    });

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    var params = new URLSearchParams(location.search);
    var query = params.get("q") || "";
    document.querySelectorAll("input[name='q']").forEach(function (input) {
      if (query) {
        input.value = query;
      }
    });

    initHeroSlider();
    renderSearchResults(query);
  });

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      "<a href=\"./" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<div class=\"poster-frame\">",
      "<img src=\"./" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
      "<span class=\"play-mark\">▶</span>",
      "</div>",
      "<div class=\"movie-card-body\">",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p class=\"movie-meta\">" + escapeHtml(movie.type) + " · " + escapeHtml(movie.category) + " · " + escapeHtml(movie.region) + "</p>",
      "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
      "</div>",
      "</a>"
    ].join("");
    return article;
  }

  function renderSearchResults(query) {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.MOVIE_INDEX) {
      return;
    }
    var q = String(query || "").trim().toLowerCase();
    var heading = document.querySelector("[data-search-heading]");
    if (heading) {
      heading.textContent = q ? "搜索结果" : "影片搜索";
    }
    if (!q) {
      container.innerHTML = "<div class=\"empty-state\">输入片名、类型、地区或标签，快速查找想看的影视作品。</div>";
      return;
    }
    var words = q.split(/\s+/).filter(Boolean);
    var results = window.MOVIE_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.category, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });
    if (!results.length) {
      container.innerHTML = "<div class=\"empty-state\">未找到相关影片，请尝试其他关键词。</div>";
      return;
    }
    container.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "movie-grid";
    results.slice(0, 240).forEach(function (movie) {
      grid.appendChild(createCard(movie));
    });
    container.appendChild(grid);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var mask = document.getElementById("player-mask");
  if (!video || !source) {
    return;
  }
  var initialized = false;

  function attach() {
    if (initialized) {
      return;
    }
    initialized = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (mask) {
      mask.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!initialized || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (mask) {
      mask.classList.add("is-hidden");
    }
  });
}
