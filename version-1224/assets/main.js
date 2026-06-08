(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        start();
      });
    });

    showSlide(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-keyword]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const type = filterPanel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-no-results]');

    const applyFilter = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.genre || '',
          card.dataset.type || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const yearMatch = !yearValue || card.dataset.year === yearValue;
        const typeMatch = !typeValue || (card.dataset.type || '').indexOf(typeValue) !== -1;
        const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        const shouldShow = yearMatch && typeMatch && keywordMatch;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  const searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.MovieSearchIndex) {
    const input = searchRoot.querySelector('[data-search-input]');
    const category = searchRoot.querySelector('[data-search-category]');
    const year = searchRoot.querySelector('[data-search-year]');
    const results = searchRoot.querySelector('[data-search-results]');
    const empty = searchRoot.querySelector('[data-search-empty]');

    const cardTemplate = function (item) {
      const tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-glow"></span><span class="play-chip">播放</span></a>' +
        '<div class="card-body"><div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.desc) + '</p><div class="tag-row">' + tags + '</div></div></article>';
    };

    const render = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const yearValue = year ? year.value : '';
      const matched = window.MovieSearchIndex.filter(function (item) {
        const text = [item.title, item.desc, item.genre, item.type, item.region, item.tags.join(' ')].join(' ').toLowerCase();
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!categoryValue || item.categorySlug === categoryValue) &&
          (!yearValue || item.year === yearValue);
      }).slice(0, 96);

      if (results) {
        results.innerHTML = matched.map(cardTemplate).join('');
      }
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
    };

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
