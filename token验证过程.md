### token验证过程  

    用户登录完成后，服务器根据用户名或者用户id（如userId=xiaoming）使用一个密钥加密生成一个token，并将token发送给用户。发送token时可以将token保存在Session中，如果无法保留在服务器端，可以代替保存在Cookie中。用户下一次发送表单或者Ajax请求时，需要在Http头部加上token字段，或者直接通过Cookie发送。服务器端根据userId用相同的密钥再做一次加密，将生成的token与发送过来的token作比较。如果相同则验证成功。