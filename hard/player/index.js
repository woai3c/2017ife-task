function $(selector) {
    return document.querySelector(selector);
}

function Player(musicArry) {
    this.musicArry = musicArry;
    this.audio = $('audio');
    this.img = $('.right div img'); 
    this.songName = $('.song_name'); // 歌曲名字
    this.singer = $('.singer'); // 歌手名字
    this.download = $('.download'); // 点击下载
    this.deg = 0; // 图片旋转角度
    this.imgtimer; // 图片旋转定时器
    this.bartimer; // 进度条定时器
    this.audio.volume = 0.5;
    this.random = false; // 是否随机播放
    this.someClickEvent();
}

Player.prototype = {
    init: function(index) {
        var index = index || 0;
        this.audio.src = this.musicArry[index].musicSrc;
        this.img.src = this.musicArry[index].imgSrc;
        this.songName.innerHTML =  this.musicArry[index].music;
        this.singer.innerHTML =  this.musicArry[index].name;
        this.deg = 0;
        this.download.href = this.musicArry[index].musicSrc; 
        this.audio.dataset.index = index;
        this.SetImgRotate();
    },
    SetImgRotate: function() {
        clearInterval(this.imgtimer);
        this.imgtimer = setInterval(() => {
            this.deg += 0.5;
            this.img.style.transform = 'rotate(' + this.deg + 'deg)';
        }, 50);
        this.clickNextMusic();
        this.audio.addEventListener('canplay', this.displayBar.bind(this)); // 音频加载完成事件
    },
    clickNextMusic: function() {
        var next = $('.icon-jinrujiantou');
        var index = this.audio.dataset.index;
        next.onclick = () => { // 点击更换各种源文件以及图片旋转角度归零
            if (this.random) {
                index = Math.floor(Math.random() * this.musicArry.length);
            } else {
                index = ++index % this.musicArry.length;
            }
            this.audio.currentTime = 0; // 播放时间归零
            $('.prrogress_bar').style.width = 0; // 播放进度归零
            $('.bar_circle').style.left = 0; 
            $('.display_end_time').innerHTML = '/00:00';
            $('.display_cur_time').innerHTML = '00:00';
            this.init(index);
            if ($('.isplay').title != '播放') {
                this.audio.play();
            }
        }
    },
    someClickEvent: function() {
        var upload = $('.upload');
        var i = $('.love_icon i');
        var isplay = $('.isplay i');
        var bar_circle = $('.bar_circle'); // 进度条圆点
        var horn_bar_container = $('.horn_bar_container'); // 喇叭容器
        var horn_circle = $('.horn_circle'); // 喇叭进度条圆点
        var horn_bar_bg = $('.horn_bar_bg'); // 喇叭进度条背景容器
        var horn_bar = $('.horn_bar'); // 喇叭进度条
        var horn_bar_container_two = $('.horn_bar_container_two'); // 喇叭进度条容器
        var isplay_a = $('.isplay');
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
        isplay_a.onclick = function() { // 播放 暂停
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
        $('.bar_container').onmousedown = function(event) { // 点击切换播放进度
            var barWidth = this.clientWidth; // 进度条宽度
            var bar = $('.prrogress_bar'); // 进度条
            var bar_circle = $('.bar_circle'); // 进度条圆点
            var offLeft;  // 相对于屏幕的偏移量
            var differWidth;
            var width;
            self.audio.pause();
            move(event);

            function move(event) { // 鼠标移动函数
                offLeft = self.getScreenOffsetLeft(bar_circle);
                differWidth = event.clientX - offLeft;
                width = ((bar_circle.offsetLeft + differWidth) / barWidth * 100).toFixed(2) + '%';
                self.audio.currentTime = ((bar_circle.offsetLeft + differWidth) / barWidth) * self.audio.duration; 
                bar.style.width = width;
                bar_circle.style.left = width;
            }    
            this.addEventListener('mousemove', move);
            document.addEventListener('mouseup', function() { // 鼠标弹起解除鼠标移动事件
                if (isplay_a.title !== '播放') {
                    self.audio.play();
                }
                this.removeEventListener('mousemove', move);
            }.bind(this)); 
        }
        $('.horn').onclick = function() { // 显示隐藏喇叭容器
            var self = this;
            if (horn_bar_container.style.display == 'block') {
                horn_bar_container.style.display = 'none';
            } else {
                horn_bar_container.style.display = 'block'
            }
            window.onclick = function(event) {
                var target = event.target;
                if (target != horn_bar_container && target != self && target != horn_bar_container_two && target != horn_bar && target != horn_bar_bg) {
                    horn_bar_container.style.display = 'none';
                }
            }
        }
        horn_bar_container_two.onclick = function(event) { // 调整音量
            var barBgHeight = horn_bar_bg.clientHeight; // 喇叭背景进度条高度
            var barHeight = horn_bar.clientHeight; // 喇叭进度条高度
            var offTop = self.getScreenOffsetTop(horn_circle); // 相对于屏幕的偏移量
            var differHeight = offTop - event.clientY;
            var percent = (barHeight + differHeight) / barBgHeight;
            if (percent < 0) {
                percent = 0;
            } else if (percent > 1) {
                percent = 1;
            }
            self.audio.volume = percent; // 音量
            horn_bar.style.height = percent * 100 + '%';
            horn_circle.style.bottom = percent * 100 + '%';
        }
        $('.icon-shanchu').onclick = function() { // 删除音乐
            self.musicArry.splice(self.audio.dataset.index, 1);
            if (self.musicArry.length == 0) {
                $('.container').innerHTML = '<h1>音乐库已经空了！</h1>';
            } else {
                self.init();
            }
        }
        $('.music_loop').onclick = function() { // 单曲循环
            if (self.audio.loop == true) {
                self.audio.loop = false;
                this.children[0].className = 'iconfont icon-arrow-right';
            } else {
                self.audio.loop = true;
                this.children[0].className = 'iconfont icon-xunhuan';
            }
        }
        $('.random_play').onclick = function() { // 切换播放方式 随机播放 顺序播放
            if (this.children[0].className == 'iconfont icon-shunxuxunhuan') {
                this.children[0].className = 'iconfont icon-tubiao06';
                self.random = true;
                this.title = '随机播放';
            } else {
                this.children[0].className = 'iconfont icon-shunxuxunhuan';
                self.random = false;
                this.title = '顺序播放';
            }
        }
    },
    displayBar: function() { 
        var endTimeSpan = $('.display_end_time');
        var curTimeSpan = $('.display_cur_time');
        var audio = this.audio;
        var endTime = Math.floor(audio.duration);
        var endM = Math.floor(endTime / 60);
        var endS = endTime % 60;
        var bar = $('.prrogress_bar'); // 进度条
        var bar_circle = $('.bar_circle'); // 进度条圆点
        var time; // 当前播放时间
        var m; // 分
        var s; // 秒
        var width; // 当前播放时间/总时间的百分比
        endTimeSpan.innerHTML = '/' + endM + ':' + endS;
        audio.onended = function() { // 歌曲结束触发下一首
            clearInterval(this.bartimer);
            if (this.loop) { // 循环播放则返回 
                return;
            }
            $('.icon-jinrujiantou').click();
        }.bind(this);

        clearInterval(this.bartimer);
        this.bartimer = setInterval(function() { // 进度条定时器
            time = Math.floor(audio.currentTime);
            m = Math.floor(time / 60);
            s = time % 60;
            m = m >= 10? m : '0' + m;
            s = s >= 10? s : '0' + s;
            curTimeSpan.innerHTML = m + ':' + s;
            width = (audio.currentTime / audio.duration * 100).toFixed(2) + '%';
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
player.init();