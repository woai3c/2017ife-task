const Koa = require('koa');
const fs = require('fs');
const router = require('koa-router')();
const app = new Koa();
const bodyParser = require('koa-bodyparser');
var exec = require('child_process').exec;
var cmdStr = 'phantomjs task.js ';
var mongoose = require('mongoose');
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

app.use(bodyParser());
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

router.get('/', async(ctx, next) => { // 主页
    ctx.response.body = await render('index.html');
});

router.get('/jquery.js', async(ctx, next) => {
    ctx.response.body = await render(ctx.url);
});

router.post('/', async(ctx, next) => {  // 查询数据
    var obj = ctx.request.body;
    var exp = cmdStr + obj.word + ' ' + obj.device;
    var result = await handleTask(exp);
    new ResultModel(result).save(function(err) { // 数据保存到数据库
        err? console.log(err) : console.log("保存成功");
    });
    ctx.response.body = result;
});
// add router middleware:
app.use(router.routes());

app.listen(8080);
console.log('app started at port 8080...');
  
