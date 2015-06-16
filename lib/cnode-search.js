'use strict';

var openurl = require("openurl");
var request = require("request");
var cheerio = require('cheerio');
var Spinner = require('cli-spinner').Spinner;

var getDocumentUrl = function(keyword, cb) {
  var searchPrefix = 'https://www.baidu.com/s?wd=site%3Acnodejs.org%20';
  var searchUrl = searchPrefix + encodeURI(keyword);
  console.log('searching ...');
  request(searchUrl, function(err, res, body) {
    if (err) return cb(err);

    if (body == '') {
      return cb('Can not search keyword from cnode: ' + keyword);
    }

    var resultList = [];
    console.log(body);

    console.log('parsing...');
    var $ = cheerio.load(body, {normalizeWhitespace: true});
    var $titleArr = $('.result > h3.t > a').text();
    console.log($titleArr);


    cb(null, resultList);
  });
};

module.exports = function(keyword) {
  var spinner = new Spinner('%s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  getDocumentUrl(keyword, function(err, url) {
    spinner.stop('clean');

    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log('=> ' + url);
    //openurl.open(url);
  });
};