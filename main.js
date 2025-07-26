var currentApi = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?`;
const paginationElement = document.querySelector('#phantrang');
const contentPhim = document.querySelector('#contentPhim');
const searchElement = document.querySelector('input[type="text"]');
const searchbutton = document.querySelector('#btnsearch');
const genreDropdown = document.querySelector('#genreDropdown');
const countryDropdown = document.querySelector('#countryDropdown');
const yearDropdown = document.querySelector('#yearDropdown'); // New: for years

let currentFilterType = 'latest'; // 'latest', 'genre', 'country', 'year'
let currentFilterSlug = ''; // Stores the slug for genre/country
let currentYear = ''; // Stores the selected year

// --- API Endpoints ---
const API_BASE = `https://phimapi.com`;
const API_LATEST = `${API_BASE}/danh-sach/phim-moi-cap-nhat?`;
const API_GENRES = `${API_BASE}/the-loai`;
const API_COUNTRIES = `${API_BASE}/quoc-gia`; // Assuming this endpoint exists based on the pattern
const API_MOVIES_BY_GENRE = `${API_BASE}/v1/api/the-loai/`; // Requires slug and page
const API_MOVIES_BY_COUNTRY = `${API_BASE}/v1/api/quoc-gia/`; // Requires slug and page
const API_MOVIES_BY_YEAR = `${API_BASE}/v1/api/nam/`; // Requires year and page

// --- Function to fetch and render movie data ---
function callMovieAPI(apiURL) {
    fetch(apiURL)
        .then(function(response) {
            if (!response.ok) {
                // Handle cases where response might not be OK (e.g., 404 for no movies)
                if (response.status === 404) {
                    return { pagination: { currentPage: 0, totalPages: 0 }, items: [] };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function(results) {
            // Adjust to handle data structure from genre/country/year APIs
            const paginationData = results.data ? results.data.params.pagination : results.pagination;
            const itemsData = results.data ? results.data.items : results.items;
            render(paginationData, itemsData);
        })
        .catch(function(error) {
            console.error("Error fetching movie data:", error);
            contentPhim.innerHTML = `<div class="col-12 text-center text-light">Không tìm thấy phim nào.</div>`;
            paginationElement.innerHTML = ''; // Clear pagination
        });
}

// --- Function to render movies and pagination ---
function render(pagination, items) {
    // Render pagination
    let { currentPage, totalPages } = pagination;
    currentPage = currentPage || 1; // Default to 1 if not provided (e.g., when no results)
    totalPages = totalPages || 1; // Default to 1 if not provided

    let htmls = '';
    if (currentPage > 1) {
        htmls += `<li onclick="changePage(${currentPage - 1})" class="page-item">
        <a class="page-link" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
    }

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage pushes it too far back
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        htmls += `<li onclick="changePage(${i})" class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link">${i}</a></li>`;
    }

    if (currentPage < totalPages) {
        htmls += `<li onclick="changePage(${currentPage + 1})" class="page-item">
        <a class="page-link" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>`;
    }
    paginationElement.innerHTML = htmls;

    // Render movie content
    let content = '';
    if (items && items.length > 0) {
        items.forEach(function(item) {
            const categories = item.category ? item.category.map(cat => cat.name).join(', ') : 'N/A';
            const countries = item.country ? item.country.map(coun => coun.name).join(', ') : 'N/A';

            content += `<div onclick="tranfor('${item.slug}')" class="col">
                <div class="card h-100">
                  <img src="${item.poster_url}" class="card-img-top img-fit" alt="${item.name}">
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

// --- Handle Page Changes ---
function changePage(newPage) {
    let apiToCall = '';
    if (currentFilterType === 'latest') {
        apiToCall = `${API_LATEST}page=${newPage}`;
    } else if (currentFilterType === 'genre') {
        apiToCall = `${API_MOVIES_BY_GENRE}${currentFilterSlug}?page=${newPage}`;
    } else if (currentFilterType === 'country') {
        apiToCall = `${API_MOVIES_BY_COUNTRY}${currentFilterSlug}?page=${newPage}`;
    } else if (currentFilterType === 'year') {
        apiToCall = `${API_MOVIES_BY_YEAR}${currentYear}?page=${newPage}`;
    }
    callMovieAPI(apiToCall);
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
    // Also allow searching by pressing Enter in the input field
    searchElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchbutton.click();
        }
    });
}

// --- Fetch and Populate Dropdowns ---

// Fetch Genres
function fetchGenres() {
    fetch(API_GENRES)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(genre => {
                html += `<li><a class="dropdown-item" href="#" data-slug="${genre.slug}">${genre.name}</a></li>`;
            });
            genreDropdown.innerHTML = html;
            // Add event listeners to genre items
            genreDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentFilterType = 'genre';
                    currentFilterSlug = this.dataset.slug;
                    callMovieAPI(`${API_MOVIES_BY_GENRE}${currentFilterSlug}?page=1`);
                });
            });
        })
        .catch(error => console.error('Error fetching genres:', error));
}

// Fetch Countries (Assuming a similar API structure to genres)
function fetchCountries() {
    // You'll need to confirm the exact API endpoint for countries.
    // For now, I'll use a placeholder URL and structure.
    // If your API doesn't have a direct endpoint for all countries,
    // you might need to collect them from movie data or manually define them.
    fetch(API_COUNTRIES) // This URL needs to be verified
        .then(response => response.json())
        .then(data => {
            let html = '';
            // Assuming data is an array of country objects like genres
            data.forEach(country => {
                html += `<li><a class="dropdown-item" href="#" data-slug="${country.slug}">${country.name}</a></li>`;
            });
            countryDropdown.innerHTML = html;
            // Add event listeners to country items
            countryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentFilterType = 'country';
                    currentFilterSlug = this.dataset.slug;
                    callMovieAPI(`${API_MOVIES_BY_COUNTRY}${currentFilterSlug}?page=1`);
                });
            });
        })
        .catch(error => console.error('Error fetching countries:', error));
}

// Populate Years (Generate years dynamically, as there's no specific API for years)
function populateYears() {
    const currentYear = new Date().getFullYear();
    let html = '';
    for (let year = currentYear; year >= 1990; year--) { // Go back to 1990, adjust as needed
        html += `<li><a class="dropdown-item" href="#" data-year="${year}">${year}</a></li>`;
    }
    yearDropdown.innerHTML = html;
    // Add event listeners to year items
    yearDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            currentFilterType = 'year';
            currentYear = this.dataset.year;
            callMovieAPI(`${API_MOVIES_BY_YEAR}${currentYear}?page=1`);
        });
    });
}

// --- Initial Calls ---
document.addEventListener('DOMContentLoaded', () => {
    callMovieAPI(API_LATEST); // Load latest movies on page load
    search(); // Initialize search
    fetchGenres(); // Populate genres
    fetchCountries(); // Populate countries
    populateYears(); // Populate years
});
