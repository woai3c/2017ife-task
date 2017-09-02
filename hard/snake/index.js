function $(id) {
    return document.getElementById(id);
}

function $$(selector) {
    return document.querySelector(selector);
}

function Snake(ele) {
    this.speed = 150; // 移动速度 毫秒
    this.snakeBody = []; // 蛇身体数组
    this.pause = false; // 暂停
    this.score = 0; // 分数
    this.level = 1; // 关卡
    this.mode = null; // 游戏模式
    this.rows = 30; // 行
    this.cols = 30; // 列
    this.ele = ele; // 容器
    this.len = 3; // 蛇长
    this.foodNum = 5; // 食物数量
    this.obstacleNum = 10; // 障碍数量
    this.keyCode = null; // 上下左右键值
    this.movetimerId = null; // 移动定时器ID
    this.timeTimerId = null; // 时间定时器ID
    this.increaseTime = 30000; // 加速间隔时间 毫秒
    this.endScore = 2000; // 通关分数
}

Snake.prototype = {
    init: function() { // 画图
        var html = '';
        for (var i = 0; i < this.rows; i++) {
            html += '<tr>';
            for (var j = 0; j < this.cols; j++) {
                html += '<td id="' + i + '_' + j + '">' + '<div id="' + i + '_' + j + '_div' + '"></div>' + '</td>';
            }
            html += '</tr>';
        }
        this.ele.children[0].innerHTML = html;
        this.createSnake(); 
        this.createFood(this.foodNum);
        this.keyEvent();
    },
    createSnake: function() { // 创建蛇
        for (var i = this.len - 1; i >= 0; i--) {
            this.snakeBody.push(0 + '_' + i);
            $(0 + '_' + i).style.backgroundColor = this.randomColor();
        }
    },
    createFood: function(num) { // 创建食物
        while (num) {
            var coordinate = this.randomCoordinate();
            if ($(coordinate[0]).style.backgroundColor === '' && $(coordinate[1]).style.backgroundColor === '') {
                $(coordinate[1]).style.backgroundColor = this.randomColor();
                $(coordinate[1]).className = 'food';
                num--;
            }
        }
    },
    createObstacle: function(num) { // 创建障碍
        while (num) {
            var coordinate = this.randomCoordinate();
            if ($(coordinate[0]).style.backgroundColor === '' && $(coordinate[1]).style.backgroundColor === '') {
                $(coordinate[0]).style.backgroundColor = '#000';
                num--;
            }
        }
    },
    keyEvent: function() { // 监听上下左右
        document.onkeydown = function(event) {
            switch(event.keyCode) {
                case 37:
                case 38:
                case 39:
                case 40:
                    this.keyCode = event.keyCode;
                    this.createTimer();
                    break;
                case 32:
                    if (!this.pause) {
                        this.clearTimer();
                        this.pause = true;
                    } else {
                        this.createTimer();
                        this.pause = false;
                    }
                    break;
            }
        }.bind(this);
    },
    randomColor: function() { // 随机产生16进制颜色
        var color = (parseInt(Math.random() * 0xffffff)).toString(16);
        return color.length === 6? '#' + color : '#' + color + '0';
    },
    randomCoordinate: function() { // 随机产生坐标
        var x = parseInt(Math.random() * 30);
        var y = parseInt(Math.random() * 30);
        return [x + '_' + y, x + '_' + y + '_div'];
    },
    snakeMove: function(keyCode) { // 蛇移动
        var coordinate = this.snakeBody[0].split('_');
        var x = coordinate[0];
        var y = coordinate[1];
        switch(this.keyCode) {
            case 37: // 左
                y--;
                if (y == this.snakeBody[1].split('_')[1]) { // 禁止倒行
                    y += 2;
                }
                break;
            case 38: // 上
                x--;
                if (x == this.snakeBody[1].split('_')[0]) {
                    x += 2;
                }
                break;
            case 39: // 右
                y++;
                if (y == this.snakeBody[1].split('_')[1]) {
                    y -= 2;
                }
                break;
            case 40: // 下
                x++;
                if (x == this.snakeBody[1].split('_')[0]) {
                    x -= 2;
                }
                break;
        }
        if (this.statusCheck(x, y)) {
            this.snakeBody.unshift(x + '_' + y);
            var arry = this.snakeBody;
            for (var i = 0, len = arry.length - 1; i < len; i++) {
                $(arry[i]).style.backgroundColor = $(arry[i + 1]).style.backgroundColor;
            }
            $(arry.pop()).style.backgroundColor = '';
        }
    },
    statusCheck: function(x, y) { // 检查下一步状态
        if (x < 0 || y < 0 || x >= this.rows || y >= this.cols) {
            this.popupPrompt('撞墙了!');
        } else if ($(x + '_' + y).style.backgroundColor == 'rgb(0, 0, 0)') {
            this.popupPrompt('撞到障碍物了!');
        } else if ($(x + '_' + y + '_div').style.backgroundColor != '') {
            this.eatFood(x, y);     
            this.isOver();  
            return false;
        } else {
            var tempXY = x + '_' + y;
            var arry = this.snakeBody;
            for (var i = 3, len = arry.length; i < len; i++) {
                if (tempXY == arry[i]) {
                    this.popupPrompt('咬到自己了！');
                }
            }
        }
        return true;
    },
    popupPrompt: function(str) { // 警告弹窗
        this.level = 1;
        this.speed = 150;
        this.resetPrompt();
        document.onkeydown = '';
        clearInterval(this.timeTimerId);
        this.timeTimerId = null;
        this.clearTimer();
        var mask2 = $$('.mask2');
        var str = '<p>' + str + '</p>';
        str += '<button>重新开始游戏</button>'; 
        $$('.warn').innerHTML = str;
        mask2.style.display = 'block';
        $$('.warn button').onclick = function() {
            mask2.style.display = 'none';
            this.snakeBody = [];
            this.init();
            switch(this.mode) {
                case 1: 
                    this.firstMode();
                    break;
                case 3:
                    this.thirdMode();
                    break;
            }
        }.bind(this);
    },
    checkMode: function() { // 选择关卡模式
        $$('.menu').onclick = function(event) {
            var mask1 = $$('.mask1');
            var target = event.target;
            switch(target.className) {
                case 'normal':
                    this.init();
                    this.firstMode();
                    this.mode = 1;
                    mask1.style.display = 'none';
                    break;
                case 'pass':
                    this.init();
                    this.mode = 2;
                    mask1.style.display = 'none';
                    break;
                case 'avoid':
                    this.init();
                    this.thirdMode();
                    this.mode = 3;
                    mask1.style.display = 'none';
                    break;
            }
        }.bind(this);
    },
    eatFood: function(x, y) { // 吃到食物
        this.snakeBody.unshift(x + '_' + y);
        $(x + '_' + y).style.backgroundColor = $(x + '_' + y + '_div').style.backgroundColor;
        $(x + '_' + y + '_div').style.display = 'none';
        this.score += 100;
        $$('.score span').innerHTML = this.score;
        this.createFood(1);
        this.isOver();
    },
    createTimer: function() { // 创建移动定时器
        var self = this;
        if (!this.movetimerId) {
            this.movetimerId = setInterval(function() {
                self.snakeMove(self.keyCode);
            }, self.speed);
        }
    },
    clearTimer: function() { // 清除定时器
        clearInterval(this.movetimerId);
        this.movetimerId = null;
    },
    firstMode: function() { // 模式一
        var self = this;
        if (!this.timeTimerId) {
            this.timeTimerId = setInterval(function() {
                self.speed -= 10;
                $$('.speed span').innerHTML = self.speed;
                self.clearTimer();
                self.createTimer();
            }, this.increaseTime);
        }
    },
    secondMode: function() { // 模式二
        this.speed -= 10;
        $$('.speed span').innerHTML = this.speed;
    },
    thirdMode: function() { // 模式三
        this.createObstacle(this.obstacleNum);
        var self = this;
        if (!this.timeTimerId) {
            this.timeTimerId = setInterval(function() {
                self.speed -= 10;
                $$('.speed span').innerHTML = self.speed;
                self.clearTimer();
                self.createTimer();
            }, this.increaseTime);
        }
    },
    isOver: function() { // 判断过关或结束
        var flag = false;
        switch(this.mode) {
            case 1:
                if (this.snakeBody.length ==  this.cols * this.rows - 10) { // 通关条件 蛇长度
                    this.score = 0;
                    flag = true;
                }
                break;
            case 2:
            case 3:
                if (this.score == this.endScore) { // 通关分数
                    this.score = 0;
                    flag = true;
                }
                break;
        }
        if (flag) {
            document.onkeydown = '';
            clearInterval(this.timeTimerId);
            this.timeTimerId = null;
            this.clearTimer();
            $$('.over').style.display = 'block';
            $$('.over button').onclick = function() {
                $$('.over').style.display = 'none';
                switch(this.mode) {
                    case 1:
                        this.popupPrompt('游戏结束，恭喜你已经达到了人生的巅峰！');
                    case 2:
                        if (this.level == 10) {
                            this.popupPrompt('游戏结束，恭喜你已经达到了人生的巅峰！');
                        } else {
                            this.level++;
                            this.snakeBody = [];
                            this.secondMode();
                            this.resetPrompt();
                            this.init();
                            break;
                        }
                    case 3:
                        if (this.level == 10) {
                            this.popupPrompt('游戏结束，恭喜你已经达到了人生的巅峰！');
                        } else {
                            this.level++;
                            this.obstacleNum += 5;
                            this.snakeBody = [];
                            this.thirdMode();
                            this.resetPrompt();
                            this.init();
                            break;
                        }
                        
                }
            }.bind(this);
        }
    },
    resetPrompt: function() { // 重置信息板
        this.score = 0;
        $$('.score span').innerHTML = this.score;
        $$('.speed span').innerHTML = this.speed;
        $$('.level span').innerHTML = this.level;
    }
}

new Snake($$('.container')).checkMode(); // 初始化游戏