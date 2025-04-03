const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const background = $('#bg-img');
const dashboard = $('.dashboard');
const volume = $('#volume');
const volumeControl = $('.volume-control');
const volumeIcon = $('.volume-icon');
const searchInput = $('#search');
const darkModeToggle = $('.dark-mode-toggle');
const favoritesToggle = $('.favorites-toggle');
const optionIcon = $('.option-icon');
const optionMenu = $('.option-menu');
const uploadSong = $('.upload-song');
const uploadAudioInput = $('#upload-audio-input');
const uploadImageInput = $('#upload-image-input');
const uploadModal = $('#upload-modal');
const songNameInput = $('#song-name');
const singerNameInput = $('#singer-name');
const uploadImageBtn = $('#upload-image-btn');
const previewImage = $('#preview-image');
const saveSongBtn = $('#save-song-btn');
const cancelSongBtn = $('#cancel-song-btn');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isShowingFavorites: false,
    favorites: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Sơn Tùng MTP',
            path: './assets/music/1.mp3',
            image: './assets/img/1.jpg'
        },
        {
            name: 'Khổng tú cầu',
            singer: 'Tony Nguyễn',
            path: './assets/music/2.mp3',
            image: './assets/img/2.jpg'
        },
        {
            name: 'Anh thôi nhân nhượng',
            singer: 'Tony Nguyễn',
            path: './assets/music/3.mp3',
            image: './assets/img/3.jpg'
        },
        {
            name: 'Bồ công anh',
            singer: 'Phong Max',
            path: './assets/music/4.mp3',
            image: './assets/img/4.jpg'
        },
        {
            name: 'Dù cho tận thế',
            singer: 'Erik',
            path: './assets/music/5.mp3',
            image: './assets/img/5.jpg'
        },
        {
            name: 'Nỗi nhớ vô hạn',
            singer: 'Thanh Hưng',
            path: './assets/music/6.mp3',
            image: './assets/img/6.jpg'
        },
        {
            name: 'Từng là ',
            singer: 'Vũ Cát Tường',
            path: './assets/music/7.mp3',
            image: './assets/img/7.jpg'
        },
        {
            name: 'Shape of you',
            singer: 'Ed Sheeran',
            path: './assets/music/8.mp3',
            image: './assets/img/8.jpg'
        },
        {
            name: 'Memories',
            singer: 'Maroon 5',
            path: './assets/music/9.mp3',
            image: './assets/img/9.jpg'
        },
        {
            name: 'Yourman',
            singer: 'The Weeknd',
            path: './assets/music/10.mp3',
            image: './assets/img/10.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(songs = this.songs) {
        const displaySongs = this.isShowingFavorites 
            ? this.songs.filter((_, index) => this.favorites.includes(index)) 
            : songs;
        const htmls = displaySongs.map((song) => {
            const originalIndex = this.songs.findIndex(s => s.name === song.name && s.singer === song.singer);
            const isFavorited = this.favorites.includes(originalIndex);
            return `<div class="song ${originalIndex === this.currentIndex ? 'active' : ''}" data-index="${originalIndex}">
                        <div class="thumb" style="background-image: url('${song.image}')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="btn-favorite ${isFavorited ? 'active' : ''}" data-index="${originalIndex}">
                            ${isFavorited ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
                        </div>
                        <div class="btn-delete" data-index="${originalIndex}">
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>`;
        });
        playlist.innerHTML = htmls.join('');
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            let marginTop = dashboard.style.marginTop;
            if (newCdWidth > 0) {
                marginTop = 20 + 'px';
            } else {
                marginTop = 0 + 'px';
            }
            dashboard.style.marginTop = marginTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        };

        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };

        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        };

        progress.oninput = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const favoriteBtn = e.target.closest('.btn-favorite');
            const deleteBtn = e.target.closest('.btn-delete');
            if (songNode && !favoriteBtn && !deleteBtn) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
            if (favoriteBtn) {
                const index = Number(favoriteBtn.dataset.index);
                _this.toggleFavorite(index);
            }
            if (deleteBtn) {
                const index = Number(deleteBtn.dataset.index);
                _this.deleteSong(index);
            }
        };

        volume.oninput = function(e) {
            audio.volume = e.target.value / 100;
            _this.setConfig('volume', e.target.value);
        };

        volumeIcon.onclick = function() {
            volumeControl.classList.toggle('active');
        };

        searchInput.oninput = function(e) {
            const searchValue = e.target.value.toLowerCase();
            const filteredSongs = _this.songs.map((song, index) => ({ ...song, originalIndex: index })).filter(song => 
                song.name.toLowerCase().includes(searchValue) || song.singer.toLowerCase().includes(searchValue)
            );
            _this.render(filteredSongs.map(song => ({
                ...song,
                index: song.originalIndex
            })));
        };

        darkModeToggle.onclick = function() {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            _this.setConfig('isDark', isDark);
            darkModeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun" style="color: #fba524;"></i><span style="font-size: 14px; margin-left: 8px;">Light Mode</span>' : 
                '<i class="fas fa-moon" style="color: #000;"></i><span style="font-size: 14px; margin-left: 8px;">Dark Mode</span>';
        };

        favoritesToggle.onclick = function() {
            _this.isShowingFavorites = !_this.isShowingFavorites;
            favoritesToggle.classList.toggle('active', _this.isShowingFavorites);
            _this.render();
        };

        optionIcon.onclick = function() {
            optionMenu.classList.toggle('active');
        };

        // Upload bài hát mới
        uploadSong.onclick = function() {
            uploadAudioInput.click();
        };

        let uploadedAudioFile = null;
        uploadAudioInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('audio/')) {
                uploadedAudioFile = file;
                songNameInput.value = file.name.replace(/\.[^/.]+$/, "");
                singerNameInput.value = "";
                previewImage.src = "https://via.placeholder.com/150";
                uploadModal.style.display = 'flex';
            } else {
                alert("Vui lòng chọn file âm thanh hợp lệ!");
            }
        };

        uploadImageBtn.onclick = function() {
            uploadImageInput.click();
        };

        uploadImageInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const imageURL = URL.createObjectURL(file);
                previewImage.src = imageURL;
            } else {
                alert("Vui lòng chọn file hình ảnh hợp lệ!");
            }
        };

        saveSongBtn.onclick = function() {
            if (uploadedAudioFile) {
                const newSong = {
                    name: songNameInput.value || "Unknown Song",
                    singer: singerNameInput.value || "Unknown",
                    path: URL.createObjectURL(uploadedAudioFile),
                    image: previewImage.src
                };
                _this.songs.push(newSong);
                _this.setConfig('songs', _this.songs);
                _this.render();
                uploadModal.style.display = 'none';
                uploadedAudioFile = null;
                uploadAudioInput.value = '';
                uploadImageInput.value = '';
            }
        };

        cancelSongBtn.onclick = function() {
            uploadModal.style.display = 'none';
            uploadedAudioFile = null;
            uploadAudioInput.value = '';
            uploadImageInput.value = '';
        };
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 300);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        background.src = this.currentSong.image;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom || false;
        this.isRepeat = this.config.isRepeat || false;
        this.favorites = this.config.favorites || [];
        audio.volume = (this.config.volume || 50) / 100;
        volume.value = this.config.volume || 50;
        if (this.config.isDark) {
            document.body.classList.add('dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun" style="color: #fba524;"></i><span style="font-size: 14px; margin-left: 8px;">Light Mode</span>';
        }
        if (this.config.songs) {
            this.songs = this.config.songs.map(song => ({
                ...song,
                path: song.path.includes('blob:') ? song.path : `./assets/music/${song.path.split('/').pop()}`
            }));
        }
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    toggleFavorite: function(index) {
        const isFavorited = this.favorites.includes(index);
        if (isFavorited) {
            this.favorites = this.favorites.filter(id => id !== index);
        } else {
            this.favorites.push(index);
        }
        this.setConfig('favorites', this.favorites);
        this.render();
    },
    deleteSong: function(index) {
        if (confirm("Bạn có chắc muốn xóa bài hát này không?")) {
            this.songs.splice(index, 1);
            this.favorites = this.favorites.filter(fav => fav !== index);
            this.favorites = this.favorites.map(fav => fav > index ? fav - 1 : fav);
            if (this.currentIndex === index) {
                this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : 0;
                this.loadCurrentSong();
            } else if (this.currentIndex > index) {
                this.currentIndex--;
            }
            this.setConfig('songs', this.songs);
            this.setConfig('favorites', this.favorites);
            this.render();
        }
    },
    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
};

app.start();