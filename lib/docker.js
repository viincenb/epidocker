const { exec } = require('child_process');
const tty = require('tty');
var project = require('./project');
var opts = require('./options');

var docker = {
	container : opts.image,
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
			}
		});
	},
	run : function() {
		let cmd = `sudo docker run -idt -v ${project.directory}:/home/student/project --name=${project.name} ${docker.container}`;

		exec(cmd, (error, stdin, stderr) => {
			if (error)
				console.log(error);
			else {
				console.log('Container is running, type this to get in:');
				console.log('sudo docker attach ' + project.name);
			}
		});
	},
	list : function() {
		let cmd = `sudo docker ps -a`;
		let regex = new RegExp(`${docker.container}.* (.*?)\n`, 'ig');
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
				console.log('You have ' + containers.length + ' Epitech project containers:\n');
				for (let i = 0; i < containers.length; i++) {
					let infosTxt = '';
					let containerName = containers[i];
					
					docker.getContainerInfo(containerName, (infos) => {
						infosTxt += infos.State.Status + '\t';
						infosTxt += containerName;
						console.log(infosTxt);
					});
				}
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
				console.log('sudo docker attach ' + containerName);
			}
			callback(err, stdin, stderr);
		});
	}
}

module.exports = docker;