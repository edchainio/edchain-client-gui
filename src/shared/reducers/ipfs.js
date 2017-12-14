// modify the state representation of ipfs here

const log = require('electron-log');
const { createReducer } = require('../helpers/index.js');

const initialState = {
	// what is the initail state here?
	// what do i want to share?
	peerId: "",//config
	dataStorePath: "",//config
	gatewayAddress: "",//config
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
	"getLog": function(state, action){
		// fall through?
	},
	"start": function(state, action){
		// status
		// return Object.assign({}, state, { "id": action.payload });
	},
	"stop": function(state, action){
		// status
		// return Object.assign({}, state, { "id": action.payload });
	}
});
