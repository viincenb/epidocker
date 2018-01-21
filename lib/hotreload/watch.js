var chokidar 	= require('chokidar');
var fs 			= require('fs');
var spawn 		= require('child_process').spawn;

var directory = process.env.EPIDOCKER_PROJECT_DIRECTORY;
var epidockerFilePath = directory + "/.epidocker";
var epidockerFile = fs.readFileSync(epidockerFilePath);
epidockerFile = JSON.parse(epidockerFile);

var watcher = chokidar.watch(epidockerFile.hotreload.watch, {
	ignored: /.*?(\.o)/,
	persistent: true
});

watcher.add(epidockerFilePath);

var commandName = epidockerFile.hotreload.command;
var command = epidockerFile.commands[commandName];

let processOpts = {
	stdio: 'inherit',
	shell: true
};

console.log('Epidocker hot reloading waiting for changes...');

watcher
	.on('change', function (path) {
		var file = path.split('/').reverse()[0];

		if (file === '.epidocker') {
			epidockerFile = fs.readFileSync(epidockerFilePath);
			epidockerFile = JSON.parse(epidockerFile);
			commandName = epidockerFile.hotreload.command;
			command = epidockerFile.commands[commandName];
			console.log('INFO: Command set to "' + command + '"');
			return;
		}
		console.log('INFO: ' + file + ' has changed\n');
		console.log(command);

		var exec = spawn(command, processOpts);

		exec.on('SIGINT', function() {
			watcher.close();
		});
		exec.on('close', function(error) {
			console.log(error);
		});
	});