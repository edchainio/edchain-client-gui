# Desktop client for edChain

This is a client that will work for macOS, Linux, and Windows, but the nodes only work with macOS and Linux.

Note: Version 6x, or higher, of NodeJS is required.

## Getting Started

Enter the following commands to get edChain up-and-running:

Note: You have have to preface some of these commands with `sudo` to meet privilege requirements defined by your operating system.

* Clone this repository:
`git clone https://github.com/edchainio/client-gui.git`

* Move into the directory of the project:
`cd client-gui`

* Install the NodeJS requirements:
`npm install`

* Change into the directory that contains edChain's binary files for Linux:
`cd bin/linux`

* Change into the directory that contains edChain's binary files for macOS:
`cd bin/darwin`

* Start the MediaChain's node application:
`./mcnode -d /ip4/104.236.125.197/tcp/9000/p2p/QmRXjzUbsTHYa9t4z47B7tR7zsfAKq3iCkvAdN3NKigWPn`

* Change the status of the node from offline to online:
`curl -X POST http://127.0.0.1:9002/status/online`

* Start the IPFS daemon:
`ipfs daemon`

* Start the edChain client:
`npm start`
