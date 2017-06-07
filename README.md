## proxy-ajax
proxy-ajax can proxy the axaj request follow your config rules in you project

## usage
```
npm install proxy-ajax -g
-------you can specify the config file path and port---
proxy-ajax ./.proxy-ajax.config -p 80

------- you can use the default config path and port---
proxy-ajax
```
the default config path： ./.proxy-ajax.config
the default port： 80

config file eample:
```
.proxy-ajax.config file:
{
    "port": 80,  //proxy listen port
    "target-dwr": "http://10.165.124.231/", //alias
    "target-ajax": "http://10.165.124.231/", //alias
    "target-other": "http://localhost:8002", //alias
    "proxy": [{ //can define many host and rule
        "host": ["localhost", "icourse163.org", "www.icourse163.org"], 
        "rule": [{
            "path": "/dwr/",
            "routeTo": "target-dwr"
        }, {
            "path": "/web/j",
            "routeTo": "target-ajax"
        }],
        "otherRouteTo": "target-other" //if not match rule
    }]
}
```

## LICENCE
MIT