## epidocker
Docker CLI wrapper for Epitech

## Install

Install the latest version of NodeJs (https://nodejs.org/en/download/package-manager/)<br>
Then you'll be able to `sudo npm install -g epidocker`<br>

## Update

To update your epidocker, just run `sudo npm update -g epidocker`

## Usage

See `epidocker -h`

The main command is `epidocker run`, it brings you to a Docker container with the content of you current directory in _/home/student/local_repository_.<br><br>

For example, running `epidocker run` in _/home/epitech/my_project_  will create a container with your project in _/home/student/my_project_.<br><br>

#### And you just wrote two words.<br><br>

You can get the list of all the containers you created with `epidocker list`.<br><br>

You can delete a container with `epidocker delete [container name]` and you can go back in a created container by typing `epidocker run [container name]`.<br><br>

