var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var cmdStr = 'phantomjs task.js ';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'连接错误:'));
db.once('open',function(){
    console.log("数据库已连接");
});

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
var ResultModel = mongoose.model('result', ResultSchema);
http.createServer(function(request, response) {  
    if(request.url !== '/favicon.ico') {
        console.log('request received');
        var obj = url.parse(request.url, true).query;
        exec(cmdStr + obj.word + ' ' + obj.device, function(err, stdout, stderr) {
            var result = new ResultModel(JSON.parse(stdout));
            response.writeHead(200, {"Content-Type": "application/json"});  
            response.end(); 
            result.save(function(err) {
                err? console.log(err) : console.log("保存成功");
            });
        });
    }   
}).listen(8000);  
console.log('server started');