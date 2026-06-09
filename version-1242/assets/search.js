(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-search-year]');
    var typeSelect = document.querySelector('[data-search-type]');
    var regionSelect = document.querySelector('[data-search-region]');
    var resultGrid = document.querySelector('[data-search-results]');
    var resultNote = document.querySelector('[data-search-note]');
    var empty = document.querySelector('[data-empty-state]');
    var movies = window.MOVIE_SEARCH_INDEX || [];

    if (!form || !input || !resultGrid) {
      return;
    }

    populateSelect(yearSelect, unique(movies.map(function (movie) { return movie.year; })).sort().reverse());
    populateSelect(typeSelect, unique(movies.map(function (movie) { return movie.type; })).sort());
    populateSelect(regionSelect, unique(movies.map(function (movie) { return movie.region; })).sort());

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function unique(values) {
      var seen = {};
      return values.filter(function (value) {
        if (!value || seen[value]) {
          return false;
        }
        seen[value] = true;
        return true;
      });
    }

    function populateSelect(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function text(movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(' ').toLowerCase();
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      var results = movies.filter(function (movie) {
        var matched = true;
        matched = matched && (!query || text(movie).indexOf(query) !== -1);
        matched = matched && (!year || movie.year === year);
        matched = matched && (!type || movie.type === type);
        matched = matched && (!region || movie.region === region);
        return matched;
      }).slice(0, 160);

      resultGrid.innerHTML = results.map(renderCard).join('');

      if (resultNote) {
        resultNote.textContent = '当前显示 ' + results.length + ' 条结果。';
      }

      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="movie-card__play">播放</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-card__meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
        '    <p class="movie-card__desc">' + escapeHtml(movie.oneLine).slice(0, 96) + '</p>',
        '    <div class="movie-card__tags"><span>' + escapeHtml(movie.category) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    [input, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    render();
  });
})();
