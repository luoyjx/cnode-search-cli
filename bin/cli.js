#!/usr/bin/env node

'use strict';

var program = require('commander');
var search = require('../lib/search.js');
var appInfo = require('./../package.json');

program
  .version(appInfo.version)
  .usage(' <keyword>')
  .parse(process.argv);

if (program.args.length != 1) {
  program.help();
}
search(program.args[0]);
