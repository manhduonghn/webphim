const paginationElement = document.querySelector('#phantrang');
const contentPhim = document.querySelector('#contentPhim');
const searchElement = document.querySelector('input[type="text"]');
const searchbutton = document.querySelector('#btnsearch');
const genreDropdown = document.querySelector('#genreDropdown');
const countryDropdown = document.querySelector('#countryDropdown');
const yearDropdown = document.querySelector('#yearDropdown');

// --- API Endpoints ---
const API_BASE = `https://phimapi.com`;
const API_LATEST = `${API_BASE}/danh-sach/phim-moi-cap-nhat?`;
const API_GENRES = `${API_BASE}/the-loai`;
const API_COUNTRIES = `${API_BASE}/quoc-gia`;
const API_MOVIES_BY_GENRE = `${API_BASE}/v1/api/the-loai/`; // Requires slug and page
const API_MOVIES_BY_COUNTRY = `${API_BASE}/v1/api/quoc-gia/`; // Requires slug and page
const API_MOVIES_BY_YEAR = `${API_BASE}/v1/api/nam/`; // Corrected: Uses 'nam'
const IMAGE_CDN_BASE = `https://phimimg.com`; // Base URL for images

// --- Function to fetch and render movie data (for latest movies on index.html) ---
function callLatestMoviesAPI(page = 1) {
    fetch(`${API_LATEST}page=${page}`)
        .then(function(response) {
            if (!response.ok) {
                if (response.status === 404) {
                    return { pagination: { currentPage: 0, totalPages: 0 }, items: [] };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function(results) {
            // Note: The /danh-sach/phim-moi-cap-nhat API directly returns 'items' and 'pagination'
            // without a 'data' wrapper, unlike the /v1/api/... APIs.
            // So we directly pass results.pagination and results.items.
            renderMoviesAndPagination(results.pagination, results.items, 'latest');
        })
        .catch(function(error) {
            console.error("Error fetching latest movie data:", error);
            contentPhim.innerHTML = `<div class="col-12 text-center text-light">Không tìm thấy phim mới nào.</div>`;
            paginationElement.innerHTML = '';
        });
}

// --- Function to render movies and pagination (shared logic) ---
// This function is now more robust to handle missing category/country data.
function renderMoviesAndPagination(pagination, items, filterType, filterValue) {
    let { currentPage, totalPages } = pagination;
    currentPage = currentPage || 1;
    totalPages = totalPages || 1;

    // Render pagination
    let htmls = '';
    // Determine the base URL for pagination links
    let paginationBaseUrl = '';
    if (filterType === 'latest') {
        paginationBaseUrl = 'index.html';
    } else if (filterType === 'genre') {
        paginationBaseUrl = `genre.html?slug=${encodeURIComponent(filterValue)}`;
    } else if (filterType === 'country') {
        paginationBaseUrl = `country.html?slug=${encodeURIComponent(filterValue)}`;
    } else if (filterType === 'year') {
        paginationBaseUrl = `year.html?year=${encodeURIComponent(filterValue)}`;
    }

    if (currentPage > 1) {
        htmls += `<li class="page-item">
        <a class="page-link" href="${paginationBaseUrl}&page=${currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
    }

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        htmls += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="${paginationBaseUrl}&page=${i}">${i}</a>
                  </li>`;
    }

    if (currentPage < totalPages) {
        htmls += `<li class="page-item">
        <a class="page-link" href="${paginationBaseUrl}&page=${currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>`;
    }
    paginationElement.innerHTML = htmls;

    // Render movie content
    let content = '';
    if (items && items.length > 0) {
        items.forEach(function(item) {
            // Check if category and country exist before trying to map them
            const categories = item.category && item.category.length > 0 ? item.category.map(cat => cat.name).join(', ') : '';
            const countries = item.country && item.country.length > 0 ? item.country.map(coun => coun.name).join(', ') : '';

            let imageUrl = item.poster_url;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = IMAGE_CDN_BASE + '/' + imageUrl.replace(/^\//, '');
            }

            // Conditionally add category and country lines
            const categoryHtml = categories ? `<p class="card-text">Thể loại: ${categories}</p>` : '';
            const countryHtml = countries ? `<p class="card-text">Quốc gia: ${countries}</p>` : '';

            content += `<div onclick="tranfor('${item.slug}')" class="col">
                <div class="card h-100">
                  <img src="${imageUrl}" class="card-img-top img-fit" alt="${item.name}">
                  <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    ${categoryHtml}
                    ${countryHtml}
                    <p class="card-text">Năm: ${item.year}</p>
                  </div>
                </div>
              </div>`;
        });
    } else {
        content = `<div class="col-12 text-center text-light">Không tìm thấy phim nào.</div>`;
    }
    contentPhim.innerHTML = content;
}

// --- Redirect to Movie Detail Page ---
function tranfor(slug) {
    window.location.href = `contentmain.html?slug=${encodeURIComponent(slug)}`;
}

// --- Search Functionality ---
function search() {
    searchbutton.onclick = function(e) {
        const content = searchElement.value.trim();
        if (content === '') {
            e.preventDefault();
        } else {
            window.location.href = `search.html?keyword=${encodeURIComponent(content)}`;
        }
    };
    searchElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchbutton.click();
        }
    });
}

// --- Populate Dropdowns with links to new pages ---

// Fetch Genres
function fetchGenres() {
    fetch(API_GENRES)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(genre => {
                // Link to genre.html with slug parameter
                html += `<li><a class="dropdown-item" href="genre.html?slug=${encodeURIComponent(genre.slug)}">${genre.name}</a></li>`;
            });
            genreDropdown.innerHTML = html;
        })
        .catch(error => console.error('Error fetching genres:', error));
}

// Fetch Countries
function fetchCountries() {
    fetch(API_COUNTRIES)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(country => {
                // Link to country.html with slug parameter
                html += `<li><a class="dropdown-item" href="country.html?slug=${encodeURIComponent(country.slug)}">${country.name}</a></li>`;
            });
            countryDropdown.innerHTML = html;
        })
        .catch(error => console.error('Error fetching countries:', error));
}

// Populate Years
function populateYears() {
    const currentYearNum = new Date().getFullYear();
    let html = '';
    for (let year = currentYearNum; year >= 1990; year--) {
        // Link to year.html with year parameter
        html += `<li><a class="dropdown-item" href="year.html?year=${encodeURIComponent(year)}">${year}</a></li>`;
    }
    yearDropdown.innerHTML = html;
}

// --- Initial Calls for index.html ---
document.addEventListener('DOMContentLoaded', () => {
    callLatestMoviesAPI(); // Load latest movies on index page
    search(); // Initialize search
    fetchGenres(); // Populate genres dropdown
    fetchCountries(); // Populate countries dropdown
    populateYears(); // Populate years dropdown
});
