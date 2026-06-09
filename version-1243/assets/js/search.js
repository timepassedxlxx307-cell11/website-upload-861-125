(function () {
    var movies = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var regionSelect = document.querySelector('[data-search-region]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var status = document.querySelector('[data-search-status]');
    var results = document.querySelector('[data-search-results]');

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    var unique = function (items) {
        return Array.from(new Set(items.filter(Boolean)));
    };

    var fillSelect = function (select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    fillSelect(regionSelect, unique(movies.map(function (movie) { return movie.region; })).sort());
    fillSelect(typeSelect, unique(movies.map(function (movie) { return movie.type; })).sort());
    fillSelect(yearSelect, unique(movies.map(function (movie) { return String(movie.year); })).sort(function (a, b) { return Number(b) - Number(a); }));

    if (input) {
        input.value = initialQuery;
    }

    var createCard = function (movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<div class="poster-shade"></div>',
            '<div class="poster-year">' + movie.year + '</div>',
            '<div class="poster-play">▶</div>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<div class="card-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    };

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var runSearch = function () {
        if (!results || !status) {
            return;
        }

        var query = normalize(input && input.value);
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';

        if (!query && !region && !type && !year) {
            results.innerHTML = '';
            status.textContent = '输入关键词查找想看的影片';
            return;
        }

        var matched = movies.filter(function (movie) {
            var text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                movie.summary,
                movie.tags.join(' ')
            ].join(' '));

            if (query && text.indexOf(query) === -1) {
                return false;
            }
            if (region && movie.region !== region) {
                return false;
            }
            if (type && movie.type !== type) {
                return false;
            }
            if (year && String(movie.year) !== year) {
                return false;
            }
            return true;
        }).slice(0, 120);

        if (!matched.length) {
            results.innerHTML = '';
            status.textContent = '没有找到匹配影片';
            return;
        }

        status.textContent = '搜索结果';
        results.innerHTML = matched.map(createCard).join('');
    };

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', runSearch);
            control.addEventListener('change', runSearch);
        }
    });

    runSearch();
}());
