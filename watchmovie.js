const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const tapphim = params.get('tapphim');
var $ =document.querySelector.bind(document)
var contentElement =$('#content')
var vietSub =$('#list1')
var playbutton =$('#playButton')
var danhsachTapPhim ={}
const video = $('#video')
var api =`https://phimapi.com/phim/${slug}`;
    fetch(api)
        .then(function(response){
            return response.json()
        })
        .then(function(result){
            render(result)
            listPhimCungTheLoai(result.movie.category)
        })
function render(result){
      //Danh sách các tập phim
      listVietSub =''
      result.episodes.forEach(function(episode){
        if(episode.server_name.includes('(Vietsub)')){
                episode.server_data.forEach(function(data){
                listVietSub+=`<button onclick="see('${result.movie.slug}', '${data.slug}')" class="btn btn-outline-secondary ${data.slug ===tapphim?'active':''}">${data.name}</button>`
                danhsachTapPhim[data.slug] =data.link_m3u8
        })
        }
      })
      vietSub.innerHTML=listVietSub
        
      for(var key in danhsachTapPhim){
        if(key ===tapphim){
            if(Hls.isSupported()){
                const hls = new Hls();
                hls.loadSource(danhsachTapPhim[key]);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play();
                });
            }else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = danhsachTapPhim[key];
                video.play();
            }else {
            alert('Trình duyệt của bạn không hỗ trợ phát HLS (.m3u8)');
             }
             break;
        }
      }
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

    } function renderLienQuan(result){
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