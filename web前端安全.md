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
在服务端给浏览器设置cookie，如果cookie中存在关键信息，应该给cookie设置httpOnly属性，使攻击者无法通过JavaScript获取cookie信息,如以下代码：
    ```
    ctx.set('Set-Cookie',cookie.serialize('name',String(user),{
        httpOnly:true,
        maxAge:60*60*24*7
    }))
    ```
- 输入检查
1. 格式检查，如用户名只能是数字、字母的组合，手机，身份证等输入格式进行规范，可以让一些基于特殊字符的XSS攻击生效。
2. 输入检查一般是检查用户输入的数据中是否包含一些特殊字符。如<，>，'，"等。如果存在，则将这些字符进行过滤或者编码。
3. 输入检查逻辑必须放在服务端实现，客户端的输入检查可以阻挡大部分用户的误操作，节约服务器资源，但是很容易被攻击者绕过。
4. 输入检查的缺陷  
    - 在输入的地方对数据做了统一的改变，输入在html和JavaScript可能会存在差异
    - 可能会改变用户的语义，如1+1<3
    - 一般输入检查在提交
    - 输入检查时没有结合渲染页面的html代码，对语境的理解并不完整，可能漏报。如url一般是合法的用户数据，但是如果这个url是恶意脚本所在的url地址，就可以实施xss攻击了。
- 输出检查
1. 在HTML标签或者属性中输出 
    ```
    <div>$var</div>
    ```
    XSS在这种情况下一般是构造一个script标签，或者任何能产生脚本的方式。如：

    ```
    <div><script>alert(/xss/)</script></div>
    ```
    防御方法：对变量进行htmlencode,如：
    ```
    var user=htmlencode.htmlEncode(url.query.user);
    ctx.response.body = `
        <h1>你好，${user}</h1>
    `
    //编码后就不会出现XSS攻击了
    ```
2. 在script标签或者事件中输出，应该确保变量在引号中，攻击者需要先闭合引号才能实    施XSS攻击，如：
    ```
    <script>var x="$var"</script>
    ```
    ```
    <script>var x="";alert(/xss/);//"</script>
    ```
    防御时使用JavaScriptEncode
3. 在CSS中输出  
尽可能禁止用户可控制的变量在"style标签"，“HTML标签中的sylte属性”以及“CSS文件”中输出
4. 在地址中输出
如果变量是在URL的path或者search中输出，可以使用URLEncode进行编码。如果变量是整个URL，URL中的protocal和Host是不能进行URLEncode的，因为其中有//，会改变语义，用户数据也有可能是伪协议。一般来说，是检查变量是否以http开头，如果不是则手动添加，以保证不会出现伪协议类的XSS攻击
- 防御DOM Based XSS
这种XSS攻击方式不同于前面的方式，这种方式XSS代码是通过JavaScript输出到页面里，而前面的方式都是服务端直接输出到HTML页面。如
```
<script>
    var x="$var";
    document.write("<a href='"+x+"'>test</a>");
</script>
```
如果按照前面的方法对变量进行javascriptEncode，浏览器执行script代码时，首先会将$var解码，然后再通过document.write写入a标签属性，造成XSS攻击。
因而在document.write输出到HTML标签时，应该再次encode，如果是输出到script标签或者事件，则进行JavaScriptEncode，如果是html标签，则进行HtmlEncode。
