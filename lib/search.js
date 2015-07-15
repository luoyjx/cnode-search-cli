'use strict';

var openurl = require("openurl");
var request = require("request");
var cheerio = require('cheerio');
var Spinner = require('cli-spinner').Spinner;
var colors = require('colors/safe');
var Baidu = require('./url').Baidu;
var stdin = process.stdin;
var stdout = process.stdout;

stdin.setEncoding('utf8');
stdin.on('data', handler);

var domain = 'cnodejs.org';
var options = {
  url: '',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
  }
};
var baidu = new Baidu(null, domain);
//存放查询结果列表
var pages = [];


/**
 * 搜索并解析html
 * @param {String} keyword 搜索关键字
 * @param {Function} cb 回调
 */
function getDocumentUrl(keyword, cb) {
  baidu.setKeyword(keyword);
  options.url = baidu.currentPageUrl();

  request(options, function(err, res, body) {
    if (err) return cb(err);

    if (body == '') {
      return cb(colors.red('搜索失败=>: ' + keyword));
    }

    var $ = cheerio.load(body, {normalizeWhitespace: true});
    var $titleArr = $('.result > h3.t > a');
    console.log('\n=> ' + colors.green(keyword) + '\n');
    $titleArr.each(function(i, item){
      var title = $(item).text();
      var link = item.attribs.href;
      var reg = new RegExp(keyword, 'ig');
      console.log(['  ', colors.green((i + 1)), '  ', title.replace(reg, colors.green(keyword))].join(''));
      pages.push({title: title, link: link});
    });

    cb(null);
  });
}

/**
 * 取得最终页面地址并在浏览器中打开
 * 由于百度加入了302跳转，需要拿到最终页面地址
 * @param {Object} options url和userAgent
 */
function getTargetUrl(options) {
  request(options, function (err, res, body) {
    var target = ['http://', res.request.host, res.request.path].join('');
    console.log(target);
    openurl.open(target, function(err) {
      if (err) {
        console.log('there is no browser or platform is not support.');
        process.exit(0);
      }
    });
    ask();
  });
}

/**
 * ask for operation
 */
function ask() {
  console.log('');
  var question = [
    '操作:\n',
    '  1.选择一个序号并打开\n',
    '  2.输入\'q\'退出\n'
  ];
  stdout.write(colors.gray(question.join('')));
  stdin.resume();
}

/**
 * 命令行输入时的handler
 * @param data
 */
function handler(data) {
  if (isNaN(data)) {
    //if input 'q' then exit
    if (data.replace(/^\s+|\s+$/g, '').indexOf('q') === -1) {
      console.log(colors.red('暂时不兹瓷此操作'));
      ask();
    } else {
      process.exit(0);
    }
  } else if ( data < 1 || data > (pages.length + 1)) {
    console.log(colors.red('序号请在1-10中选择'));
  } else {
    stdin.pause();
    console.log('=> ' + pages[data - 1].title);
    options.url = pages[data - 1].link;
    getTargetUrl(options);
  }
}

module.exports = function search(keyword) {
  var spinner = new Spinner('%s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  getDocumentUrl(keyword, function(err) {
    spinner.stop('clean');

    if (err) {
      console.log(err);
      process.exit(1);
    }

    ask();
  });
};