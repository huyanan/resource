var Crawler = require("crawler");
var utf8 = require('utf8')
var encoding = require('encoding')
var fs = require('fs')

var host = 'http://www.ygdy8.com'

var c = new Crawler({
    proxy: host,
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            // console.log($("title").text());
            getAllResourceUrl($)
        }
        done();
    }
});

var m = new Crawler({
    proxy: host,
    // forceUTF8:false,
    incomingEncoding: 'gb2312',
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            // console.log($("title").text());
            getMovieData($)
        }
        done();
    }
});

// c.queue('http://www.ygdy8.com/html/gndy/dyzz/list_23_1.html')


// 最新电影页面数量
var totalPage = 161;
// 获取某个页码的完整url
function getUrlFromPage (page) {
    return host + '/html/gndy/dyzz/list_23_' + page + '.html'
}

// 循环爬取所有页面
function crawAllPage(startPage,totalPage) {
    for (var i = 0; i < totalPage; i++) {
        c.queue(getUrlFromPage(i))
    }
}

// 获取页面中所有的电影详情页连接
function getAllResourceUrl ($) {
    $('.ulink').each(function(index, el) {
        var $this = $(this);
        var url = $this.attr('href');
        console.log(url)
        m.queue(host + url)
    });
}

// 获取电影信息
function getMovieData ($) {
    var movieHtml = $('#Zoom').html();
    // console.log('我爱你')
    // console.log(utf8.decode(movieHtml));
    // console.log(encoding.convert(movieHtml, 'gbk'));
    console.log(movieHtml);
    // fs.open('/sss.txt', 'w+', function(err, fd) {
    //    if (err) {
    //        return console.error(err);
    //    }
    //   console.log("文件打开成功！");
    //   fs.writeFile()
    // });
    fs.writeFile('./sss.html', movieHtml, 'utf8', function(err) {
       if (err) {
           return console.error(err);
       }
       console.log("数据写入成功！");
       console.log("--------我是分割线-------------")
       console.log("读取写入的数据！");
       // fs.readFile('./sss.html', function (err, data) {
       //    if (err) {
       //       return console.error(err);
       //    }
       //    console.log("异步读取文件数据: " + data.toString());
       // });
    });

}

function start() {
    crawAllPage(1, totalPage);
}

start();