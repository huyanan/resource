var Crawler = require("crawler");
var utf8 = require('utf8')
var encoding = require('encoding')
var fs = require('fs')

var c = new Crawler({
    proxy: 'https://item.taobao.com',
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        console.log(res)
        // if(error){
        //     console.log(error);
        // }else{
        //     var $ = res.$;
        //     // $ 默认为 Cheerio 解析器
        //     // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
        //     // console.log(res.body);
        //     // getAllResourceUrl($)
        //     if (res.statusCode == 302) {
        //         console.log(res.headers)
        //         // getUrl()
        //     }
        // }
        done();
    }
});

// function getUrl(url, success) {
//     c.queue
// }

c.queue('https://item.taobao.com/item.htm?spm=a217h.9580640.831241.12.1cff25aas1DxdN&id=551265574932&scm=1007.12144.81309.70000_0&pvid=42c45256-47c6-4250-83d3-bc27128e9c16&utparam=%7B%22x_hestia_source%22%3A%2270000%22%2C%22x_object_id%22%3A551265574932%2C%22x_object_type%22%3A%22item%22%7D')
