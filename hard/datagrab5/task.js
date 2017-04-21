var page = require('webpage').create();
var system = require('system');
var time = Date.now();
var data = {};
var dataList = [];
if (system.args.length < 4) {
    console.log("请输入关键词和设备名称、要抓取的页数");
    phantom.exit();
}
var keyword = system.args[1].replace('kongge', ' '), // 关键词中的空格经过转换变为kongge 现在转换回来
    deviceName = system.args[2],
    pages = parseInt(system.args[3]),
    url = "https://www.baidu.com/s?wd=" + encodeURI(keyword);
phantom.injectJs("./data.js"); //  引为设备数据文件 

for (var j = 0, jlen = deviceData.length; j < jlen; j++) {
    if (deviceData[j].name == deviceName) {
        page.settings["userAgent"] = deviceData[j].ua;
        var deviceSize = deviceData[j].size.split("x");
        var deviceWidth = deviceSize[0];
        var deviceHeight = deviceSize[1];
        page.viewportSize = {width: deviceWidth, height: deviceHeight};
        break;
    }
}
data.device = deviceName;
data.word = keyword;
page.open(url, function(status) {
    function getDataList() {
        if (deviceName == 'pc') { // PC和手机抓取方法不同
            var arry = page.evaluate(function() { 
                var contents = document.querySelectorAll('.c-container');       // 在控制台看下百度搜索结果相关信息保存在哪些节点 然后在这个函数里作用域是和搜索结果页面相通的
                var infos = document.querySelectorAll('.c-abstract');
                var tempArry = [];
                for (var i = 0, len = contents.length; i < len; i++) {
                    var temp = {};          
                    var a = contents[i].querySelector('h3 a');
                    temp.title = a? a.innerText : '';                             // 如果数据为空则取空字符串
                    temp.link = a? a.href : '';
                    temp.info = infos[i]? infos[i].innerText : '';
                    var img = contents[i].querySelector("img");
                    temp.pic = img? img.src : '';
                    tempArry.push(temp);
                }  
                return tempArry;                                                   // 返回所有数据
            });
        } else {
            var arry = page.evaluate(function() { 
                var contents = document.querySelectorAll('.c-result');      // 在控制台看下百度搜索结果相关信息保存在哪些节点 然后在这个函数里作用域是和搜索结果页面相通的
                var tempArry = [];
                for (var i = 0, len = contents.length; i < len; i++) {
                    var temp = {};          
                    var h3 = contents[i].querySelector('a h3');
                    temp.title = h3? h3.innerText : '';
                    temp.link = contents[i].querySelector('a').href;
                    var p = contents[i].querySelector('p');
                    temp.info = p? p.innerText : '';
                    var img = contents[i].querySelector('img') || '';
                    temp.pic = img? img.src : '';
                    tempArry.push(temp);
                }
                return tempArry;                                                   // 返回所有数据
            });
        }
        dataList = dataList.concat(arry);
    }

    function loopTask() { // 判断要抓取的页数
        getDataList();
        pages--;
        if (pages == 0) { // 如果抓取完 返回数据
            data.code = 1;
            data.msg = '抓取成功';
            data.time = Date.now() - time;  
            data.dataList = dataList;
            data = JSON.stringify(data, undefined, 4);   // 缩进4个空格
            console.log(data);                          // 在命令行输出数据
            phantom.exit();  
        } else { // 未抓取完 点击下一页 页面发生变化触发onUrlChanged事件
            if (deviceName == 'pc') {
                page.evaluate(function () { // pc及手机端点击下一页方法
                    $('#page').find('.n').click();
                });
            } else {
                page.evaluate(function () {
                    if ($('#page-controller .new-nextpage').length) {
                        $('#page-controller .new-nextpage').click();
                    } else {
                        $('#page-controller a').click();
                    }
                });
            }
        }
    }

    if (status != 'success') {                                  
        data.code = 0;
        data.msg = '抓取失败';
        data.time = Date.now() - time;
        console.log(JSON.stringify(data));
        phantom.exit();
    } 
    var timer;
    var ms = deviceName == 'pc'? 600 : 2000;
    page.onUrlChanged = function() {
        timer = setTimeout(function() {
            loopTask();
        }, ms);
    }
    loopTask();
});