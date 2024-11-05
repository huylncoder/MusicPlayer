import data from '../data/songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER_STORAGE"

const player = $('.player')
const playlist = $('.playlist');
const optionBtn = $('.option');
const optionList = $('.option-list')
const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const repeatBtn = $('.btn-repeat');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('.progress');
// Volume
const volumeBtn = $('.btn-volume')
const volumeWrap = $('.volume-wrap')
const volumeRange = $('.volume-range')
const volumeOutput = $('.volume-output')
// favorite box
const favoriteModal = $('.favorite_songs-modal')
const favoriteList = $('.favorite_songs-list')
const emptyList = $('.empty-list')

// Mảng chứa index bài hát được thả tim
let likedList = []

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: data.songs,
    // Mảng lưu chỉ số các bài hát đã phát
    playedSongs: data.playedSongs,
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="favorite">
						<i class="far fa-heart"></i>
					</div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // Bật tắt volume
        volumeBtn.onclick = function () {
            volumeWrap.style.display = !Boolean(volumeWrap.style.display) ? 'block' : null
        }
        volumeWrap.onclick = function (e) {
            e.stopPropagation()
        }
        // Drag volume range
        volumeRange.oninput = function (e) {
            audio.volume = e.target.value / 100
            volumeOutput.textContent = e.target.value
            _this.setConfig('volume', e.target.value)
        }
        // Show option list 
        optionBtn.onclick = function (e) {
            optionList.style.display = !Boolean(optionList.style.display) ? 'block' : null
        }
        optionList.onclick = function (e) {
            // Mở box favorite song
            favoriteModal.style.display = 'flex'
            $('body').style.overflow = 'hidden'
            emptyList.style.display = favoriteList.childElementCount > 0 ? 'none' : null
        }
        // Xử lý bấm vào nút close và ra ngoài thì đóng favorite box
        favoriteModal.onclick = function (e) {
            if (e.target.matches('.favorite_songs-close') || e.target.matches('.favorite_songs-modal')) {
                favoriteModal.style.display = null
                $('body').style.overflow = null
            } else {
                playlist.onclick(e)
            }
            emptyList.style.display = favoriteList.childElementCount > 0 ? 'none' : null
        }
        // Xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // Xử lý phóng to / thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {               
                audio.pause();
            } else {
                audio.play();
            }
        }
        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play();
        }
        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                progress.value = progressPercent;   
                _this.setConfig('songCurrentTime', audio.currentTime)
                _this.setConfig('songProgressValue', progress.value)
            }
        }
        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }
        // Xử lý khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Xử lý khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Xử lý random bật / tắt random song
        randomBtn.onclick =function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // Xử lý lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xử lý next song khi nó ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const favoriteIcon = e.target.closest('.favorite i')
            if (!favoriteIcon) {
                // Xử lý khi click để chuyển bài hát
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                audio.play()
            } else {
                // Xử lý khi thả tim hoặc bỏ tim
                // Từ icon đã nhấn tim, trỏ tới Parent song của icon đó 
                let favoriteSong = favoriteIcon.closest('.song')
                _this.handleLikedList([favoriteSong.dataset.index])
                _this.setConfig('likedListIndex', likedList)
            }
        }
    },
    // Xử lý danh sách bài hát yêu thích
    handleLikedList: function (favSongsIndex) {
        // Duyệt mảng vị trí các bài hát đã bấm tim, nếu like thì thêm vào favorite box
        // bỏ like thì xóa khỏi favorite box, áp dụng cho cả loadconfig 
        favSongsIndex.forEach(function (index) {
            let favoriteSong = $$(`.song[data-index="${index}"]`)
            if (!favoriteSong.length) return
            favoriteSong.forEach(song => {
                song.classList.toggle('liked')
                song.querySelector('i').classList.toggle('fas')
            })
            favoriteSong = favoriteSong[0]
            if (favoriteSong.matches('.liked')) {
                favoriteList.appendChild(favoriteSong.cloneNode(true))
                likedList.push(index)
            } else {
                let removeSong = $(`.favorite_songs .song[data-index="${index}"]`)
                removeSong.remove()
                likedList.splice(likedList.indexOf(index), 1)
            }
        })
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: "nearest",
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        // Khi đã phát hết bài hát thì reset lại mảng playedSongs
        if (this.playedSongs.length === this.songs.length) {
            this.playedSongs = [];
        }
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedSongs.includes(newIndex))
        // Cập nhật currentIndex và lưu bài hát vào mảng playedSongs
        this.currentIndex = newIndex;
        this.playedSongs.push(newIndex);

        this.loadCurrentSong();
    },
    // Load cấu hình đã lưu mỗi khi reload trang
    loadConfig: function () {
        this.isRandom = this.config.isRandom 
        this.isRepeat = this.config.isRepeat
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
        this.currentIndex = this.config.currentSongIndex || 0
        progress.value = this.config.songProgressValue || 0
        audio.currentTime = this.config.songCurrentTime || 0
        // Load volume
        audio.volume = this.config.volume / 100 || 1
        volumeRange.value = this.config.volume || 100
        volumeOutput.textContent = this.config.volume || '100'
    },
    start: function() {
        // Gán cấu hình đã lưu từ config vào Object
        this.loadConfig()
        // định nghĩa ra các thuộc tính cho obj
        this.defineProperties();
        // hàm lắng nghe / xử lý sự kiện
        this.handleEvents();
        // tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong();
        // Render playlist
        this.render();
    },
}
app.start();
