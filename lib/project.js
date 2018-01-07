var project = {
	directory : '',
	name : 'epitech_project',
	init : () => {
		project.directory = process.cwd();
		project.name = project.directory.split('/').reverse()[0];
	}
}

module.exports = project;