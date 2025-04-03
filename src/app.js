import data from "../data/songs.js";

/*
    1. render songs -> ok
    2. Scroll top -> ok
    3. CD rotate -> ok
    4. play / pause / seek (tua) -> ok
    5. Next / perv -> ok
    6. Random songs -> ok
    7. Next / Repeat when ended -> ok
    8. Active song -> ok
    9. Scroll active song into view -> ok
    10. Play song when click -> ok
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUCSIC_PLAYER";
const playlist = $(".playlist");
const cd = $(".cd");
const dashboard = $(".dashboard");
const cdthumb = $(".cd-thumb");
const nameSong = $("header h2");
const bgImgSong = $("#bg-img");
const control = $(".control");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const progress = $("#progress");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const volumeBtn = $(".volume-btn");
const volumeWrap = $(".volume-wrap");
const volumeRange = $(".volume-range");
const volumeOput = $(".volume-output");
const option = $(".option");
const optionList = $(".option-list");
const darkModeToggle = $(".dark-mode-toggle");
const themeIcon = $(".theme-icon");
const themeText = $(".dark-mode-toggle span");
const favoritesToggle = $(".favorite-toggle");
const searchBox = $(".search-box");
const searchSongs = $(".search-songs");
const searchInput = $(".search-input");

// Biến lưu query tất cả bài hát ở playlist để thực hiện searching
let songsList;

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  //Kiểm tra xem có đang hiển thị danh sách yêu thích không
  isShowingFavorites: false,
  //Mảng chứa danh sách bài hát yêu thích
  favoriteSongs: [],
  // khi chạy ứng dụng sẽ đọc từ local storage ra lưu vào config và loadConfig lưu vào cấu hình gốc
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  playedSongs: data.playedSongs,
  songs: data.songs,
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const list = this.isShowingFavorites
      ? this.songs.filter((_, index) => this.favoriteSongs.includes(index))
      : this.songs;
    const htmls = list.map((song, index) => {
      const originalIndex = this.songs.findIndex((s) => s.name === song.name && s.singer === song.singer);
      const isFavorited = this.favoriteSongs.includes(originalIndex);
      return `
        <div class="song-node">
            <div class="song ${originalIndex === this.currentIndex ? "active" : ""}" data-index="${originalIndex}">
              <div class="thumb" style="background-image: url(${song.image})">
              </div>
              <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
              </div>
              <div class="btn-favorite ${isFavorited ? "active" : ""}">
                  <i class="${isFavorited ? "fas" : "far"} fa-heart"></i>
              </div>
          </div>
        </div>
      `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    // Click outside then close the opening box
    document.onclick = function (e) {
      if (!e.target.closest(".search-box")) {
        searchSongs.style.display = "none";
        searchInput.setAttribute("style", "border-bottom-right-radius: none; border-bottom-left-radius: none");
      }
    };
    // search
    searchBox.onclick = function () {
      searchSongs.style.display = "block";
      searchInput.setAttribute("style", "border-bottom-right-radius: 0; border-bottom-left-radius: 0");
      songsList = $$(".song-node");
    };
    // Xử lý sự kiện nhập vào ô tìm kiếm
    searchInput.oninput = function (e) {
      let searchValue = e.target.value;
      if (!searchValue) {
        searchSongs.innerHTML = "";
        return;
      }
      let searchResult = [];
      songsList.forEach((song) => {
        let copySong = song.cloneNode(true);
        // removeAccents() là loại bỏ dấu tiếng việt thành không dấu, toUpperCase() là chuyển thành chữ hoa để so sánh không phân biệt chữ hoa/thường
        let songInfo = _this.removeAccents(copySong.innerText).toUpperCase();
        // chuyển giá trị người dùng nhập vào thành không dấu và chữ hoa
        searchValue = _this.removeAccents(searchValue.toUpperCase());
        if (songInfo.includes(searchValue)) {
          searchResult.push(copySong.innerHTML);
        }
      });
      searchSongs.innerHTML = searchResult.join("");
    };
    searchSongs.onclick = function (e) {
      playlist.onclick(e);
    };
    // Xử lý bật / tắt volume
    volumeBtn.onclick = function () {
      volumeWrap.style.display = volumeWrap.style.display === "block" ? "none" : "block";
    };
    volumeWrap.onclick = function (e) {
      e.stopPropagation();
    };
    // Xử lý thay đổi âm lượng bài hát
    volumeRange.oninput = function (e) {
      //audio.volume: Giá trị từ 0.0 (tắt tiếng) đến 1.0 (max volume).
      audio.volume = e.target.value / 100;
      volumeOput.textContent = e.target.value;
      _this.setConfig("volume", e.target.value);
    };
    // Xử lý bật tắt option
    option.onclick = function () {
      optionList.classList.toggle("active");
    };
    // dark mode
    darkModeToggle.onclick = function () {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      themeIcon.classList.toggle("fa-sun", isDark);
      themeIcon.classList.toggle("fa-moon", !isDark);
      themeText.textContent = themeIcon.matches(".fa-sun") ? "Light mode" : "Dark mode";
      _this.setConfig("isDark", isDark);
    };
    // danh sach bài hát được yêu thích
    favoritesToggle.onclick = function () {
      _this.isShowingFavorites = !_this.isShowingFavorites;
      favoritesToggle.classList.toggle("active", _this.isShowingFavorites);
      _this.render();
    };
    // Xử lý cd quay và dừng
    const cdThumbAnimation = cdthumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimation.pause();
    // Xử lý phóng to / thu nhỏ cd
    const cdWidth = cd.offsetWidth;
    let dashboardTop = dashboard.offsetTop;
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;

      if (newCdWidth > 0) {
        dashboardTop = 20 + "px";
      } else {
        dashboardTop = 0 + "px";
      }
      dashboard.style.top = dashboardTop;

      if (document.onscroll) {
        volumeWrap.style.display = "none";
      }
    };
    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      control.classList.add("playing");
      cdThumbAnimation.play();
    };
    // Khi song được pause
    audio.onpause = function () {
      _this.isPlaying = false;
      control.classList.remove("playing");
      cdThumbAnimation.pause();
    };
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
        _this.setConfig("songCurrentTime", audio.currentTime);
        _this.setConfig("songProgressValue", progress.value);
      }
    };
    // Xử lý khi tua song
    progress.oninput = function () {
      const seekTime = (progress.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };
    // Xử lý khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      _this.scrollToActiveSong();
    };
    // Xử lý khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      _this.scrollToActiveSong();
    };
    // Xử lý bật / tắt random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };
    // Xử lý bật / tắt repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // Xử lý next song khi nó ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const favoriteIcon = e.target.closest(".btn-favorite i");

      if (songNode && !favoriteIcon) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        _this.scrollToActiveSong();
        audio.play();
      } else {
        const index = Number(favoriteIcon.parentElement.parentElement.dataset.index);
        _this.toggleFavorite(index);
      }
    };
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
    audio.play();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
    audio.play();
  },
  playRandomSong: function () {
    let newIndex;
    if (this.playedSongs === this.songs.length) {
      this.playedSongs = [];
    }
    do {
      // Xử lý không trùng với index hiện tại
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.playedSongs.includes(newIndex));
    this.currentIndex = newIndex;
    this.playedSongs.push(newIndex);
    this.loadCurrentSong();
    audio.play();
  },
  // Chuẩn hóa chuỗi sang unicode format
  removeAccents: function (str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  },
  // Xử lý danh sách yêu thích bài hát
  toggleFavorite: function (index) {
    const isFavorited = this.favoriteSongs.includes(index);
    if (isFavorited) {
      this.favoriteSongs = this.favoriteSongs.filter((id) => id !== index);
    } else {
      this.favoriteSongs.push(index);
    }
    this.setConfig("favoriteSongs", this.favoriteSongs);
    this.render();
  },
  // Xử lý cuộn các bài hát hiện lên khi bị ẩn dưới Dom
  scrollToActiveSong: function () {
    setTimeout(() => {
      const activeSong = $(".song.active");
      if (activeSong) {
        activeSong.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      // Nếu là bài hát đầu tiên, reset kích thước CD
      if (this.currentIndex === 0) {
        activeSong.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 300);
  },
  loadConfig: function () {
    this.currentIndex = this.config.currentSongIndex || 0;
    this.isRandom = this.config.isRandom || false;
    this.isRepeat = this.config.isRepeat || false;
    audio.volume = this.config.volume / 100 || 1;
    volumeRange.value = this.config.volume || 100;
    volumeOput.textContent = this.config.volume || "100";
    progress.value = this.config.songProgressValue || 0;
    audio.currentTime = this.config.songCurrentTime || 0;
    if (this.config.isDark) {
      document.body.classList.add("dark");
      themeIcon.classList.toggle("fa-sun");
      themeIcon.classList.toggle("fa-moon");
      themeText.textContent = themeIcon.matches(".fa-sun") ? "Light mode" : "Dark mode";
    }
    this.favoriteSongs = this.config.favoriteSongs || [];
  },
  loadCurrentSong: function () {
    nameSong.textContent = this.currentSong.name;
    cdthumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
    bgImgSong.src = this.currentSong.image;
    const activeSongs = $$(".song.active");
    const currentActiveSongs = $$(`.song[data-index= "${this.currentIndex}"]`);
    currentActiveSongs.forEach((currentActiveSong) => {
      currentActiveSong.classList.add("active");
    });
    activeSongs.forEach((activeSong) => {
      if (activeSong && activeSong.matches(".active")) {
        activeSong.classList.remove("active");
      }
    });
    // Lưu bài hát hiện tại vào localStorage
    this.setConfig("currentSongIndex", this.currentIndex);
  },
  start: function () {
    // Lưu cấu hình từ config vào ứng dụng
    this.loadConfig();
    // định nghĩa ra các thuộc tính cho obj
    this.defineProperties();
    // hàm lắng nghe / xử lý sự kiện
    this.handleEvents();
    // tải thông tin bài hát đầu tiên vào UI khi chạy app
    this.loadCurrentSong();
    // Render playlist
    this.render();
    // hiển thị trạng thái ban đầu của btn repeat và random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
