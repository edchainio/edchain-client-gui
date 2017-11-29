# Desktop client for edChain

This is a client for edchain based on the electron framework. At present, this works on linux but we are working to make is macos and windows compatible. 

Note: Version 6x, or higher, of NodeJS is required.

## Getting Started For Developers

You need a mac os or linux to get started. If you have neither, please install [Oracle Virtual Box] https://www.virtualbox.org/wiki/Downloads and follow instructions [here](https://www.lifewire.com/run-ubuntu-within-windows-virtualbox-2202098) to install Ubuntu on the virtual box. 

You will also need to install Git. Follow instructions [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to install it. Once complete, please get edchain running on your machine. The instructions are stated below.

NodeJS is also required. Please install node js with instructions [here](https://nodejs.org/en/download/package-manager/)

Enter the following commands to get edChain up-and-running:

Note: You have have to preface some of these commands with `sudo` to meet privilege requirements defined by your operating system.

* Clone this repository:
`git clone https://github.com/edchainio/client-gui.git`

* Move into the directory of the project:
`cd client-gui`

* Install the NodeJS requirements:
`npm install`

## Readings
If you are not familiar with git, please look at this tutorial: https://try.github.io/levels/1/challenges/1

This is the framework that the application is built on. Please read before you start working on the application. 
https://electronjs.org/docs/tutorial/quick-start

The main file in our case is app.js and the main ui file is index.html.

Coding Guidlines:

[General](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines.md)

[Javascript](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/javascript.md)


