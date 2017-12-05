
const {remote} = require('electron');
const pubsub = remote.require('electron-pubsub');


var checkOnline = function(){ 

	pubsub.publish("ipfs:isOnline").then(function(value){
		// Is non strict comparison the intent here?
		if(value == true){
			$("#ipfs-slider").prop("checked",true);
		}
	
	});
}


$(document).ready(function() {


	checkOnline();
	var $nav = $(".nav");
	$nav.on('click', '#settings',function(event){
	    event.preventDefault();
	    $('#settings-pane').show();
	    $('#logs-pane').hide();
	    $('#logs').removeClass('active');
	    $('#settings').addClass('active');
	    
	});


	 $nav.on('click', '#logs',function(event){
	    event.preventDefault();
	    $('#settings-pane').hide();
	    $('#logs-pane').show();
	    $('#logs').addClass('active');
	    $('#settings').removeClass('active');
	    
	});	


	$("#ipfs-slider").on("click",function(){
		
		if($(this).prop("checked")==true){
			pubsub.publish("ipfs:start");
		}
		else if($(this).prop("checked")==false){
			pubsub.publish("ipfs:stop");
		}
	});

	pubsub.publish("ipfs:getPeerId").then(function(value){

		$("#peerId").text(value);
	
	});
	
	pubsub.publish("ipfs:getIPFSGWAddr").then(function(value){
			
		$("#gateway-addr").val(value);
			
	});


	pubsub.publish("ipfs:getIPFSAPIAddress").then(function(value){
		$("#ipfs-api-addr").val(value);
	});


	pubsub.publish("ipfs:getIPFSDatastorePath").then(function(value){
				
		$("#ipfs-datastore-path").val(value);
		
	});

	pubsub.subscribe('ipfsChildLog', function(event,data){
	    var $outputElement = $('#console');
	    var output = "<p><code>" + data.join("</code></p><p><code>") + "</code></p>";
	    $outputElement.html(output);
	});
});

