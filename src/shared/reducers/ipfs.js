// modify the state representation of ipfs here

const log = require('electron-log');
const { createReducer } = require('../helpers/index.js');

const initialState = {
	peerId: "",
	dataStorePath: "",
	gatewayAddress: "",
	apiAddress: "",
	logs: [],
	id: "",
	peers: 0,
	isOnline: false,
	status: ""
};

module.exports = createReducer(initialState, {
	"logOutput": function(state, action){
		return Object.assign({}, state, { "logs": [ ...state.logs, action.payload ] });
	},
	"getId": function(state, action){
		return Object.assign({}, state, { "id": action.payload });
	},
	"isOnline": function(state, action){
		return Object.assign({}, state, { "isOnline": action.payload });
	},
	"getPeerId": function(state, action){
		return Object.assign({}, state, { "peerId": action.payload });
	},
	"getIPFSDatastorePath": function(state, action){
		return Object.assign({}, state, { "dataStorePath": action.payload });
	},
	"getIPFSAPIAddress": function(state, action){
		return Object.assign({}, state, { "apiAddress": action.payload });
	},
	"getIPFSGWAddr": function(state, action){
		return Object.assign({}, state, { "gatewayAddress": action.payload });
	},
	"checkStatus": function(state, action){
		return Object.assign({}, state, { "status": action.payload });
	},
	"ipfsSwarmPeers": function(state, action){
		return Object.assign({}, state, { "peers": action.payload });
	},
	"start": function(state, action){
		// status
		// return Object.assign({}, state, { "status": action.payload });
	},
	"stop": function(state, action){
		// status
		// return Object.assign({}, state, { "status": action.payload });
	}
});
