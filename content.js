// Lấy slug từ URL
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
var $ =document.querySelector.bind(document)
var mainContent =$('#contentmain')
var vietSub =$('#list1')
var contentElement =$('#content')
var api =`https://phimapi.com/phim/${slug}`
    fetch(api)
        .then(function(response){
            return response.json()
        })
        .then(function(result){
            render(result)
            listPhimCungTheLoai(result.movie.category)
        })

function render(result){
    htmls=`
    <div class="col-md-4" >
        <img  src="${result.movie.poster_url}" alt="Ảnh phim" class="img-fluid rounded shadow" />
        <button onclick="see('${result.movie.slug}', '${result.episodes[0].server_data[0].slug}')" class="btn btn-primary w-100 mt-3">Xem phim</button>
      </div>
      <div class="col-md-8">
        <h2>Tên phim: ${result.movie.name}</h2>
        <p><strong>Season:</strong>${result.movie.tmdb.season !==null?result.movie.tmdb.season:''}</p>
        <p><strong>Năm phát hành:</strong> ${result.movie.year}</p>
        <p><strong>Diễn viên:</strong>
        ${result.movie.actor.map(function(actor){
            return actor
        }).join(',')}
        </p>
        <p><strong>Thể loại:</strong>
        ${result.movie.category.map(function(cate){
            return cate.name
        }).join(',')
        }
        </p>
        <p><strong>Mô tả:</strong> ${result.movie.content}</p>
      </div>
      `
      mainContent.innerHTML =htmls

      //Danh sách các tập phim
      listVietSub =''
      result.episodes.forEach(function(episode){
        if(episode.server_name.includes('(Vietsub)')){
                episode.server_data.forEach(function(data){
                listVietSub+=`<button onclick="see('${result.movie.slug}', '${data.slug}')" class="btn btn-outline-secondary">${data.name}</button>`
        })
        }
       
      })
      vietSub.innerHTML=listVietSub
}
    function listPhimCungTheLoai(arrTheLoai){
        var numberRandom=Math.floor(Math.random()*arrTheLoai.length)
        console.log(arrTheLoai[numberRandom].slug)
        var api =`https://phimapi.com/v1/api/the-loai/${arrTheLoai[numberRandom].slug}?&limit=10`
        fetch(api)
            .then(function(response){
                return response.json()
            })
            .then(function(result){
                renderLienQuan(result)
            })

    }

    function renderLienQuan(result){
        var {data} =result
        htmls=''
        data.items.forEach(function(item){
            htmls+=`
            <div onclick="tranfor('${item.slug}')" class="col">
        <div class="card h-100">
          <img src="https://phimimg.com/${item.poster_url}" class="card-img-top img-fit" alt="Phim 1">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.tmdb.season !==null?'season'+item.tmdb.season :''}</p>
            <p class="card-text">${item.year}</p>
          </div>
        </div>
      </div>
        `
        })
        contentElement.innerHTML = htmls
    }
    function tranfor(slug){
     window.location.href = `contentmain.html?slug=${encodeURIComponent(slug)}`;
}


function see(slug,tapPhim){
    window.location.href = `watchmovie.html?slug=${encodeURIComponent(slug)}&tapphim=${encodeURIComponent(tapPhim)}`;
}
