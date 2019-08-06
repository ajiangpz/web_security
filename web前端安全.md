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
  - 不需要服务器解析响应的直接参与。
  - 依靠浏览器端的 DOM 解析。

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

- Cookie 劫持。
- 构造 GET 和 POST 请求。
- XSS 钓鱼。
- 识别用户浏览器。
- 识别用户安装的软件。
- 获取用户的真实 IP 地址。

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

- 攻击条件

  - 攻击者了解受害者所在的站点请求的参数。
  - 攻击者的目标站点具有持久化授权cookie或者受害者具有当前会话cookie。
  - 目标站点没有对用户在网站行为的第二授权。

- 攻击过程

  用户在在网站完成登录认证后，服务器会发送给用户一个Cookie管理会话，会话过程中用户请求只需要带上Cookie就可以请求成功，不需要再登录验证。攻击者可以通过在留言板发布一张图片，图片地址为用户提交请求的URL，当用户浏览器加载攻击者发布的图片时，就会发送该请求，由于用户已经认证，所以服务器会认为该请求是合法的，攻击者实现攻击。

  ![Image csrf](https://raw.githubusercontent.com/ajiangpz/web_security/master/img/csrf.png)

- 防御方法

  - 验证码

    验证码是对抗 CSRF 攻击最简洁有效的防御方法，但是网站不能给所有操作都加上验证码，验证码只能作为辅助手段，而不是最主要的解决方案。

  - Referer Check

    检测用户请求是否来自合法的源，但是该方法的缺陷在于，服务器并非什么是否都能取到 Referer，客户端为了保护用户隐私，有可能会限制 Referer 的发送。可以用 Referer 来监控 CSRF 攻击的发生，但不是主要手段。

  - Token

    CSRF 能攻击成功的主要原因是攻击者可以猜测到请求的重要参数，只有预测出了所有的参数和参数值攻击者才能攻击成功。新增一个 token 参数，这个 token 参数必须由足够安全的随机数生成算法生成。在实际应用中，token 由服务器生成，放在用户的 cookie 或者用户的 session 中。在提交请求时服务器只需验证表单中的 token 与用户 session（或者 cookies）中的 token 是否一致，就可以判断请求是否合法。使用 Token 应该注意以下几点：

    - 如果用户已经提交了表单，应该重新生成一个新的 token。
    - 可以考虑生成多个 token 以解决多页面共存的场景。
    - 使用 token 应该注意 token 的保密性，把 token 放在表单的隐藏域中，敏感操作使用 POST 请求，可以避免 token 泄漏。

## 点击劫持

点击劫持是一种视觉上的欺骗手段。

- 攻击过程

  攻击者使用一个透明的、不可见的 iframe，覆盖在一个页面上，然后诱使诱使用户在该页面进行操作，此时用户在不知情的情况下点击透明的 iframe 页面，通过调整 iframe 页面的位置，可以诱使用户恰好点击在 iframe 页面上的一些功能性按钮上。

- 特点

  - 需要诱使用户与页面产生交互行为。
  - 使用隐藏 frame 覆盖原网页。

- 防御方法

  - frame busting

    通过 JavaScript 代码，禁止 iframe 的嵌套
    缺陷是 iframe 中的 sandbox 属性，security 属性，都可以限制 iframe 页面中 JavaScript 脚本的执行。

  - X-Frame-Options

    使用 HTTP 头部字段 X-Frame-Options 字段设置值为 DENY 可以拒绝当前页面加载任何 frame 页面，设置 SAMEORIGIN 可以加载同源的 frame 页面，设置 ALLOW-FROM 可以定义允许 frame 加载的地址。

## HTML5 安全问题

### HTML5 新标签

- 新标签的 XSS

  HTML5 新增了一些标签和属性，这很可能带来新的 XSS 攻击，如 video,autio 等标签。

- iframe 的 sandbox

  iframe 时常会出现挂马，XSS，点击劫持等安全问题，在 HTML5 中增添了 sandbox 属性，使用该属性后，iframe 将被视为一个独立的源，其中的脚本将被禁止执行，表单禁止提交，插件禁止加载，指向其他浏览器的对象也会被禁止。大大地增强了使用 iframe 的安全性。

- a 标签的 noreferer

  通过使用该属性，浏览器在请求该标签指定的地址将不再发送 referer，保护了用户了隐私和敏感信息。

### 其他安全问题

- Cross-Origin-Resourse-Sharing（跨域资源共享）

  通过设置响应 HTTP 头部的 Accese-Control-Allow-Origin，服务器通过识别浏览器自动带上的 Origin Header，可以判断浏览器的请求是否来自合法的源，可以用来防范 CSRF 攻击。

- postMessage（跨窗口传递信息）

  postMessage 不受浏览器同源策略的限制，可以使一个 window（窗口，弹窗，iframe）向其他窗口传递文本信息，使用时应该注意以下两个问题：

  - 在接收窗口验证 URL，以防止来自非法页面的消息。
  - 在接收窗口不应该信息任何接收到的信息，需要对信息做安全检查。

- web Storage

  web Storage 是 HTML5 中新增的相比 cookie 更加方便和强大的本地存储功能。分为 sessionStorage 和 localStorage，就像一个非关系型的数据库。web Storage 可能会带来以下安全问题：

  - 攻击者有可能将恶意代码保存在 web Storage 中，从而实现跨页面攻击。
  - 当 web Storage 中保存敏感信息时，也可能会成为攻击的目标，而 XSS 攻击可以完成这一过程。

## 中间人攻击

中间人攻击是指攻击方同时与服务端和客户端建立起了连接，并让对方认为连接是安全的，但是实际上整个通信过程都被攻击者控制了。攻击者不仅能获得双方的通信信息，还能修改通信信息。

- 攻击过程

  用户 A 先服务器发送报文，报文被中间人 H 截获，H 将报文发送给服务器，服务器返回 H 正常报文，用户 A 的信息因此被 H 窃取或者收到被 H 修改过的报文。

- 防御方法

  Https 使用混合加密技术传输报文，就算报文被中间人截获，中间人也无法对报文解密。同时 https 客户端和服务器都具有数字证书认证，中间人无法伪造证书。

## SQL 注入

XSS 是针对 HTML 的注入攻击，而 SQL 注入则是针对数据库的注入攻击。

- 攻击过程

  攻击者将 SQL 命令插入到 Web 表单或输入域名或页面请求的字符串，导致服务器执行恶意的 SQL 命令。

- 特点

  - 针对数据库的注入攻击。

- 防御方法

  - 使用预编译语句

    在第一次执行 SQL 前数据库会进行分析、编译和优化，同时执行计划同样会被缓存起来，它允许数据库做参数化查询。在使用参数化查询的情况下，数据库不会将参数的内容视为 SQL 执行的一部分，而是作为一个字段的属性值来处理，这样就算参数中包含破环性语句（or ‘1=1’）也不会被执行。

  - 使用存储过程

    使用安全的存储过程的效果预编译语句类似，区别在于需要先将 SQL 语句定义在数据库中，存储过程中也可以存在注入问题，因此应该避免在存储过程中使用动态的 SQL 语句。

  - 检查数据类型

    检查输入数据的数据类型，在很大程度上可以对抗 SQL 注入。或者对输入进行数据格式检查也可以防范 SQL 注入。

  - 使用安全函数

    使用足够安全的编码函数，对用户的输入数据进行编码，可以帮助对抗 SQL 注入。

  - 最小权限原则

    避免 web 应用直接使用 root 这种高权限账户直接连接数据库，web 应用使用的数据库账户，不应该有创建自定义函数、操作本地文件的权限。

## 文件上传问题

文件上传是指用户上传了一个可执行的脚本文件，并通过此脚本文件获得执行服务器端命令的能力。

- 攻击条件

  - 上传的文件能够被 web 容器执行，因而目录需要是 web 容器需要覆盖到的路径。
  - 用户能够从 web 上访问这个文件，如果用户无法访问或者无法使得 web 容器解释这个脚本，那么也不能称之为漏洞。
  - 用户上传的文件内容不能因为压缩，格式化，检查等被改变，否则也有可能攻击不成功。

- 攻击过程

  用户上传 web 脚本文件，服务端的 web 容器解释并执行了上传的脚本，导致代码执行，或者上传木马，病毒诱使用户或者管理员下载。

- 防御方法

  - 文件上传的目录设置为不可执行

    文件上传目录应该是独立的存储，一方面方便缓存加速，降低性能损耗。另一方面也杜绝了脚本执行的可能。

  - 判断文件类型

    使用白名单的方式进行文件类型的检查，对于图片可以进行压缩已破环其中的可能存在的恶意代码。

  - 使用随机数改写文件名和文件路径

    文件上传要执行代码，需要用户能够访问到这个文件。如果使用随机数改写文件名和路径，攻击者在寻找文件上将会增加极大的成本。与此同时，某些文件会因为文件名的改变而无法执行。

  - 单独设置文件服务器的域名

    利用同源策略，可以使得包含 JavaScript 的 xss 利用这种问题得到解决。

## 会话管理漏洞

会话管理是用来管理用户状态的必备功能，但是如果在会话管理上有所疏忽，就会导致用户的认证状态被窃取等后果。

- 会话劫持  

  攻击者通过某种手段拿到了用户的会话ID，并非法使用此会话ID伪装成用户，达到攻击的目的。

  - 攻击过程  

    用户登录完成后，会得到一个已经认证的sid，一般保存在cookie或者url中。攻击者通过xss攻击，网络sniff，以及本地木马读取等手段获取了这个sid，保存在自己的cookie中，这样就能伪装成用户完成登录，从而实现攻击。

  - 防御方法  
    
    - 通过给cookie设置httponly，可以有效地缓解sid被窃取。
    - 尽量不要把sid保存在url中。

- 会话固定攻击  

  会话固定攻击（Session Fixation）攻击会强制用户使用攻击者指定的会话 ID，属于被动攻击。
  
  - 攻击过程

    攻击者访问登录页面，服务器会发给攻击者一个未认证的sid，保存在url中。攻击者将改url作为陷阱，诱导用户去认证。认证后，攻击者再使用该url访问服务器就可以登录成功了。

    ![Image 会话固定攻击](https://raw.githubusercontent.com/ajiangpz/web_security/master/img/fix_session.png)
  
  - 防御方法  
    
    - 在用户登录完成后，重写sid。
    - 尽量不要把sid保存在url中，可以保存在cookie中，这也是互联网的主流。

- Session保持攻击

  在一些系统中，只要用户是活跃的，就不会销毁Session。

  - 攻击过程

    攻击者通过不断的发送请求，与服务器交互，使Session保持活跃。攻击者通过这种方式就可以一直使用用户的账户，持续攻击。

  - 防御方法

    - 在指定时间如（三天）强制销毁Session。
    - 客户端发生变化时，如IP、UserAgent等信息发生变化就可以强制销毁Session。

## web框架安全  

### 模板引擎与XSS攻击

最好的XSS防御方案，是在不同的场景使用不同的编码函数，如果同意使用一种编码如HTML encode，那么很可能被攻击者绕过。而模板引擎默认大多以htmlencode为编码方式，但是我们可以在模板引擎实现自定义的编码函数，应用于不同的场景。

### web框架完整的CSRF防御方案  

防御CSRF攻击，最有效的方式就是用token方式。POST请求本身并不足以对抗CSRF，但是POST请求的使用对于保护
token有积极的意义。而token的私密性是防御CSRF的基础。

1. 在服务器的Session存储或用户浏览器的Cookie（推荐）中绑定token。
2. 在form表单中自动填入token字段，比如增加隐藏域。
3. 在Ajax（POST）请求中自动添加token，需要对Ajax进行封装。
4. 在服务器对比POST提交参数的token与Session中绑定的token是否一致，以验证CSRF攻击。

### HTTP Headers管理

在web框架中，可以对HTTP头进行全局化的处理，因此一些基于HTTP头的安全方案可以很好的实施。

- 利用HTTP头管理跳转的目的地址，避免攻击者实施钓鱼或者诈骗

  - 如果web框架提供统一的跳转函数，可以在函数中实现一个白名单，指定跳转地址只能在白名单中。
  - 控制Http的location字段，限制location的值只能是白名单里面的地址。

- 与安全相关的Header，如X-Frame-Options也可以在web框架中统一配置。

- 对所有的Cookie默认添加HttpOnly，不需要此功能的Cookie则单独在配置文件中列出。当业务复杂时，可以保证不会有业务被遗漏。
