const { exec } 	= require('child_process');
const { spawn } = require('child_process');
const tty 		= require('tty');
const log 		= require('./log');
var rl 			= require('readline');
var project 	= require('./project');
var opts 		= require('./options');

var docker = {
	cmd : function(cmd, callback) {
		let rootCmd = 'sudo docker ';

		log('Executing Docker command : "' + rootCmd + cmd + '"\n');
		exec(rootCmd + cmd, function(error, stdout, stderr) {
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
		let baseCmd = "sudo docker run";
		let save = (opts.save) ? ('') : ('--rm');
		let dockerFlags = "-it --privileged";
		let dockerTags = "-l epidocker_flag=true -l epidocker_image=" + opts.image;
		let volume = `-v ${project.directory}:${remoteDirectory} -v ${opts.epidockerDir}:/home/.epidocker`;
		let name = "--name=" + project.name;
		let env = "-e EPIDOCKER_PROJECT_DIRECTORY=" + remoteDirectory;
		let image = opts.image;
		let hotreloadExec = (project.hotreload) ? ('&& node /home/.epidocker/lib/hotreload/watch.js') : ('');
		let defaultCmd = `sh -c "cd ${remoteDirectory} ${hotreloadExec} && bash"`;

		if (opts.graphic) {
			baseCmd = 'xhost +local:root > /dev/null && ' + baseCmd;
			volume += 	//' -v /dev/input:/dev/input' +
						//' -v /etc/drirc:/etc/drirc' +
						' -v /tmp/.X11-unix:/tmp/.X11-unix';
			env += " --device /dev/dri --device /dev/snd -e DISPLAY";
		}

		let runContainer = baseCmd + " " + env + " " + save + " " + dockerFlags + " " + dockerTags + " " + volume + " " + name + " " + image + " " + defaultCmd;
		let attachContainer = 'sudo docker attach ' + project.name;
		let processOpts = {
			stdio: 'inherit',
			shell: true
		};

		log('Executing Docker command : "' + runContainer + '"\n');

		docker.getContainerInfo(project.name, (infos) => {
			if (infos)
				infos = infos[0];
			if (!infos || infos.State === undefined || infos.State.Status === undefined) {
				const dockerRun = spawn(runContainer, processOpts);

				dockerRun.on('close', (error) => {
					if (opts.save == false)
						docker.delete(project.name, false);
				});
			} else if (infos.State.Status != 'running') {
				docker.start(project.name, (err, stdout, stderr) => {
					const dockerAttach = spawn(attachContainer, processOpts);

					dockerAttach.on('close', (error) => {
						if (opts.save == false)
							docker.delete(project.name, false);
					});
				});
			} else {
				rl = rl.createInterface({
					input: process.stdin,
					output: process.stdout
				});

				rl.question('"' + project.name + '" already exists, do you want to access it ? Y/n : ', (answer) => {
					rl.close();
					if (answer == 'Y' || answer == 'y' || answer == '') {
						const dockerAttach = spawn(attachContainer, processOpts);

						dockerAttach.on('close', (error) => {
							if (opts.save == false)
								docker.delete(project.name, false);
						});
					} else
						console.log('Tips: You can use the --name flag to create another container of the same project');
				});
			}
		});
	},
	list : function() {
		let cmd = 'ps -a';
		let regex = new RegExp(`.*?/.* (.*?)\n`, 'ig');
		let rgxRes;
		let containers = [];

		docker.cmd(cmd, (error, stdin, stderr) => {
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
						console.log('\tNAME       : ' + name);
						console.log('\tLOCAL PATH : ' + linkedDir);
						console.log('\tIMAGE      : ' + epidockerImage);
					}
				}
				console.log('\nType "epidocker run [NAME]" to access a container');
				console.log('Type "epidocker delete [NAME]" to delete a container');
			});
		});
	},
	delete : function(containerName, verbose = true, callback = function() {}) {
		let cmd = 'stop ' + containerName;

		if (verbose.constructor === Function) {
			callback = verbose;
			verbose = true;
		}
		if (verbose)
			console.log('Stopping ' + containerName + '...');
		docker.cmd(cmd, (err, stdin, stderr) => {
			if (verbose)
				console.log('Deleting ' + containerName + '...');
			cmd = 'rm -v ' + containerName;
			docker.cmd(cmd, (error) => {
				if (!error) {
					if (verbose) {
						console.log('Container successfully deleted');
					}
				} else {
					if (verbose) {
						console.log('Cannot delete ' + containerName + ' container. Please be sure that it does exist by typing');
						console.log('epidocker list');
					}
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