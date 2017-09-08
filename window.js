var node = {
	up: false,
	status: 'timed out',
	peerID: null,
	publisherID: null,
	info: '',
}

var setStatus = function($element){
	setInterval(function($element){
		$.ajax({
			url: 'http://127.0.0.1:9002/status',
			method: 'GET',
			complete: function(res, status){
				console.log(arguments);
				data = (res.responseText || status).trim();
				$element.removeClass('alert-success alert-info alert-danger');

				if(data === 'public'){
					node.up = true;
					$element.addClass('alert alert-success');
				}else if(data === 'online'){
					node.up = true;
					$element.addClass('alert-info');
				}else if(data === 'offline'){
					node.up = true;
					$element.addClass('alert-danger');
				}else{
					node.up = false;
					$element.addClass('alert-danger');
				}

				$element.text(data);
			}
		});
	}, 1000, $element);
};

var getID = function($element){
	if(node.up && !node.peerID){
		return $.ajax({
			url: 'http://127.0.0.1:9002/id',
			method: 'GET',
			success: function(data) {
				data = JSON.parse(data);
				node.peerID = data.peer;
				node.publisherID = data.publisher;
				node.info = data.info

				$element.find('#peerID').text(node.peerID);
				$element.find('#publisherID').text(node.publisherID);
				$element.find('#info').text(node.info);
			}
		});
	}
	setTimeout(getID, 1001, $element);
};

$(document).ready(function() {
	setStatus($('#nodeStatus'));
	getID($('#IDs'));
});
