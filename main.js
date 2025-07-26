var api =` https://phimapi.com/danh-sach/phim-moi-cap-nhat?`
const paginationElement = document.querySelector('#phantrang')
const contentPhim = document.querySelector('#contentPhim')
const searchElement = document.querySelector('input[type="text"]')
const searchbutton = document.querySelector('#btnsearch')
const formsb = document.querySelector('#formsb')
console.log(searchElement)
console.log(searchbutton)
function callAPI(api){
    fetch(api)
        .then(function(respone){
            return respone.json()
        })
        .then(function(results){
           render(results.pagination,results.items)
           search()
        })
}
function render(pagination,items){
    //Render phần pagination
    var {currentPage,totalPages} = pagination
    htmls=''

    if(currentPage>1){
        htmls+=`<li onclick="changePage(${currentPage - 1})" class="page-item">
        <a class="page-link"  aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`
    }
    startPage = currentPage
    endPage =Math.min(totalPages,currentPage+4)

    for(var i =startPage ; i<= endPage;i++){
        htmls+=`<li onclick="changePage(${i})" class="page-item ${i === currentPage?'active':''}"><a class="page-link" >${i}</a></li>`
    }
    if(currentPage<totalPages){
        htmls+=`<li onclick="changePage(${currentPage + 1})" class="page-item">
        <a class="page-link"  aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>`
    }
    paginationElement.innerHTML =htmls
    
    //Render phần nội dung phim
    content=''
    items.forEach(function(item){
        content+=`<div onclick="tranfor('${item.slug}')" class="col">
        <div class="card h-100">
          <img src="${item.poster_url}" class="card-img-top img-fit" alt="Phim 1">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.tmdb.season !==null?'season'+item.tmdb.season :''}</p>
            <p class="card-text">${item.year}</p>
          </div>
        </div>
      </div>
        `
    })
    contentPhim.innerHTML =content
}
function changePage(newPage){
      var api =` https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${newPage}`
      callAPI(api)
    }
function tranfor(slug){
     window.location.href = `contentmain.html?slug=${encodeURIComponent(slug)}`;
}

function search(){
    searchbutton.onclick = function(e){
    var content = searchElement.value.trim()
    if(content===''){
      e.preventDefault()
    }else {
      window.location.href=`search.html?keyword=${encodeURIComponent(content)}`
    }
}
}

 callAPI(api); 
