const { exec } = require('child_process');
const { spawn } = require('child_process');
const tty = require('tty');
var project = require('./project');
var opts = require('./options');

var docker = {
	image : opts.image,
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
		let cmd = 'inspect ' + containerName;
		let infos;
		docker.cmd(cmd, (error, stdin, stdout) => {

			if (!error) {
				infos = JSON.parse(stdin)[0];
				callback(infos);
			} else
				callback(null);
		});
	},
	run : function() {
		let runContainer = `sudo docker run -it -v ${project.directory}:${opts.remote}/${project.name} --name=${project.name} ${docker.image}`;
		let attachContainer = 'sudo docker attach ' + project.name;
		let processOpts = {
			stdio: 'inherit',
			shell: true
		};

		docker.getContainerInfo(project.name, (infos) => {
			if (!infos || infos.State.Status == undefined) {
				const dockerRun = spawn(runContainer, processOpts);

				dockerRun.on('close', (error) => {
				});
			} else if (infos.State.Status != 'running') {
				docker.start(project.name, (err, stdout, stderr) => {
					const dockerAttach = spawn(attachContainer, processOpts);

					dockerAttach.on('close', (error) => {
					});
				});
			} else {
				const dockerAttach = spawn(attachContainer, processOpts);

				dockerAttach.on('close', (error) => {
				});
			}
		});
	},
	list : function() {
		let cmd = `sudo docker ps -a`;
		let regex = new RegExp(`${docker.image}.* (.*?)\n`, 'ig');
		let rgxRes;
		let containers = [];

		exec(cmd, (error, stdin, stderr) => {
			if (error)
				console.log(error);
			else {
				while (rgxRes = regex.exec(stdin))
					containers.push(rgxRes[1]);
			}
			if (containers.length == 0) {
				console.log('You do not have any Epitech container project');
				console.log('You can type epidocker -h to have some help');
			}
			else {
				console.log('You have ' + containers.length + ' container(s):\n');
				for (let i = 0; i < containers.length; i++) {
					let infosTxt = '';
					let containerName = containers[i];

					console.log('\t' + containerName + '\n');
				}
				console.log('Type "epidocker run [container name]" to access a container');
			}
		});
	},
	delete : function(containerName, callback = function() {}) {
		let cmd = 'stop ' + containerName;

		docker.cmd(cmd, (err, stdin, stderr) => {
			cmd = 'rm -v ' + containerName;
			docker.cmd(cmd, (error) => {
				if (!error) {
					console.log('Container successfully deleted');
				} else {
					console.log('Cannot delete ' + containerName + ' container. Please be sure that it does exist by typing');
					console.log('epidocker list');
				}
				callback(err, stdin, stderr);
			});
		});
	},
	start : function(containerName, callback = function() {}) {
		let cmd = 'start ' + containerName;

		docker.cmd(cmd, (err, stdin, stderr) => {
			if (err)
				console.log('Cannot start ' + containerName + ' container. Does it exist ?');
			else {
				console.log('Container started');
			}
			callback(err, stdin, stderr);
		});
	}
}

module.exports = docker;