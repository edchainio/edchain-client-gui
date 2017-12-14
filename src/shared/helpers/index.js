// Examples:
// export function loadComments(postId) {
//   return {
//     types: [
//       'LOAD_COMMENTS_REQUEST',
//       'LOAD_COMMENTS_SUCCESS',
//       'LOAD_COMMENTS_FAILURE'
//     ],
//     shouldCallAPI: state => !state.comments[postId],
//     callAPI: () => fetch(`http://myapi.com/posts/${postId}/comments`),
//     payload: { postId }
//   }
// }
function asyncProgressMiddleware({ dispatch, getState }) {
	return next => action => {
		const {
			types,
			callAPI,
			shouldCallAPI,
			payload
		} = action;

		shouldCallAPI = shouldCallAPI || () => true;
		payload = payload || {};
		
		if (!types) {
			// Normal action: pass it on
			return next(action);
		}

		if (
			!Array.isArray(types) ||
			types.length !== 3 ||
			!types.every(type => typeof type === 'string')
		) {
			throw new Error('Expected an array of three string types.');
		}

		if (typeof callAPI !== 'function') {
			throw new Error('Expected callAPI to be a function.');
		}

		if (!shouldCallAPI(getState())) {
			return;
		}

		const [requestType, successType, failureType] = types;

		dispatch(
			Object.assign({}, payload, {
				type: requestType
			})
		);

		return callAPI().then(
			function(response){
				dispatch(
					Object.assign({}, payload, {
						response,
						type: successType
					})
				)
			},
			function(error){
				dispatch(
					Object.assign({}, payload, {
						error,
						type: failureType
					})
				)
			}
		);
	}
};

// Example:
// export const todos = createReducer([], {
//   [ActionTypes.ADD_TODO](state, action) {
//     let text = action.text.trim()
//     return [...state, text]
//   }
// })

function createReducer(initialState, handlers) {
	return function reducer(state, action) {
		state = state || initialState;
		if (handlers.hasOwnProperty(action.type)) {
			return handlers[action.type](state, action);
		} else {
			return state;
		}
	};
};


module.exports = {
	asyncProgressMiddleware,
	createReducer
};