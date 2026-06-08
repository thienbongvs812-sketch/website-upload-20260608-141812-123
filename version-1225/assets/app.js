(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.nav-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function next() {
      activate((current + 1) % slides.length);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide'));
        if (!Number.isNaN(index)) {
          activate(index);
        }
      });
    });
    timer = window.setInterval(next, 5600);
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', function () {
        window.clearInterval(timer);
      });
      hero.addEventListener('mouseleave', function () {
        timer = window.setInterval(next, 5600);
      });
    }
  }

  function setupFilters() {
    var grid = document.querySelector('.category-movie-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('.filter-search');
    var typeSelect = document.querySelector('.filter-type');
    var yearSelect = document.querySelector('.filter-year');
    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.type,
          card.dataset.year
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || (card.dataset.type || '').indexOf(type) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        card.hidden = !(matchesQuery && matchesType && matchesYear);
      });
    }
    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function cardTemplate(item) {
    var tags = item.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-gradient"></span>',
      '<span class="play-chip">立即观看</span>',
      '</a>',
      '<div class="card-content">',
      '<div class="card-meta">' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</div>',
      '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    if (!results || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;
    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matches = window.SEARCH_INDEX.filter(function (item) {
        if (!normalized) {
          return false;
        }
        return [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 96);
      if (!normalized) {
        results.innerHTML = '<div class="empty-state">请输入关键词搜索片库内容</div>';
        return;
      }
      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">未找到相关影片</div>';
        return;
      }
      results.innerHTML = matches.map(cardTemplate).join('');
    }
    render(initialQuery);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  window.initializePlayer = function (videoId, buttonId, overlayId, posterSrc, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !button || !overlay || !sourceUrl) {
      return;
    }
    var started = false;
    var hls = null;
    function attach() {
      if (started) {
        return;
      }
      started = true;
      video.poster = posterSrc;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }
    function play() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    button.addEventListener('click', play);
    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
