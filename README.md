## proxy-ajax
proxy-ajax can proxy the axaj request follow your config rules in you project. it's easy to proxy you project to test your files.

## usage
```
npm install proxy-ajax -g
-------you can specify the config file path and port---
proxy-ajax ./.proxy-ajax.config -p 80

------- you can use the default config path and port---
proxy-ajax
```
the default config path： ./.proxy-ajax.config.js
the default port： 80

config file eample:
```
.proxy-ajax.config.js file:
--------------------------
export default {
    "port": 8889,
    //"httpsPort": 8890, 
    //"cert": "", //https cert
    //"key": "", //https key
    "target-mtop": "https://x.x.x.x/",
    "target-other": "http://baidu.com",
    "proxy": [{
        "host": ["localhost:8889", "api.baidu.com"],
        "rule": [{
            "path": "getBaidu",
            "routeTo": "target-mtop"
        }],
        "otherRouteTo": "target-other"
    }]
}
```
if you don't want write many config file in your project, you can also write your proxyConfig in your other config file, just like this:
```
xxxx.config.js file:
--------------------------
var data = require("./data")
export default {
    .....
    .....
    proxyConfig:{
        
        "port": 8889,
        // "httpsPort": 8890,
        "target-page": "http://127.0.0.1:3000/",
        "target-mtop": "https://x.x.x.x/",
        "target-static": "http://127.0.0.1:8000",
        "proxy": [{
            "path": "/h5/",
            "target": "target-mtop"
        },{
            "path": "/h5/jianribimai",
            "data": "./src/demo/data/new3.js"
        },{
            "path": "/h5/test",
            "data": JSON.stringify(data)
        }]
    }
    ....
}
```

## changelog
### 20170904 release 0.0.8
1. add https support.
2. support proxy http request to data, youcan set the data or just the data path.

### 20170701 release 0.0.7
1. modify the default config file ./.proxy-ajax.config to ./.proxy-ajax.config.js, because js file is easy to extend. but youcan also use your json file by specify the config file:
```
proxy-ajax ./.proxy-ajax.config
```
## LICENCE
MIT