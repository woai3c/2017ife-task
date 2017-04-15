phantom.outputEncoding="gb2312";            // 输出时中文不会乱码
var page = require("webpage").create(),
    fs = require("fs"),     
    system = require("system"),
    time = Date.now(),
    data = {};
if (system.args.length < 3) {
    console.log("请输入关键词和设备名称");
    phantom.exit();
}
var keyword = system.args[1],
    deviceName = system.args[2],
    url = "https://www.baidu.com/s?wd=" + encodeURIComponent(keyword);
phantom.injectJs("./data.js");  // 直接引入JSON文件提示不能解析 不懂 所以只能引入JS文件了 

for (var j = 0, jlen = deviceData.length; j < jlen; j++) {
    if (deviceData[j].name == deviceName) {
        page.settings["userAgent"] = deviceData[j].ua;
        var  deviceSize = deviceData[j].size.split("x");
        var deviceWidth = deviceSize[0];
        var deviceHeight = deviceSize[1];
        page.viewportSize = {width: deviceWidth, height: deviceHeight};
    }
}
page.open(url, function(status){
    data.device = deviceName;
    data.word = keyword;
    if (status != "success") {                                  
        data.code = 0;
        data.msg = "抓取失败";
        data.time = Date.now() - time;
        console.log(JSON.stringify(data));
        phantom.exit();
    } else {
        var totalHeight = page.evaluate(function(){
            return document.body.clientHeight;
        });
        page.clipRect = {left: 0, top: 0, width: deviceWidth, height: totalHeight};
        var arry = page.evaluate(function(){ 
            var contents = document.querySelectorAll(".c-clk-recommend>div:first-child");      // 在控制台看下百度搜索结果相关信息保存在哪些节点 然后在这个函数里作用域是和搜索结果页面相通的
            var tempArry = [];
            for (var i = 0, len = contents.length; i < len; i++) {
                var temp = {};          
                var h3 = contents[i].querySelector("a h3");
                temp.title = h3? h3.innerText : "";
                temp.link = contents[i].querySelector("a").href;
                var p = contents[i].querySelector("p");
                temp.info = p? p.innerText : "";
                var img = contents[i].querySelector("img") || "";
                temp.pic = img? img.src : "";
                tempArry.push(temp);
            }  
            return tempArry;                                                   // 返回所有数据
        });
        data.code = 1;
        data.msg = "抓取成功";
        data.time = Date.now() - time;  
        data.dataList = arry;
        data = JSON.stringify(data, undefined, 4);   // 缩进4个空格
        fs.write("data.txt", data, "w");            // 将数据保存在一个TXT文件里
        console.log(data);                          // 在命令行输出数据
        phantom.exit();
    }    
});