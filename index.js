var docker 	= require('./lib/docker');
var project = require('./lib/project');
var args 	= require('./lib/args');
var opts 	= require('./lib/options');

opts.epidockerDir = __dirname;
args.init();
