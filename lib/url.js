'use strict';

/**
 * 百度搜索url抽象
 * @param keyword 关键词
 * @param domain 域名
 * @constructor
 */
function Baidu(keyword, domain) {
  if (keyword) {
    this.keyword = encodeURI(keyword);
  }

  //搜索前缀
  this.searchPrefix = 'https://www.baidu.com/s?wd=';

  if (domain) {
    //需要限定搜索的域名范围
    this.domain = (typeof domain !== 'undefined' && domain !== '') ? ['site%3A', domain, '%20'].join('') : '';
  }

  //跳过条数，10条为一页
  this.pn = 0;

  this.pageSize = 10;
}

/**
 * 设置关键字
 * @param keyword
 */
Baidu.prototype.setKeyword = function(keyword) {
  if (keyword) {
    this.keyword = encodeURI(keyword);
  }
};

/**
 * 获得当前第几页
 * @returns {number}
 */
Baidu.prototype.currentPage = function() {
  return (this.pn / this.pageSize) + 1;
};

/**
 * 下一页
 * @returns {number}
 */
Baidu.prototype.nextPage = function() {
  return (this.pn / this.pageSize) + 2;
};

/**
 * 上一页
 * @returns {number}
 */
Baidu.prototype.prePage = function() {
  return (this.pn / this.pageSize) > 0 ?
    (this.pn / this.pageSize) + 1:
    1;
};

/**
 * 当前页url
 * @returns {string}
 */
Baidu.prototype.currentPageUrl = function() {
  return [
    this.searchPrefix,
    this.domain,
    this.keyword,
    '&pn=',
    (this.currentPage() - 1) * this.pageSize
  ].join('');
};

/**
 * 下一页地址
 * @returns {string}
 */
Baidu.prototype.nextPageUrl = function() {
  return [
    this.searchPrefix,
    this.domain,
    this.keyword,
    '&pn=',
    this.currentPage() * this.pageSize
  ].join('');
};

/**
 * 上一页地址
 * @returns {string}
 */
Baidu.prototype.prePageUrl = function() {
  return [
    this.searchPrefix,
    this.domain,
    this.keyword,
    '&pn=',
    this.currentPage() === 1 ? 0 : (this.currentPage() - 2) * this.pageSize
  ].join('');
};

exports.Baidu = Baidu;
