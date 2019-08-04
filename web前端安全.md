# web 前端安全

## XSS 攻击

XSS 攻击通常是指黑客通过“HTML 注入”篡改了页面，插入了恶意的脚本，从而在用户浏览网页时，控制用户浏览器的一种攻击。

### XSS 分类

#### 反射型 XSS

反射型 XSS 又称为非持久型 XSS，只是简单地将用户的输入数据“反射”给浏览器。

- 攻击过程

  诱骗用户点击提交后，客户端会将带有恶意代码的请求发送到服务端，服务器将恶意代码渲染到页面上，发送给客户端。客户端渲染页面时执行其中的恶意代码，xss 攻击成功。

- 特点

  - 即时性，不会存储在服务端。
  - 攻击者需要诱骗用户点击。
  - 需要服务端参与。

- 示例代码

  ```
  //html代码
  <form id="form1" action="http://localhost:3000/user" method="GET">
    <div>
      <span>用户名</span><input type="text" placeholder="用户名" name="user" />
    </div>
  </form>
  ```

  ```
  //在页面中输入<script>alert(/xss/)</script>，则请求的url变为
  http://localhost:3000/user?user=<script>alert(/xss/)</script>
  ```

  ```
  //获取get请求参数中的user字段
  var user=url.query.user;
  //将user字段注入HTML标签给浏览器渲染
  ctx.response.body=
  `
  <h1>你好，${user}</h1>
  `
  ```

#### 存储型 XSS

存储型 XSS 会把用户输入的数据“存储”在服务器端。

- 攻击过程

  攻击者将恶意代码存储在服务端，客户端获取到服务端带有恶意代码的资源时，就会被植入并执行恶意代码。

- 特点

  - 持久性，植入在数据库中。
  - 危害面广，甚至可以让用户机器变成 DDoS 攻击的肉鸡。

- 示例

  黑客写下一篇带有恶意 JavaScript 代码的博客文章，文章发表后，所有访问该文章的用户都会在他们对的浏览器中执行这段恶意的 JavaScript 代码。黑客把恶意脚本保存到服务器端，因而叫做存储型 XSS。

#### DOM Based XSS

通过修改页面的 DOM 节点形成的 XSS。

- 攻击过程

  攻击者中通过 dom 编程改变页面的 dom 节点，并将恶意代码植入这些节点中，可以是已存在节点的属性，内容，事件等，也可以是新增一个节点。不需要发送请求到服务端，通过浏览器渲染节点直接执行恶意代码。

- 特点

  - 效果上属于反射型 XSS。
  - 不需要服务器解析响应的直接参与
  - 依靠浏览器端的 DOM 解析

- 示例代码

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

XSS 攻击成功后，攻击者对用户当前页面植入恶意脚本。用以完成各种功能的恶意脚本，成为 XSS Payload，以下是几种常见的恶意脚本功能：

- Cookie 劫持
- 构造 GET 和 POST 请求
- XSS 钓鱼
- 识别用户浏览器
- 识别用户安装的软件
- 获取用户的真实 IP 地址

### XSS 防御

- HttpOnly

  在服务端给浏览器设置 cookie，如果 cookie 中存在关键信息，应该给 cookie 设置 httpOnly 属性，使攻击者无法通过 JavaScript 获取 cookie 信息,如以下代码：

  ```
  ctx.set('Set-Cookie',cookie.serialize('name',String(user),{ httpOnly:true, maxAge:60*60*24*7 }))
  ```

- 输入检查

  - 检查方式

    - 格式检查

      如用户名只能是数字、字母的组合，手机，身份证等输入格式进行规范，可以让一些基于特殊字符的 XSS 攻击生效。

    - 特殊字符检查

      一般是检查用户输入的数据中是否包含一些特殊字符。如<，>，'，"等。如果存在，则将这些字符进行过滤或者编码。

  - 注意事项

    输入检查逻辑必须放在服务端实现，客户端的输入检查可以阻挡大部分用户的误操作，节约服务器资源，但是很容易被攻击者绕过。

  - 缺陷

    - 在输入的地方对数据做了统一的改变，输出在 html 和 JavaScript 可能会存在差异。

    - 可能会改变用户的语义，如 1+1<3。

    - 输入检查时没有结合渲染页面的 html 代码，对语境的理解并不完整，可能漏报。如 url 一般是合法的用户数据，但是如果这个 url 是恶意脚本所在的 url 地址，就可以实施 xss 攻击了。

