function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function init() {
    var mainCanvas = $('.main');
    var subCanvas = $('.sub');
    var minCanvas = $('.min');
    var text = $('.text');
    var re = /^#[0-9a-f]{6}$/;
    setRightCanvasColor(subCanvas);
    setLeftCanvasColor(mainCanvas);

    mainCanvas.onclick = function(event) {
        var ctx = this.getContext('2d');
        var data = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
        var ctx2 = minCanvas.getContext('2d');
        var color = '#' + formatData(data[0].toString(16)) + formatData(data[1].toString(16)) + formatData(data[2].toString(16));
        text.value = color;
        ctx2.fillStyle = color;
        ctx2.fillRect(0, 0, minCanvas.width, minCanvas.height);

        var inputs = $$('.right input');
        for (var i = 0, len = inputs.length; i < len; i++) {
            inputs[i].value = data[i];
        }
    }

    subCanvas.onclick = function(event) {
        var ctx = this.getContext('2d');
        var data = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
        var ctx2 = mainCanvas.getContext('2d');
        var color = '#' + formatData(data[0].toString(16)) + formatData(data[1].toString(16)) + formatData(data[2].toString(16));
        setLeftCanvasColor(mainCanvas, color);
    }

    text.oninput = function(event) {
        re.test(this.value)? setLeftCanvasColor(mainCanvas, this.value) : '';
    }
}

function setRightCanvasColor(canvas) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var linearGra = ctx.createLinearGradient(0, 0, 0, height);
    linearGra.addColorStop(0.0,'#FF3333');
    linearGra.addColorStop(0.2,'#F3FF33');
    linearGra.addColorStop(0.4,'#33FF33');
    linearGra.addColorStop(0.6,'#3333FF');
    linearGra.addColorStop(0.8,'#FF33F3');
    linearGra.addColorStop(1.0,'#FF3333');
    ctx.fillStyle = linearGra;
    ctx.fillRect(0, 0, width, height);
    ctx.fill();
}

function setLeftCanvasColor(canvas, color) {
    color = color || 'red';
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var linearGra = ctx.createLinearGradient(0, 0, width, height);
    linearGra.addColorStop(0.0, '#fff');
    linearGra.addColorStop(0.5, color);
    linearGra.addColorStop(1.0, '#000');
    ctx.fillStyle = linearGra;
    ctx.fillRect(0, 0, width, height);
    ctx.fill();
}

function formatData(str) {
    return str.length == 2? str : '0' + str;
}

init();