var fs = require('fs');

var project = {
	directory : '',
	name : 'epitech_project',
	init : () => {
		project.directory = process.cwd();
		project.name = project.directory.split('/').reverse()[0];
	},
	initFromFileConf : function(done) {
		let path = '~/.epidocker';

		fs.readFile(path, function(err, data) {
			if (err) {
				fs.writeFile(path)
			}
		});
	}
}

module.exports = project;