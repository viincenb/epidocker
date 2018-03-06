const 	opts = require('./options')

module.exports = function(text) {
	if (opts.verbose)
		console.log(text);
}