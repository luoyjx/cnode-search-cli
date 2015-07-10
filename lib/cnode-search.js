'use strict';

var openurl = require("openurl");
var request = require("request");
var cheerio = require('cheerio');
var Spinner = require('cli-spinner').Spinner;
var colors = require('colors/safe');
var stdin = process.stdin;
var stdout = process.stdout;

stdin.setEncoding('utf8');
stdin.on('data', handler);

var options = {
  url: '',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
  }
};
//store results form baidu
var pages = [];
//maybe the number of pages to skip in baidu's pagination
//first page is 0,pn of second page is 10
var pn = 0;

/**
 * search and parse the result html
 * @param {String} keyword keyword to search
 * @param {Function} cb callback function
 */
function getDocumentUrl(keyword, cb) {
  var searchPrefix = 'https://www.baidu.com/s?wd=site%3Acnodejs.org%20';
  options.url = searchPrefix + encodeURI(keyword) + '&pn=' + pn;

  request(options, function(err, res, body) {
    if (err) return cb(err);

    if (body == '') {
      return cb(colors.red('Can not search keyword from cnode: ' + keyword));
    }

    var $ = cheerio.load(body, {normalizeWhitespace: true});
    var $titleArr = $('.result > h3.t > a');
    console.log(colors.cyan('\nResults of search by: ') + colors.green(keyword) + '\n');
    $titleArr.each(function(i, item){
      var title = $(item).text();
      var link = item.attribs.href;
      console.log(['  ', colors.cyan((i + 1)), '  ', title].join(''));
      pages.push({title: title, link: link});
    });

    cb(null);
  });
}

/**
 * get target page link and open it on browser
 * @param {Object} options url and Agent
 */
function getTargetUrl(options) {
  request(options, function (err, res, body) {
    var target = 'http://' + res.request.host + res.request.path;
    console.log(target);
    openurl.open(target);
    ask();
  });
}

/**
 * ask for operation
 */
function ask() {
  console.log('');
  var question = [
    'Operation:\n',
    '  1.Choice a number of page to open\n',
    '  2.\'q\' to quit.\n'
  ];
  stdout.write(colors.yellow(question.join('')));
  stdin.resume();
}

/**
 * operation handler
 * @param data
 */
function handler(data) {
  if (isNaN(data)) {
    //if input 'q' then exit
    if (data.replace(/^\s+|\s+$/g, '').indexOf('q') === -1) {
      console.log(colors.red('This operation is not support.'));
      ask();
    } else {
      process.exit(0);
    }
  } else if ( data < 1 || data > (pages.length + 1)) {
    console.log(colors.red('Page number must between 1 and ' + ( pages.length + 1 ) + '.'));
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