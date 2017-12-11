// modify the state representation of ipfs here


const initialState = {
	// what is the initail state here?
	// what do i want to share?
	peerId: "",
	dataStorePath: "",
	gatewayAddress: "",
	apiAddress: "",
	log: [],
	id: ""

};


module.exports = function ipfs(state, action){
	state = state || initialState;

	return state;
};