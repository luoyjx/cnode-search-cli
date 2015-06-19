'use strict';

var readline = require('readline');
var openurl = require("openurl");
var request = require("request");
var cheerio = require('cheerio');
var Spinner = require('cli-spinner').Spinner;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var options = {
  url: '',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
  }
};

var getDocumentUrl = function(keyword, cb) {
  var searchPrefix = 'https://www.baidu.com/s?wd=site%3Acnodejs.org%20';
  options.url = searchPrefix + encodeURI(keyword);

  request(options, function(err, res, body) {
    if (err) return cb(err);

    if (body == '') {
      return cb('Can not search keyword from cnode: ' + keyword);
    }

    var resultList = [];

    var $ = cheerio.load(body, {normalizeWhitespace: true});
    var $titleArr = $('.result > h3.t > a');
    console.log('\n');
    $titleArr.each(function(i, item){
      var title = $(item).text();
      var link = item.attribs.href;
      console.log(['  ', (i + 1), '  ', title].join(''));
      resultList.push({title: title, link: link});
    });

    cb(null, resultList);
  });
};

var getTargetUrl = function (options) {
  request(options, function (err, res, body) {
    var target = 'http://' + res.request.host + res.request.path;
    console.log(target);
    openurl.open(target);
  });
};

module.exports = function(keyword) {
  var spinner = new Spinner('%s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  getDocumentUrl(keyword, function(err, pages) {
    spinner.stop('clean');

    if (err) {
      console.log(err);
      process.exit(1);
    }

    rl.question('Which page would you like to open ?  (choose number above)\n', function(pageNo) {
      if (isNaN(pageNo)) {
        console.log('This parameter must be a number.');
        return;
      } else if ( pageNo < 1 || pageNo > (pages.length + 1)) {
        console.log('Page number must between 1 and ' + ( pages.length + 1 ) + '.');
        return;
      }
      console.log('=> ' + pages[pageNo - 1].title);
      options.url = pages[pageNo - 1].link;
      getTargetUrl(options);
      rl.close();
    });
  });
};