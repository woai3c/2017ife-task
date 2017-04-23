function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function Player(musicArry) {
    this.musicArry = musicArry;
    this.audio = $('audio');
    this.img = $('.right div img');
    this.songName = $('.song_name');
    this.singer = $('.singer');
    this.download = $('.download');
    this.deg = 0;
    this.audio.volume = 0.5;
}

Player.prototype = {
    SetImgRotate: function() {
        var imgtimer;
        imgtimer = setInterval(() => {
            this.deg++;
            this.img.style.transform = 'rotate(' + this.deg + 'deg)';
        }, 100);
        this.clickNextMusic();
        this.someClickEvent();
        this.audio.addEventListener('canplay', this.displayBar.bind(this)); // 音频加载完成事件
    },
    clickNextMusic: function() {
        var next = $('.icon-jinrujiantou');
        var index = this.audio.dataset.index;
        next.onclick = () => { // 点击更换各种源文件以及图片旋转角度归零
            index = ++index % this.musicArry.length;
            this.audio.src = this.musicArry[index].musicSrc;
            this.img.src = this.musicArry[index].imgSrc;
            this.songName.innerHTML =  this.musicArry[index].music;
            this.singer.innerHTML =  this.musicArry[index].name;
            this.deg = 0;
            this.audio.autoplay = true;
            this.download.href = this.musicArry[index].musicSrc; 
            this.audio.dataset.index = index;
            $('.love_icon').title = '暂停';
            $('.isplay i').className = 'iconfont icon-zanting';
            this.audio.addEventListener('canplay', this.displayBar.bind(this));
        }
    },
    someClickEvent: function() {
        var upload = $('.upload');
        var i = $('.love_icon i');
        var isplay = $('.isplay i');
        var bar_circle = $('.bar_circle'); // 进度条圆点
        var horn_bar_container = $('.horn_bar_container'); // 喇叭进度条容器
        var horn_circle = $('.horn_circle'); // 喇叭进度条圆点
        var self = this;
        $('.icon-zengjia').onclick = function() { // 上传
            upload.click();
        }
        $('.love_icon').onclick = function() { // 收藏 取消收藏 
            if (i.className == 'iconfont icon-xihuan1') {
                i.className = 'iconfont icon-xihuan';
                this.title = '取消收藏';
            } else {
                i.className = 'iconfont icon-xihuan1';
                this.title = '收藏';
            }
        }
        $('.isplay').onclick = function() { // 播放 暂停
            if (isplay.className == 'iconfont icon-zanting') {
                self.audio.pause();
                this.title = '播放';
                isplay.className = 'iconfont icon-bofang';
            } else {
                self.audio.play();
                this.title = '暂停';
                isplay.className = 'iconfont icon-zanting';
                self.audio.addEventListener('canplay', self.displayBar.bind(self));
            }
        }
        $('.bar_container').onclick = function(event) { // 点击切换播放进度
            var barWidth = this.clientWidth; // 进度条宽度
            var offLeft = self.getScreenOffsetLeft(bar_circle); // 相对于屏幕的偏移量
            var differWidth = event.clientX - offLeft;
            self.audio.currentTime = ((bar_circle.offsetLeft + differWidth) / barWidth) * self.audio.duration; // bar_circle.offsetLeft 相对于父元素的偏移量
        }
        $('.horn').onclick = function() {
            if (horn_bar_container.style.display == 'block') {
                horn_bar_container.style.display = 'none';
            } else {
                horn_bar_container.style.display = 'block'
            }
        }
        horn_bar_container.onclick = function(event) {
            var barHeight = $('.horn_bar_bg').clientHeight; // 喇叭进度条高度
            var offTop = self.getScreenOffsetTop(horn_circle); // 相对于屏幕的偏移量
            var differHeight = offTop - event.clientY;
            var vol = (horn_circle.offsetTop + differHeight) / barHeight;
            self.audio.volume * vol; // 音量
            $('.horn_bar').style.Height = vol * 100 + '%';
        }
    },
    displayBar: function() { 
        var endTimeSpan = $('.display_end_time');
        var curTimeSpan = $('.display_cur_time');
        var audio = this.audio;
        var timer;
        var endTime = Math.floor(audio.duration);
        var endM = Math.floor(endTime / 60);
        var endS = endTime % 60;
        var bar = $('.prrogress_bar'); // 进度条
        var bar_circle = $('.bar_circle'); // 进度条圆点
        endTimeSpan.innerHTML = '/' + endM + ':' + endS;
        audio.onended = function() { // 歌曲结束触发下一首
            clearInterval(timer);
            $('.icon-jinrujiantou').click();
        }
        timer = setInterval(function() { // 进度条定时器
            var time = Math.floor(audio.currentTime);
            var m = Math.floor(time / 60);
            var s = time % 60;
            m = m >= 10? m : '0' + m;
            s = s >= 10? s : '0' + s;
            curTimeSpan.innerHTML = m + ':' + s;
            var width = (audio.currentTime / audio.duration * 100).toFixed(2) + '%'
            bar.style.width = width;
            bar_circle.style.left = width;
        }, 500);
    },
    getScreenOffsetLeft: function(ele) { // 获取相对于屏幕的左偏移量
        var left = 0;
        while (ele) {
            left += ele.offsetLeft;
            ele = ele.offsetParent;
        }
        return left;
    },
    getScreenOffsetTop: function(ele) { // 获取相对于屏幕的左偏移量
        var top = 0;
        while (ele) {
            top += ele.offsetTop;
            ele = ele.offsetParent;
        }
        return top;
    }
}
var musicArry = [{name: '曹格', music: '背叛', musicSrc: 'song/曹格 - 背叛.mp3', imgSrc: 'images/曹格.jpg'}, {name: '赵雷', music: '成都', musicSrc: 'song/赵雷 - 成都.mp3', imgSrc: 'images/赵雷.jpg'}, {name: 'alan-walker', music: 'Faded', musicSrc: 'song/Faded.mp3', imgSrc: 'images/alan-walker.jpg'}];
var player = new Player(musicArry);
player.SetImgRotate();