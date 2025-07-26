const paginationElement = document.querySelector('#phantrang');
const contentPhim = document.querySelector('#contentPhim');
const genreDropdown = document.querySelector('#genreDropdown');
const countryDropdown = document.querySelector('#countryDropdown');
const yearDropdown = document.querySelector('#yearDropdown');
const currentCountryNameElement = document.querySelector('#currentCountryName');
const pageTitleElement = document.querySelector('#pageTitle');

// --- API Endpoints ---
const API_BASE = `https://phimapi.com`;
const API_GENRES = `${API_BASE}/the-loai`;
const API_COUNTRIES = `${API_BASE}/quoc-gia`;
const API_MOVIES_BY_COUNTRY = `${API_BASE}/v1/api/quoc-gia/`; // Requires slug and page
const IMAGE_CDN_BASE = `https://phimimg.com`;
const API_MOVIES_BY_YEAR = `${API_BASE}/v1/api/nam/`;

let currentCountrySlug = '';

// --- Utility function to get URL parameters ---
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// --- Function to fetch and render movie data for a specific country ---
function callCountryMoviesAPI(countrySlug, page = 1) {
    if (!countrySlug) {
        console.error("Country slug is missing.");
        contentPhim.innerHTML = `<div class="col-12 text-center text-light">Không tìm thấy quốc gia phim này.</div>`;
        paginationElement.innerHTML = '';
        return;
    }

    fetch(`${API_MOVIES_BY_COUNTRY}${countrySlug}?page=${page}`)
        .then(function(response) {
            if (!response.ok) {
                if (response.status === 404) {
                    return { data: { params: { pagination: { currentPage: 0, totalPages: 0 } }, items: [] } };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function(results) {
            const paginationData = results.data ? results.data.params.pagination : results.pagination;
            const itemsData = results.data ? results.data.items : results.items;
            renderMoviesAndPagination(paginationData, itemsData, 'country', countrySlug);

            if (results.data && results.data.titlePage) {
                currentCountryNameElement.textContent = results.data.titlePage;
            } else {
                currentCountryNameElement.textContent = countrySlug;
            }
        })
        .catch(function(error) {
            console.error("Error fetching country movie data:", error);
            contentPhim.innerHTML = `<div class="col-12 text-center text-light">Không tìm thấy phim nào cho quốc gia này.</div>`;
            paginationElement.innerHTML = '';
        });
}

// --- renderMoviesAndPagination (copy from genre.js, adapt paginationBaseUrl) ---
function renderMoviesAndPagination(pagination, items, filterType, filterValue) {
    let { currentPage, totalPages } = pagination;
    currentPage = currentPage || 1;
    totalPages = totalPages || 1;

    let htmls = '';
    let paginationBaseUrl = '';
    if (filterType === 'country') { // Only for country page
        paginationBaseUrl = `country.html?slug=${encodeURIComponent(filterValue)}`;
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

    let content = '';
    if (items && items.length > 0) {
        items.forEach(function(item) {
            const categories = item.category ? item.category.map(cat => cat.name).join(', ') : 'N/A';
            const countries = item.country ? item.country.map(coun => coun.name).join(', ') : 'N/A';

            let imageUrl = item.poster_url;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = IMAGE_CDN_BASE + '/' + imageUrl.replace(/^\//, '');
            }

            content += `<div onclick="tranfor('${item.slug}')" class="col">
                <div class="card h-100">
                  <img src="${imageUrl}" class="card-img-top img-fit" alt="${item.name}">
                  <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">Thể loại: ${categories}</p>
                    <p class="card-text">Quốc gia: ${countries}</p>
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

// --- Redirect to Movie Detail Page (reused) ---
function tranfor(slug) {
    window.location.href = `contentmain.html?slug=${encodeURIComponent(slug)}`;
}

// --- Populate Dropdowns (reused from main.js) ---
function fetchGenres() {
    fetch(API_GENRES)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(genre => {
                html += `<li><a class="dropdown-item" href="genre.html?slug=${encodeURIComponent(genre.slug)}">${genre.name}</a></li>`;
            });
            genreDropdown.innerHTML = html;
        })
        .catch(error => console.error('Error fetching genres:', error));
}

function fetchCountries() {
    fetch(API_COUNTRIES)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(country => {
                html += `<li><a class="dropdown-item" href="country.html?slug=${encodeURIComponent(country.slug)}">${country.name}</a></li>`;
            });
            countryDropdown.innerHTML = html;
        })
        .catch(error => console.error('Error fetching countries:', error));
}

function populateYears() {
    const currentYearNum = new Date().getFullYear();
    let html = '';
    for (let year = currentYearNum; year >= 1990; year--) {
        html += `<li><a class="dropdown-item" href="year.html?year=${encodeURIComponent(year)}">${year}</a></li>`;
    }
    yearDropdown.innerHTML = html;
}

// --- Initial Calls for country.html ---
document.addEventListener('DOMContentLoaded', () => {
    currentCountrySlug = getUrlParameter('slug');
    const page = getUrlParameter('page') || 1;
    callCountryMoviesAPI(currentCountrySlug, page);

    fetchGenres();
    fetchCountries();
    populateYears();
});
