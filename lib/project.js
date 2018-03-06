var fs 		= require('fs');
var opts 	= require('./options');

var project = {
	directory : '',
	name : null,
	hotreload : false,
	init : () => {
		project.directory = process.cwd();
		project.name = project.directory.split('/').reverse()[0];
		if (opts.containerName != 'auto')
			project.name = opts.containerName;

		try {
			let epidockerFilePath = project.directory + "/.epidocker";
			let epidockerFile = fs.readFileSync(epidockerFilePath);
			epidockerFile = JSON.parse(epidockerFile);
			if (epidockerFile.hotreload && epidockerFile.hotreload.active !== undefined) {
				project.hotreload = epidockerFile.hotreload.active;

				if (project.hotreload) {
					let hotreload = epidockerFile.hotreload;

					if (hotreload.command === undefined ||
						hotreload.watch === undefined ||
						hotreload.watch.constructor !== Array ||
						hotreload.watch.length === 0) {
						console.log('Cannot configure hotreloading properly. Please check how to do it well.');
						throw 'hotreloading configure error';
					}
				}
			}
		} catch (error) {
			project.hotreload = false;
		}
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