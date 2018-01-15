const { exec } = require('child_process');
const { spawn } = require('child_process');
const tty = require('tty');
var project = require('./project');
var opts = require('./options');

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
		let defaultCmd = 'bash';
		let runContainer = `sudo docker run -it -l epidocker_flag=true -l epidocker_image=${opts.image} -v ${project.directory}:${opts.remote}/${project.name} --name=${project.name} ${opts.image} ${defaultCmd}`;
		let attachContainer = 'sudo docker attach ' + project.name;
		let processOpts = {
			stdio: 'inherit',
			shell: true
		};

		docker.getContainerInfo(project.name, (infos) => {
			if (infos)
				infos = infos[0];
			if (!infos || infos.State.Status === undefined) {
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
		let regex = new RegExp(`.*?/.* (.*?)\n`, 'ig');
		let rgxRes;
		let containers = [];

		exec(cmd, (error, stdin, stderr) => {
			if (error)
				console.log(error);
			else {
				while (rgxRes = regex.exec(stdin))
					containers.push(rgxRes[1]);
			}
			docker.getContainerInfo(containers, (infos) => {
				console.log('List of projects you launched with epidocker:');
				if (infos) {
					for (let i = 0; i < infos.length; i++) {
						let cInfos = infos[i];
						let labels = cInfos.Config.Labels;
						let mounts = cInfos.Mounts;
						let name = cInfos.Name.split('/')[1];
						let epidockerFlag = labels.epidocker_flag
						let epidockerImage = labels.epidocker_image;

						if (mounts.length == 0 || !(epidockerFlag == 'true'))
							continue;
						let linkedDir = cInfos.Mounts[0].Source;

						console.log('');
						console.log('\tNAME\t\t: ' + name);
						console.log('\tLOCAL PATH\t: ' + linkedDir);
						console.log('\tIMAGE\t\t: ' + epidockerImage);
					}
				}
				console.log('\nType "epidocker run [NAME]" to access a container');
				console.log('Type "epidocker delete [NAME]" to delete a container');
			});
		});
	},
	delete : function(containerName, callback = function() {}) {
		let cmd = 'stop ' + containerName;

		console.log('Stopping ' + containerName + '...');
		docker.cmd(cmd, (err, stdin, stderr) => {
			console.log('Deleting ' + containerName + '...');
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