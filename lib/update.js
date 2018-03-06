const { exec } 	= require('child_process');
var options		= require('./options');
var args 		= require('./args');

var update = {
	updateEpidockerImage() {
		return new Promise((resolve, reject) => {
			console.log('Updating epidocker Docker image...');
			exec('sudo docker pull ' + options.image, (err, stdin, stdout) => {
				console.log(stdin);
				return resolve();
			});
		})
	},
	updateEpidocker() {
		console.log('Checking for epidocker updates...');
		return new Promise((resolve, reject) => {
			exec('npm outdated epidocker -g', (err, stdin, stdout) => {
				let regex = /epidocker.*?((?:[0-9].){3})\s*(\S*)\s*(\S*)/;
				let rawInfos = regex.exec(stdin);
				let infos = {};

				if (rawInfos && rawInfos[2] !== undefined) {
					infos.version = rawInfos[1];
					infos.wanted = rawInfos[2];
					console.log('\nYour version\t: ' + infos.version);
					console.log('Latest version\t: ' + infos.wanted + '\n');
					if (infos.wanted != 'linked' && infos.wanted != infos.version) {
						console.log('Updating epidocker...');
						exec('sudo npm update epidocker -g', (err, stdin, stdout) => {
							if (err) {
								console.log(err);
								return reject();
							}
							else {
								console.log('Successfully updated !');
								update.updateScript.exec();
								return resolve();
							}
						});
					} else {
						console.log('You\'re already up to date !');
						return resolve();
					}
				} else {
					console.log('Updating epidocker...');
					exec('sudo npm update epidocker -g', (err, stdin, stdout) => {
						if (err) {
							console.log(err);
							return reject();
						}
						else {
							console.log('Successfully updated !');
							update.updateScript.exec();
							return resolve();
						}
					});
				}
			});
		})
	},
	updateScript : {
		exec() {
			console.log('');
			update.updateEpidockerImage();
		}
	}
}

module.exports = update;