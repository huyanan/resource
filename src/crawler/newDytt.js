const request = require('superagent');
require('superagent-charset')(request);
const cheerio = require('cheerio');
const url = require('url');
const async = require('async');
const fs = require('fs');
const colors = require('colors');
const mongoose = require('mongoose');
const Movie = require('../modals/Movie');
mongoose.connect('mongodb://127.0.0.1:27017');

var host = 'http://www.dytt8.net';
// 最新电影页面数量
// var totalPage = 161;
const totalPage = 1;
// 所有电影列表页面
var moviesUrlList = [];
// 限制并发数
var maxRequestLimit = 3;
// 并发连接数的计数器
var concurrencyCount = 0;
// 所有电影页面
var allMovieUrls = [];
// 所有迅雷下载地址
var thunderDownloadUrlList = [];

// 流程控制
var flowMap = {
    '1': 'getAllMovieData',
    '2': 'getMovieData',
    '3': 'saveThunderDownloadUrl'
  }
  // 当前状态
var currentFlow = 1

function getUrl(url, callback) {
  concurrencyCount++;
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
  request
    .get(url)
    .charset('gb2312')
    // .charset('utf8')
    .end((err, res) => {
      concurrencyCount--;
      callback(err, res)
    })
}


// 获取某个页码的完整url
function getUrlFromPage(page) {
  return host + '/html/gndy/dyzz/list_23_' + page + '.html'
}

// 循环爬取所有页面
function crawAllPage(startPage, totalPage) {
  for (var i = 0; i <= totalPage; i++) {
    moviesUrlList.push(getUrlFromPage(i))
  }
}

// 获取页面中所有的电影详情页连接
function getAllResourceUrl($) {
  // console.log($('body').html());
  $('.ulink').each(function(index, el) {
    var $this = $(this);
    var href = $this.attr('href');
    allMovieUrls.push(url.resolve(host, href));
  });
}

// 获取电影信息
function getMovieData($) {
  var $zoom = $('#Zoom');
  var $thunderDownloadLink = $zoom.find('table a');
  var movieHtml = $('#Zoom').html();
  // console.log('我爱你')
  // console.log(utf8.decode(movieHtml));
  // console.log(encoding.convert(movieHtml, 'gbk'));
  var thunderUrl = $thunderDownloadLink.attr('href');
  console.log(thunderUrl);
  var movieData = {
    title: '',
    name: '',
    nameCh: '',
    poster: '',
    year: '',
    country: '',
    categorys: [],
    language: [],
    subtitle: '',
    releaseTime: [],
    imdbScore: 0,
    imdbGradeUserNum: 0,
    doubanScore: 0,
    doubanGradedUserNum: 0,
    fileFormat: '',
    videoTransCode: '',
    audioTransCode: '',
    videoSizeW: '',
    videoSizeH: '',
    fileSize: '',
    lengthOfFilm: '',
    directors: [],
    actors: [],
    intro: '',
    megnet: [],
  };

  var releaseTimeArr = null;

  // 开始解析电影信息
  // var infoArr = movieHtml.split('<br>');
  // console.log('************************电影信息************************************')
  // console.log(infoArr);
  // console.log('************************************************************')

  var infoArr = movieHtml.split('◎');
  console.log('*******************************************************************************************************电影信息*****************'.red);
  console.log('************************************************************************************************************************'.red);
  // console.log(infoArr);
  infoArr.forEach(function(info, iIndex) {
    console.log('-----------------------------------------------------------------------------------------第' + iIndex + '条信息-------------------------------'.green);
    console.log('------------------------------------------------------------------------------------------------------------------------'.green);
    // console.log(info);
    // if (iIndex == 1) {
    //   getResourceTitle(info);
    // }
    var subInfoArr = info.split('<br>');
    subInfoArr.forEach(function(subInfo, siIndex) {
      if (subInfo != '') {
        console.log('######################################################################################分析一些杂乱的数据#############################################'.blue);
        console.log(subInfo);
        if (iIndex == 0) {
          if (siIndex == 1) {
            movieData.title = subInfo;
          }
          if (siIndex == 2) {
            movieData.poster = subInfo;
          }
        }
        if (iIndex == 1) {
          if (siIndex == 0) {
            movieData.nameCh = subInfo.replace('译　　名　', '');
          }
        }
        if (iIndex == 2) {
          if (siIndex == 0) {
            movieData.name = subInfo.replace('片　　名　', '');
          }
        }
        if (iIndex == 3) {
          if (siIndex == 0) {
            movieData.year = subInfo.replace('年　　代　', '');
          }
        }
        if (iIndex == 4) {
          if (siIndex == 0) {
            movieData.country = subInfo.replace('产　　地　', '');
          }
        }
        if (iIndex == 5) {
          if (siIndex == 0) {
            movieData.categorys = subInfo.replace('类　　别　', '').split('/');
          }
        }
        if (iIndex == 6) {
          if (siIndex == 0) {
            movieData.language = subInfo.replace('语　　言　', '');
          }
        }
        if (iIndex == 7) {
          if (siIndex == 0) {
            movieData.subtitle = subInfo.replace('字　　幕　', '');
          }
        }
        if (iIndex == 8) {
          if (siIndex == 0) {
            releaseTimeArr = subInfo.replace('上映日期　', '').split('/');
            releaseTimeArr.forEach(function (releaseTime, rIndex) {
              var subReleaseTimeArr = releaseTime.split('(');
              console.log(subReleaseTimeArr);
              movieData.releaseTime.push({
                date: subReleaseTimeArr[0],
                country: subReleaseTimeArr[1].replace(')', '')
              })
            });
          }
        }
        if (iIndex == 9) {
          if (siIndex == 0) {
            var imdbArr = subInfo.replace('IMDb评分 ', '').split(' ');
            movieData.imdbScore = imdbArr[0].replace('/10', '');
            movieData.imdbGradeUserNum = imdbArr[2];
          }
        }
        if (iIndex == 10) {
          if (siIndex == 0) {
            var doubanArr = subInfo.replace('豆瓣评分　', '').split(' ');
            movieData.doubanScore = doubanArr[0].replace('/10', '');
            movieData.doubanGradeUserNum = doubanArr[2];
          }
        }
        // if (iIndex == 7) {
        //   if (siIndex == 0) {
        //     movieData.language = subInfo.replace('语　　言　', '');,
        //   }
        // }
      }
    });
    // console.log('------------------------------单条信息------------------------------------------------------------------------------------------');
  });
  console.log('-------------------抓取后的电影信息--------------------'.yellow);
  console.log(movieData);
  // console.log(Movie);
  var movie = new Movie(movieData);
  movie.save(function (err) {
    console.log(err);
  })
  // thunderDownloadUrlList.push(thunderUrl);

  // fs.open('/sss.txt', 'w+', function(err, fd) {
  //    if (err) {
  //        return console.error(err);
  //    }
  //   console.log("文件打开成功！");
  //   fs.writeFile()
  // });     //    //    if (err) {
  //    //       return console.error(err);
  //    //    }
  //    //    console.log("异步读取文件数据: " + data.toString());
  //    // });
  // });

}


