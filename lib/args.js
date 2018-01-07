var args = require('args');
var docker = require('./docker');
var project = require('./project');

manage = {
	flags : {},
	init : function() {
		args
			.command('run', 'Create and run a container for the current directory. It needs root privileges.', manage.runCmd, ['r'])
			.command('list', 'Display the list of created Epitech containers', manage.listCmd, ['l'])
			.command('delete', 'Delete an Epitech container', manage.deleteCmd, ['d'])
			.command('start', 'Start an Epitech container', manage.startCmd, ['s'])
		manage.flags = args.parse(process.argv);
	},
	runCmd : function(name, sub, options) {
		project.init();
		docker.check((error) => {
			if (!error)
				docker.run();
		});
	},
	listCmd : function(name, sub, options) {
		docker.list();
	},
	deleteCmd : function(name, sub, options) {
		docker.delete(sub);
	},
	startCmd : function(name, sub, options) {
		docker.start(sub);
	}
}

module.exports = manage;