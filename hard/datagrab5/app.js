var Koa = require('koa');
var fs = require('fs');
var router = require('koa-router')();
var app = new Koa();
var bodyParser = require('koa-bodyparser');
var exec = require('child_process').exec;
var cmdStr = 'phantomjs task.js ';
var mongoose = require('mongoose');
var async = require('async');
var server = app.listen(8080);
var io = require('socket.io')(server);
var done = 0; // 已经完成的任务数
var total = 0; // 总任务数
var flag = 0; // 1为否
var ResultSchema = new mongoose.Schema({
    code: Number,
    msg: String,
    word: String,
    device: String,
    time: Number,
    dataList: [{
        info: String,
        link: String,
        pic: String,
        title: String
    }]
});
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'连接错误:'));
db.once('open',function(){
    console.log("数据库已连接");
});
var ResultModel = db.model('results', ResultSchema);

function render(page) { // 读取主页数据
    return new Promise((resolve, reject) => {
        var viewUrl = `./${page}`;
        fs.readFile(viewUrl, "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
            resolve(data);
            }
        });
    });
}

var handleTask = async(exp) => { // 调用子进程执行phantomjs爬取数据
    return new Promise((resolve, reject) => {
        exec(exp, (err, stdout) => {
            if (err) {
                reject(`调用服务错误！ ${exp} error: ${err}`);
            }
            else {
                resolve(JSON.parse(stdout)); // 返回数据
            }
        });
    });
};

app.use(require('koa-static')('./')); // 设置当前目录为根目录
app.use(bodyParser());
app.use(router.routes());
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

router.get('/', async(ctx, next) => { // 主页
    ctx.response.body = await render('index.html');
});
// add router middleware:

var queue = async.queue(async function(task, callback) {
    var exp = cmdStr + task.word + ' ' + task.device + ' ' + task.pages;
    var result = await handleTask(exp);
    new ResultModel(result).save(function(err) { // 数据保存到数据库
        if(err) {
            console.log(err);
        }
        console.log('数据已保存到数据库');
    });
    done++;
    task.socket.emit('grabData', [result, done, total]);
}, 5);

queue.drain = function() { // 所有任务完成时触发
    console.log('所有任务处理完成');
}

io.on('connection', function(socket) { 
    if (flag) { // 如果不是第一次连接 将任务数置为0
        done = 0;
        total = 0;
    } else {
        flag = 1;
    }
    socket.on('query', function(data) {
        for (item of data.device) {
            total++;
            queue.push({word: data.word, device: item, pages: data.pages, socket: socket}, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
});

console.log('app started at port 8080...');