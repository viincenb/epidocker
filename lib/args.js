const { exec } 	= require('child_process');
var args 		= require('args');
var docker 		= require('./docker');
var project 	= require('./project');
var opts 		= require('./options');

manage = {
	flags : {},
	init : function() {
		args
			.command('run'		, 'Access a container after create it if needed'	, manage.execArg	, ['r'])
			.command('list'		, 'Display containers list'							, manage.execArg	, ['l'])
			.command('delete'	, 'Delete a container'								, manage.execArg	, ['d'])
			.command('update'	, 'Update epidocker'								, manage.execArg	, ['u'])
			.option('image'		, 'Docker image to take'							, opts.image)
			.option('remote'	, 'Remote directory to put the project in'			, opts.remote)
		manage.flags = args.parse(process.argv);
	},
	execArg : function(name, sub, options) {
		opts.image = options.image;
		opts.remote = options.remote;
		manage[name[0]](sub, options);
	},
	update : function() {
		console.log('Checking for updates...');
		exec('npm outdated epidocker -g', (err, stdin, stdout) => {
			let regex = /epidocker.*?((?:[0-9].){3})\s*(\S*)\s*(\S*)/;
			let rawInfos = regex.exec(stdin);
			let infos = {};

			infos.version = rawInfos[1];
			infos.wanted = rawInfos[2];
			console.log('\nYour version\t: ' + infos.version);
			console.log('Latest version\t: ' + infos.wanted + '\n');
			if (infos.wanted != 'linked' && infos.wanted != infos.version) {
				console.log('Updating epidocker...');
				exec('sudo npm update epidocker -g', (err, stdin, stdout) => {
					if (err)
						console.log(err);
					else
						console.log('Successfully updated !');
				});
			} else {
				console.log('You\'re already up to date !');
			}
		});
	},
	run : function(sub, options) {
		let containerName = sub[0];

		if (!containerName)
			project.init();
		else
			project.name = containerName;
		docker.check((error) => {
			if (!error)
				docker.run();
		});
	},
	list : function(sub, options) {
		docker.list();
	},
	delete : function(sub, options) {
		docker.delete(sub);
	},
	start : function(sub, options) {
		docker.start(sub);
	}
}

module.exports = manage;