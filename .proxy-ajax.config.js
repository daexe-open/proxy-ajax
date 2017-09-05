
var data = require("./data")
module.exports = {
    "port": 8889,
    "httpsPort": 8890,
    "cert": "",
    "key": "",
    "target-page": "http://127.0.0.1:3000/",
    "target-mtop": "https://106.11.52.96/",
    "target-static": "http://127.0.0.1:8000",
    "proxy": [{
        "path": "h5/",
        "routeTo": "target-mtop"
    }, {
        "path": "/h5/mtop.tmall.supermarket.city.timeline.get",
        "data": JSON.stringify(data)
    }]
}