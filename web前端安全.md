# web前端安全
## XSS攻击  
    XSS攻击通常是指黑客通过“HTML注入”篡改了页面，插入了恶意的脚本，从而在用户浏览网页时，控制用户浏览器的一种攻击。
### XSS分类
- 反射型XSS  
反射型XSS又称为非持久型XSS，只是简单地将用户的输入数据“反射”给浏览器。
    - 特点
    1. 即时性，不会存储在服务端。
    2. 攻击者需要诱骗用户点击。
    3. 需要服务端参与
    - 示例  

        服务器代码
        ```
        //获取get请求参数，获取user字段
        var user=url.query.user;
        //将user字段注入HTML标签给浏览器渲染
        ctx.response.body=
        `
            <h1>你好，${user}</h1>
        `
        ```
        请求的url
        ```
        http://localhost:3000/user?user=<script>alert(/xss/)</script>
        ```
        诱骗用户点击提交后，如果不做任务处理，页面就会弹出xss的警告框。
- 存储型XSS  
存储型XSS会把用户输入的数据“存储”在服务器端。
    - 特点  
    1. 持久性，植入在数据库中。 
    2. 危害面广，甚至可以让用户机器变成 DDoS 攻击的肉鸡。
    - 示例  
    黑客写下一篇带有恶意JavaScript代码的博客文章，文章发表后，所有访问该文章的用户都会在他们对的浏览器中执行这段恶意的JavaScript代码。黑客把恶意脚本保存到服务器端，因而叫做存储型XSS。
- DOM Based XSS  
通过修改页面的DOM节点形成的XSS。
    - 特点  
    1. 效果上属于反射型XSS。
    2. 不需要服务器解析响应的直接参与
    3. 依靠浏览器端的DOM解析
    - 示例  

        页面代码
        ```
        <div id="t"></div>
        <input type="text" id="text" value=""/>
        <input type="button" id="s" value="write" onclick="test()"/>
        <script>
            function test(){
                var str=document.getElementById("text")
                document.getElementById("t").innerHTML="<a href='"+str+"'>testLink</a>"
            }
        </script>
        //当输入的数据为 '><img src=# onerror=alert(/xss/) /><'
        //页面就会弹出xss的警告框
        ```
### XSS Payload
XSS攻击成功后，攻击者对用户当前页面植入恶意脚本。用以完成各种功能的恶意脚本，成为XSS Payload，以下是几种常见的恶意脚本功能：
- Cookie劫持
- 构造GET和POST请求
- XSS钓鱼
- 识别用户浏览器
- 识别用户安装的软件
- 获取用户的真实IP地址

### XSS防御  
- HttpOnly  
在服务端给浏览器设置cookie，如果cookie中存在关键信息，应该给cookie设置httpOnly属性，使攻击者无法通过JavaScript获取cookie信息



