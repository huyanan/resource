/*
 * @Author: HuYanan
 * @Date: 2023-04-12 16:30:21
 * @LastEditTime: 2023-04-12 17:17:45
 * @LastEditors: HuYanan
 * @Description: 
 * @Version: 0.0.1
 * @FilePath: /resource/src/crawler/360txt/index.js
 * @Contributors: [HuYanan, other]
 */
const Crawler = require('crawler');
const fs = require('fs');

const origin = 'https://www.e360xs.com';


let txt = '';
let isComplete = false;

const c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            // console.log($('title').text());
            const title = $('#read_title').text();
            // 剔除无用的信息
            const formatTitle = title.match(/.*共\d+页\)/g);
            
            const content = $('#read_content').text();
            txt = `${txt} ${formatTitle} ${content}`;

            if (!content) {
              isComplete = true
              fs.writeFile('学习资料.txt', txt, 'utf8', () => {
                console.log('文件写入成功!');
              });
              return;
            }

            let nextPage = $('#read_link > a:nth-child(5)').attr('href');
            if (nextPage) {
              nextPage = `${origin}${nextPage}`;
              c.queue(nextPage);
            }

            console.log(txt);

        }
        done();
    }
});

// c.queue('https://www.e360xs.com/mulu/229/229112-111444181.html');
c.queue('https://www.e360xs.com/mulu/229/229112-108713097.html');