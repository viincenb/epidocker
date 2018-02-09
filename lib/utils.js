const { execSync } 	= require('child_process');
const path 		= require('path');

module.exports = {
	i965Path() {
		let filepath;

		try {
			filepath = execSync('locate i965_dri.so').toString();
		} catch (e) {
			throw 'Epidocker was looking for Intel driver library (i965_dri.so) but did not find it...\nPlease report this issue to improve epidocker.';
		}

		filepath = filepath.split('\n')[0];
		let directory = path.dirname(filepath).toString();

		return directory;
	}
}