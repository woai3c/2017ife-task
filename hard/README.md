1 任务目的
了解事件传播机制
任务描述
这是“动态数据绑定”的第三题。在第二题的基础上，我们再多考虑一个问题："深层次数据变化如何逐层往上传播"。举个例子。

let app2 = new Observer({
    name: {
        firstName: 'shaofeng',
        lastName: 'liang'
    },
    age: 25
});

app2.$watch('name', function (newName) {
    console.log('我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。')
});

app2.data.name.firstName = 'hahaha';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
app2.data.name.lastName = 'blablabla';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
观察到了吗？firstName 和 lastName 作为 name 的属性，其中任意一个发生变化，都会得出以下结论："name 发生了变化。"这种机制符合”事件传播“机制，方向是从底层往上逐层传播到顶层。
这现象想必你们也见过，比如：“点击某一个DOM元素，相当于也其父元素和其所有祖先元素。”（当然，你可以手动禁止事件传播） 所以，这里的本质是："浏览器内部实现了一个事件传播的机制"，你有信心自己实现一个吗？

任务注意事项
不能使用任何第三方的库
程序执行环境为浏览器
<br><br><br><br><br>
2 任务目的
熟练使用原生 JS对操作 DOM 结构
任务描述
这是“动态数据绑定”的第四题。有了前面的充分准备，相信你能搞定这一题。请实现如下的这样一个 Vue，传入参数是一个 Selector 和一个数据对象，程序需要将 HTML 模板片段渲染成正确的模样。 这就是一次性的静态数据绑定。

let app = new Vue({
  el: '#app',
  data: {
    user: {
      name: 'youngwind',
      age: 25
    }
  }
});
<!-- 页面中原本的 html 模板片段 -->
<div id="app">
    <p>姓名：{{user.name}}</p>
    <p>年龄：{{user.age}}</p>
</div>
<!-- 最终在页面中渲染出来的结果 -->
<div id="app">
    <p>姓名：youngwind</p>
    <p>年龄：25</p>
</div>
PS：此题尚未要求实现动态数据绑定

任务注意事项
不能使用任何第三方的库
程序执行环境为浏览器