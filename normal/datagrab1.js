phantom.outputEncoding="gb2312";            // 输出时中文不会乱码
var page = require("webpage").create(),
    fs = require("fs"),     
    system = require("system"),
    keyword = system.args[1],
    time = Date.now(),
    url = "https://www.baidu.com/s?wd=" + keyword,
    data = {};
page.open(url, function(status){
    if (status != "success") {                                  // 判断status 失败
        data.code = 0;
        data.msg = "抓取失败";
        data.word = keyword;
        data.time = Date.now() - time;
        console.log(JSON.stringify(data));
        phantom.exit();
    } else {                                                    // 判断status 成功
        var arry = page.evaluate(function(){ 
            var contents = document.querySelectorAll(".c-container");       // 在控制台看下百度搜索结果相关信息保存在哪些节点 然后在这个函数里作用域是和搜索结果页面相通的
            var infos = document.querySelectorAll(".c-abstract");
            var tempArry = [];
            for (var i = 0, len = contents.length; i < len; i++) {
                var temp = {};          
                var a = contents[i].querySelector("h3 a");
                temp.title = a.innerText? a.innerText : "";                             // 如果数据为空则取空字符串
                temp.link = a.href? a.href : "";
                temp.info = infos[i]? infos[i].innerText : "";
                var img = contents[i].querySelector("img");
                temp.pic = img? img.src : "";
                tempArry.push(temp);
            }  
            return tempArry;                                                   // 返回所有数据
        });
        data.code = 1;
        data.msg = "抓取成功";
        data.word = keyword;
        data.time = Date.now() - time;  
        data.dataList = arry;
        data = JSON.stringify(data, undefined, 4)   // 缩进4个空格
        fs.write("data.txt", data, "w");            // 将数据保存在一个TXT文件里
        console.log(data);                          // 在命令行输出数据
        phantom.exit();
    }    
});