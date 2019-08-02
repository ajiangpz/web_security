const Koa = require("koa");
const app = new Koa();
const fs = require("fs");
const Url = require("url");
const htmlencode=require("htmlencode");
//解析post请求参数中间件
const koaBody = require("koa-body");
app.use(koaBody());
app.use(async ctx => {
  if (ctx.path === "/") {
    ctx.response.type = "html";
    //主页(表单)
    ctx.response.body = fs.createReadStream("./index.html");
  } else if (ctx.method === "GET" && ctx.path === "/user") {
    var url = Url.parse(ctx.url, true);
    ctx.set("x-xss-protection", 0);
    var user=htmlencode.htmlEncode(url.query.user);
    // var user=url.query.user;
    ctx.response.body = `
            <h1>你好，${user}</h1>
        `;
  } else if (ctx.method === "POST" && ctx.path === "/form") {
    //获取请求体参数
    const body = ctx.request.body;
    //x-xss-protection为响应头中规定浏览器是否渲染检测为xss代码的字段，默认为 1 ，即不渲染
    ctx.set("x-xss-protection", 0);
    //将请求体的用户名作为值渲染到浏览器
    ctx.response.body = `
            <h1>你好，${body.user}</h1>
        `;
  }
});
app.listen(3000, () => {
  console.log("listening 3000");
});
