var args 		= require('args');
var docker 		= require('./docker');
var project 	= require('./project');
var opts 		= require('./options');
var update 		= require('./update');

manage = {
	flags : {},
	init : function() {
		args
			.command('run'		, 'Access a container'											, manage.execArg	, ['r'])
			.command('update'	, 'Update epidocker'											, manage.execArg	, ['u'])
			.command('list'		, 'Display containers list'										, manage.execArg	, ['l'])
			.command('delete'	, 'Delete a container'											, manage.execArg	, ['d'])
			.option('image'		, 'Docker image to take'										, opts.image)
			.option('graphic'	, 'Graphic mode'												, opts.graphic)
			.option('remote'	, 'Remote directory to put the project in'						, opts.remote)
			.option('save'		, 'Don\'t remove the container when exitted'					, opts.save)
		manage.flags = args.parse(process.argv);
	},
	execArg : function(name, sub, options) {
		//project.initFromFileConf();
		opts.image = options.image;
		opts.remote = options.remote;
		opts.save = options.save;
		opts.graphic = options.graphic;
		manage[name[0]](sub, options);
	},
	update : function() {
		update.updateEpidockerImage()
			.then(update.updateEpidocker);
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
	}
}

module.exports = manage;