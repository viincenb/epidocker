const { exec } 	= require('child_process');
const { spawn } = require('child_process');
const tty 		= require('tty');
var project 	= require('./project');
var opts 		= require('./options');

var docker = {
	cmd : function(cmd, callback) {
		exec('sudo docker ' + cmd, function(error, stdout, stderr) {
			callback(error, stdout, stderr);
		});
	},
	check : function(callback) {
		exec('docker', (error, stdout, stderr) => {
			if (error) {
				console.log(error);
			}
			callback(error);
		});
	},
	getContainerInfo : function(containerName, callback) {
		if (containerName && containerName.constructor === Array)
			containerName = containerName.join(' ');
		let cmd = 'inspect ' + containerName;
		let infos;
		docker.cmd(cmd, (error, stdin, stdout) => {

			if (!error) {
				infos = JSON.parse(stdin);
				callback(infos);
			} else
				callback(null);
		});
	},
	run : function() {
		let remoteDirectory = opts.remote + '/' + project.name;
		let defaultCmd = `sh -c "cd ${remoteDirectory} && bash"`;
		let runContainer = `sudo docker run --rm -it -l epidocker_flag=true -l epidocker_image=${opts.image} -v ${project.directory}:${remoteDirectory} --name=${project.name} ${opts.image} ${defaultCmd}`;
		let processOpts = {
			stdio: 'inherit',
			shell: true
		};

		const dockerRun = spawn(runContainer, processOpts);

		dockerRun.on('close', (error) => {
		});
	}
}

module.exports = docker;