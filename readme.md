## lb-connector-alimns

`lb-connector-alimns` is the Loopback connector module which allow to send emails via Mandrill.

## 1. Installation
```sh
npm install lb-connector-alimns --save
```

## 2. Configuration

datasources.json

```js
{
    "alimns": {
        "connector": "lb-connector-alimns",
        "apiUser": "[your api user here]",
        "apiKey": "[your api key here]",
        "apiKeySecret": '[your api key here]'
    }
}
```

model-config.json

```js
{
    "SMS": {
        "dataSource": "alimns",
        "public": false
    }
}
```

Additionaly you can set defaults

```js
{
    "alimns": {
        "connector": "lb-connector-alimns",
        "apiUser": "[your api user here]",
        "apiKey": "[your api key here]",
        "apiKeySecret": '[your api key here]'
    }
}
```

Configuration in JavaScript

```js
var DataSource = require('loopback-datasource-juggler').DataSource;
var dsalimns = new DataSource('lb-connector-alimns', {
     "apiUser": "[your api user here]",
     "apiKey": "[your api key here]",
     "apiKeySecret": '[your api key here]'
});
loopback.SMS.attachTo(dsalimns);
```

## 3. Use


```js
loopback.SMS.send({
    from: "[your signature]",
    to: {"mobilePhone": {"template variable": "value"}},
    subject: "[your topic]",
    template: "[your sms template]"
},
function(err, result) {
    if(err) {
        console.log('Upppss something crash');
        return;
    }
    console.log(result);
});
```

## 4. notes
使用阿里的mns发送短信时，遇到过以下坑：
1. 无官方nodejs sdk，第三方ali-nms匹配有阻抗，按官网说明[https://help.aliyun.com/document_detail/27497.html?spm=5176.product27412.6.733.Frl2zn]，整个发送出去的XML都应是utf-8格式编码，ali-mns 也是如此对xml进行编码的。 
但是DirectSMS中签名使用的unicode 16编码，结果导致调用接口成功，而手机收不到短信。这好像是个Bug，不知道什么时候能改好。
目前只能自己把签名改成unicode编码。

2.  不同端点发送效果有差别，在测试的过程中，使用华东2区（上海）端点发送，手机收不到短信，而使用华东1区（杭州）端点发送，就能收到短信。
因此，这里干脆把端点固定在杭州，请注意！！！

3. 发送短信时，选择类型 multiContent 比 类型 singleContent发送效果要好，不知何故！ 因此，这里也一律选择 multiContent 方式发送。