// 获取资源名
function getResourceName(element) {

}
// 获取电影海报
// 获取电影译名
// 片名
// 年代
// 产地
// 类别
// 语言
// 字幕
// 上映日期
// IMDB评分
// 豆瓣评分
// 文件格式
// 视频尺寸
// 文件大小
// 片长
// 导演
// 主演
// 简介
// 种子
// 迅雷下载地址


// 保存所有迅雷下载地址
function saveThunderDownloadUrl() {
  fs.writeFile('./thunder.json', thunderDownloadUrlList.join('\r\n'), {
    encoding: 'utf8',
    flag: 'w+'
  }, function(err) {
    if (err) {
      console.log(err)
    }
    console.log('电影迅雷下载地址保存完毕！');
  });
}

// 爬取所有电影信息
function getAllMovieData(url) {
  crawAllPage(1, totalPage);
}

// 队列控制并发
var q = async.queue(function(url, callback) {
  console.log('hello ' + url);
  getUrl(url, callback);
}, maxRequestLimit);

// assign a callback
q.drain = function() {
  console.log('all items have been processed');
  console.log(allMovieUrls);
  if (currentFlow == 1 && allMovieUrls.length) {
    getAllMovieDataQueue()
  } else if (currentFlow == 2 && thunderDownloadUrlList.length) {
    saveThunderDownloadUrl()
  }
};

getAllMovieData();
currentFlow = 1;
console.log(moviesUrlList);
// 添加任务,访问所有电影列表页，抓取所有电影落地页的链接
q.push(moviesUrlList, function(err, res) {
  if (err) {
    console.log(err)
  } else {
    console.log('finished processing foo');
    // console.log(res);
    const $ = cheerio.load(res.text);
    getAllResourceUrl($)
  }
})


// 添加任务，访问所有电影落地页，抓取电影详情
function getAllMovieDataQueue() {
  currentFlow = 2;
  q.push(allMovieUrls, function(err, res) {
    if (err) {
      console.log(err)
    } else {
      console.log('finished processing getAllMovieDataQueue');
      // console.log(res.text);
      const $ = cheerio.load(res.text, {
        decodeEntities: false
      });
      // console.log($.html());
      getMovieData($)
    }
  })
}