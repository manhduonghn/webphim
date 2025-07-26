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
const API_SEARCH = `${API_BASE}/v1/api/tim-kiem?keyword=`; // For search
const IMAGE_CDN_BASE = `https://phimimg.com`; // Base URL for images

// --- Helper function to get URL parameters ---
// Dùng để lấy số trang hiện tại từ URL khi tải trang
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// --- Function to fetch and render movie data ---
// Đây là hàm chính để tải phim.
// Nó sẽ nhận tham số `page` để tải đúng trang.
function callMoviesAPI(page = 1) {
    fetch(`${API_LATEST}page=${page}`) // Luôn tải phim mới cập nhật với trang được chỉ định
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
            // Đảm bảo lấy đúng dữ liệu và thông tin phân trang
            const movies = results.data ? results.data.items : results.items;
            const pagination = results.data ? results.data.pagination : results.pagination;
            renderMoviesAndPagination(pagination, movies); // Bỏ các tham số filterType và filterValue
        })
        .catch(function(error) {
            console.error("Error fetching movie data:", error);
            contentPhim.innerHTML = `<div class="col-12 text-center text-light">Không tìm thấy phim nào.</div>`;
            paginationElement.innerHTML = '';
        });
}

// --- Function to render movies and pagination ---
// Hàm này sẽ tạo các nút phân trang và gắn sự kiện cho chúng.
function renderMoviesAndPagination(pagination, items) {
    let { currentPage, totalPages } = pagination;
    currentPage = currentPage || 1;
    totalPages = totalPages || 1;

    let htmls = '';

    // Nút "Trang trước"
    if (currentPage > 1) {
        // Sử dụng href="#" và data-page để xử lý bằng JS
        htmls += `<li class="page-item">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>`;
    }

    const maxPagesToShow = 5; // Số lượng nút trang hiển thị tối đa
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Điều chỉnh startPage nếu số lượng trang cuối cùng ít hơn maxPagesToShow
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    // Đảm bảo startPage không nhỏ hơn 1
    startPage = Math.max(1, startPage);


    for (let i = startPage; i <= endPage; i++) {
        htmls += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>`;
    }

    // Nút "Trang sau"
    if (currentPage < totalPages) {
        // Sử dụng href="#" và data-page để xử lý bằng JS
        htmls += `<li class="page-item">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>`;
    }
    paginationElement.innerHTML = htmls;

    // Gắn sự kiện click cho các nút phân trang SAU KHI chúng được render vào DOM
    const pageLinks = paginationElement.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // RẤT QUAN TRỌNG: Ngăn chặn hành vi mặc định của thẻ a (tức là điều hướng trang)
            const pageToGo = parseInt(this.dataset.page); // Lấy số trang từ thuộc tính data-page

            // Cập nhật URL trong trình duyệt mà không tải lại trang
            updateUrlPageParameter(pageToGo);
            
            // Gọi lại hàm tải phim với số trang mới
            callMoviesAPI(pageToGo);
        });
    });

    // Render movie content (Phần này giữ nguyên từ code gốc của bạn)
    let content = '';
    if (items && items.length > 0) {
        items.forEach(function(item) {
            const categories = item.category && item.category.length > 0 ? item.category.map(cat => cat.name).join(', ') : '';
            const countries = item.country && item.country.length > 0 ? item.country.map(coun => coun.name).join(', ') : '';
            const season = item.tmdb && item.tmdb.type === 'tv' && item.tmdb.season ? item.tmdb.season : null;

            let imageUrl = item.poster_url;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = IMAGE_CDN_BASE + '/' + imageUrl.replace(/^\//, '');
            }

            const categoryHtml = categories ? `<p class="card-text">Thể loại: ${categories}</p>` : '';
            const countryHtml = countries ? `<p class="card-text">Quốc gia: ${countries}</p>` : '';
            const seasonHtml = season ? `<p class="card-text">Mùa: ${season}</p>` : '';

            content += `<div onclick="tranfor('${item.slug}')" class="col">
                <div class="card h-100">
                  <img src="${imageUrl}" class="card-img-top img-fit" alt="${item.name}">
                  <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    ${categoryHtml}
                    ${countryHtml}
                    ${seasonHtml}  <p class="card-text">Năm: ${item.year}</p>
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

// --- Hàm mới để cập nhật tham số 'page' trong URL mà không tải lại trang ---
function updateUrlPageParameter(page) {
    const url = new URL(window.location.href);
    let params = new URLSearchParams(url.search); // Lấy tất cả tham số hiện có

    params.set('page', page); // Cập nhật hoặc thêm tham số 'page'

    url.search = params.toString();
    window.history.pushState({ path: url.href }, '', url.href);
}


// --- Search Functionality (Giữ nguyên logic chuyển trang search.html) ---
// Vì bạn chỉ yêu cầu sửa phân trang chứ không phải tất cả các loại lọc
function search() {
    searchbutton.onclick = function(e) {
        const content = searchElement.value.trim();
        if (content === '') {
            e.preventDefault();
        } else {
            // Vẫn chuyển hướng sang search.html như ban đầu của bạn
            window.location.href = `search.html?keyword=${encodeURIComponent(content)}`;
        }
    };
    searchElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchbutton.click();
        }
    });
}

// --- Populate Dropdowns (Giữ nguyên logic chuyển trang genre.html, country.html, year.html) ---
// Vì bạn chỉ yêu cầu sửa phân trang chứ không phải tất cả các loại lọc
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

// --- Initial Calls for index.html ---
document.addEventListener('DOMContentLoaded', () => {
    // Lấy số trang từ URL khi trang tải lần đầu
    const initialPage = parseInt(getUrlParameter('page')) || 1;
    callMoviesAPI(initialPage); // Tải phim với số trang ban đầu
    search(); // Initialize search (giữ nguyên hành vi chuyển trang)
    fetchGenres(); // Populate genres dropdown (giữ nguyên hành vi chuyển trang)
    fetchCountries(); // Populate countries dropdown (giữ nguyên hành vi chuyển trang)
    populateYears(); // Populate years dropdown (giữ nguyên hành vi chuyển trang)
});
