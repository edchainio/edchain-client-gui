// const pubsub = require('electron').remote.require('electron-pubsub');
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');
var ipfs = require('./process_ipfs')();

const httpURL="http://localhost:8080/ipfs/";
const featuredURL="http://139.59.66.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://127.0.0.1:5001/api/v0/object/get?arg="


const { exec } = require('child_process');
const {dialog, pubsub} = require('electron').remote;

var node = {
    up: false,
    status: 'timed out',
    peerID: null,
    publisherID: null,
    info: '',
};



var setStatus = function($element){
    setInterval(function($element){
        $.ajax({
            url: 'http://127.0.0.1:9002/status',
            method: 'GET',
            complete: function(res, status){
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
    console.log("here");
    if(node.up && !node.peerID){
        return $.ajax({
            url: 'http://127.0.0.1:5001/id',
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


var getFeaturedData = function(){
    
    for(var i=0;i<1;i++){
        $.ajax({
            url: featuredURL,
            method: 'GET',
            success: function(edchainData){

                courseLength=edchainData["courses"].length;
                
                for(var n=0;n<courseLength;n++){
                    let url=ipfsGetURL+edchainData["courses"][n].hash+"&encoding=json";
                    
                    let callback = (function(course){
                        return function(imageURL, indexURL){
                            var title = course.title;
                            createHomePageCard(imageURL, title, indexURL);
                        };
                    }(edchainData["courses"][n]));
                    
                    getParentData(url, callback);
          
                }
            }
        });
    }
 
};


var getParentData = function(url, callback){

      $.ajax({
            url:url,
            method:'GET',
            success: function(parentData){
   
                var arr=parentData["Links"];
                let courseContentURL=ipfsGetURL + arr[0].Hash +"&encoding=json";
                getCourseContents(courseContentURL, callback);

            },
            error: function(error){
                log.info(error);
            }
        });
}

var getCourseContents = function(url2, callback){


    $.ajax({
        url:url2,
        method:'GET',
        success: function(data1){
       
           for(var i=0;i<data1["Links"].length;i++){
             
                let arrContents=data1["Links"][i];
                let names=arrContents.Name;
                 
                if(names === 'contents'){
                    let jpgHash;
                    let indxHash;
                    getCourseDetails(data1["Links"][i].Hash,jpgHash,indxHash, callback);

                }
            }   
        }
    });    

}



var getCourseDetails = function(contentsHash,jpgHash,indxHash, callback){

    $.ajax({
         url: ipfsGetURL+contentsHash +"&encoding=json",
         method: 'GET',
         success: function(data){
            
                
                arr1 = data["Links"];
                len = arr1.length;

                for(var i=0;i<len;i++){
                    if(arr1[i].Name.endsWith('jpg')  && !arr1[i].Name.endsWith('th.jpg')){

                        jpgHash=arr1[i].Hash;
                        
                    }
                    else if(arr1[i].Name.endsWith('index.htm')){

                       indxHash =arr1[i].Hash;

                    }
                                               
                }
            
            callback(httpURL + jpgHash, httpURL + indxHash);
              
        }
    });

}

var createHomePageCard = function(image, title, indexURL){
   
     cardHtml="<div class='card'><img src=" + image +">";
     cardHtml= cardHtml + "<p class='card-text'>";
     cardHtml= cardHtml + "<a href=" + indexURL +">"+ title + "</a>";
     cardHtml= cardHtml + "</p></div>";
     $('#rows').append(cardHtml);

}

function clearVersion(){
   $('#version').text("version:" + "");
}

$(document).ready(function() {
  

    getFeaturedData();
    
    $('#start').click(function(){
       console.log(ipfs);
       ipfs.start();
   
    });

    $('#stop').click(function(){
        console.log(ipfs);
       ipfs.stop();
   
    });
    
    $('#version').click(function(){

        ipfs.checkStatus(function(ver){
            $('#version').text("version:" + ver.version);
            setTimeout(clearVersion,2000);
        });

    });


     $('#open').click(function(){
        console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));

    });
});