- 输出检查

  - 在 HTML 标签或者属性中输出

    - 示例代码

      ```
      <div>$<script>alert(/xss/)</script></div>
      ```

    - 防御方法

      XSS 在这种情况下一般是构造一个 script 标签，或者任何能产生脚本的方式，防御时应该对对变量进行 htmlencode。

  - 在 script 标签或者事件中输出

    - 示例代码
      ```
      <script>var x=$var</script>
      <script>var x="";alert(/xss/);//"</script>
      ```
    - 防御方法

      防御时应该确保变量在引号中，攻击者需要先闭合引号才能实 施 XSS 攻击。同时应该使用 JavaScriptEncode 对变量编码。

  - 在 CSS 中输出

    - 示例代码

      ```
      <style>@import'http://hack.xss.css'</style>
      <div style="background:url(javascript:alert('XSS'))">
      ```

    - 防御方法

      尽可能禁止用户可控制的变量在"style 标签"，“HTML 标签中的 sylte 属性”以及“CSS 文件”中输出。如果有需要，应该对变量进行 cssEncode。

  - 在地址中输出

    - 示例代码

      ```
      <a href="http://www.evil.com/?test=$var">test</a>
      <a href="http://www.evil.com/?test" onclick="(alert(1))">
      ```

    - 防御方法

      如果变量是在 URL 的 path 或者 search 中输出，可以使用 URLEncode 进行编码。如果变量是整个 URL，URL 中的 protocal 和 Host 是不能进行 URLEncode 的，因为其中有//，会改变语义，用户数据也有可能是伪协议。一般来说，是检查变量是否以 http 开头，如果不是则手动添加，以保证不会出现伪协议类的 XSS 攻击

- 防御 DOM Based XSS
  - 示例代码
    ```
    <script>
      var x="$var";
      document.write("<a href='"+x+"'>test</a>");
    </script>
    ```
  - 防御方法  
    如果按照前面的方法对变量进 javascriptEncode，浏览器执行 script 代码时，首先会将\$var 解码，然后再通过 document.write 写入 a 标签属性，造成 XSS 攻击。因而在 document.write 输出到 HTML 标签时，应该再次 encode，如果是输出到 script 标签或者事件，则进行 JavaScriptEncode，如果是 html 标签，则进行 HtmlEncode。

## CSRF 攻击

跨站点请求伪造是指攻击者诱使用户访问恶意脚本所在页面，以用户的身份在该页面执行相关的操作，如向服务器发送请求。

- 特点

  - 获取用户 cookie
  - 伪造 GET 或者 POST 请求

- 防御方法

  - 验证码

    验证码是对抗 CSRF 攻击最简洁有效的防御方法，但是网站不能给所有操作都加上验证码，验证码只能作为辅助手段，而不是最主要的解决方案。

  - Referer Check

    检测用户请求是否来自合法的源，但是该方法的缺陷在于，服务器并非什么是否都能取到 Referer，客户端为了保护用户隐私，有可能会限制 Referer 的发送。可以用 Referer 来监控 CSRF 攻击的发生，但不是主要手段。

  - Token

    CSRF 能攻击成功的主要原因是攻击者可以猜测到请求的重要参数，只有预测出了所有的参数和参数值攻击者才能攻击成功。新增一个 token 参数，这个 token 参数必须由足够安全的随机数生成算法生成。在实际应用中，token 有服务器生成，放在用户的 cookie 或者用户的 session 中。在提交请求时服务器只需验证表单中的 token 与用户 session（或者 cookies）中的 token 是否一致，就可以判断请求是否合法。使用 Token 应该注意以下几点： - 如果用户已经提交了表单，应该重新生成一个新的 token - 可以考虑生成多个 token 以解决多页面共存的场景 - 使用 token 应该注意 token 的保密性，把 token 放在表单的隐藏域中，敏感操作使用 POST 请求，可以避免 token 泄漏。

## 点击劫持

点击劫持是一种视觉上的欺骗手段。攻击者使用一个透明的、不可见的 iframe，覆盖在一个页面上，然后诱使诱使用户在该页面进行操作，此时用户在不知情的情况下点击透明的 iframe 页面，通过调整 iframe 页面的位置，可以诱使用户恰好点击在 iframe 页面上的一些功能性按钮上。

- 防御方法

  - frame busting

    通过 JavaScript 代码，禁止 iframe 的嵌套
    缺陷是 iframe 中的 sandbox 属性，security 属性，都可以限制 iframe 页面中 JavaScript 脚本的执行。

  - X-Frame-Options

    使用 HTTP 头部字段 X-Frame-Options 字段设置值为 DENY 可以拒绝当前页面加载任何 frame 页面，设置 SAMEORIGIN 可以加载同源的 frame 页面，设置 ALLOW-FROM 可以定义允许 frame 加载的地址。
