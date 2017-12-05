// const pubsub = require('electron').remote.require('electron-pubsub');
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');


const httpURL="http://localhost:8080/ipfs/";
const edchainNodeURL="http://139.59.66.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://127.0.0.1:5001/api/v0/object/get?arg="

const { exec } = require('child_process');
const {remote} = require('electron')
const {BrowserWindow} = remote;
const {dialog} = remote.require('electron');
const pubsub = remote.require('electron-pubsub');
const currentWindow = remote.getCurrentWindow();

var ipcRenderer=require('electron').ipcRenderer;

var node = {
    up: false,
    status: 'timed out',
    peerID: null,
    publisherID: null,
    info: '',
};

var createAndShowChildWindow = function(url){
             
    ipcRenderer.send('createAndShowChildWindow',url);
           
};



var openSettings = function(){
  
    let url='file://' + __dirname + '/src/html/settings.html';
    ipcRenderer.send('createChildWindow',url);
           
};

var showSettings = function(event){

    openSettings();
    event.preventDefault();
    ipcRenderer.send('showChildWindow');
   

}  


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
            url: edchainNodeURL,
            method: 'GET',
            success: function(edchainData){

                courseLength=edchainData["courses"].length;
                
                for(var n=0;n<courseLength;n++){
                    parentHash=edchainData["courses"][n].hash;
                    
                   
                    let callback = (function(course){
                        return function(imageURL, indexURL){
                            var title = course.title;
                          
                            createHomePageCard(imageURL, title, indexURL);
                        };
                    }(edchainData["courses"][n]));
                    
                    getParentData(parentHash, callback);
          
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                log.info('error');
                log.info(errorThrown);
            }
        });
    }
 
};



var getParentData = function(parentHash, callback){
     let url=ipfsGetURL+parentHash+"&encoding=json";
      $.ajax({
            url:url,
            method:'GET',
            success: function(parentData){
   
                var arr=parentData["Links"];
                let courseContentURL=ipfsGetURL + arr[0].Hash +"&encoding=json";
                getCourseContents(arr[0].Hash,courseContentURL, callback);

            },
            error: function(error){
                log.info(error);
            }
        });
}

var getCourseContents = function(contentHash,courseContentURL, callback){

    
    $.ajax({
        url:courseContentURL,
        method:'GET',
        success: function(data1){
       
           for(var i=0;i<data1["Links"].length;i++){
             
                let arrContents=data1["Links"][i];
                let names=arrContents.Name;
                 
                if(names === 'contents'){
                    let jpgHash;
                  
                   
                    getCourseDetails(data1["Links"][i].Hash,jpgHash,contentHash, callback);

                }
            }   
        },
        error: function(error){
            log.info(error);
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

                     indxHash = indxHash + '/contents/index.htm';
                   //   indxHash = contentsHash + '/index.htm';

                    }
                                               
                }
            
            callback(httpURL + jpgHash, httpURL + indxHash);
              
        }
    });
}


var openCourseLink = function(event,url){
    event.preventDefault();
    createAndShowChildWindow(url);

}


var createHomePageCard = function(image, title, indexURL){

     $(".loader").hide();
     cardHtml="<div class='card'><img src=" + image +">";
     cardHtml= cardHtml + "<p class='card-text'>";
     cardHtml= cardHtml + "<a id='courseLink' onclick=openCourseLink(event,'" + indexURL +"') href='#'>"+ title + "</a>";   
     cardHtml= cardHtml + "</p></div>";
     $('#rows').append(cardHtml);
}


var isIPFSOnline=function(){
     
    pubsub.publish("ipfs:isOnline").then(function(value){
          setIPFSStatusButton(value);
          setTimeout(isIPFSOnline, 3000);
    });

    
}

function setIPFSStatusButton(isOnline){

    if(isOnline){
      $('#ipfs-icon-ref').removeClass('btn-outline-danger').addClass('btn-success');
      $('#img-ipfs-icon').prop("alt",'IPFS Online');
  
    }
    else{
         $('#ipfs-icon-ref').removeClass('btn-success').addClass('btn-outline-danger');
     //    $('#ipfsStatus').text('IPFS Offline');
    }

}

function clearVersion(){
   $('#version').text("version:" + "");
}

$(document).ready(function() {
   
    setTimeout(getFeaturedData,3000);
    // Avoid setInterval is a bit unwieldy
    // setInterval(isIPFSOnline,3000);
    isIPFSOnline()
   
    $('#ipfsStatus').on("click", function(){
         
        if($('#ipfsStatus').hasClass('btn-outline-danger')){
            pubsub.once("ipfs:start", function(){

                $('#ipfsStatus').removeClass('btn-outline-danger').addClass('btn-outline-success');
                $('#ipfsStatus').text('IPFS Online');
            });
        }

        else if($('#ipfsStatus').hasClass('btn-outline-success')){
            pubsub.once("ipfs:stop", function(){

                $('#ipfsStatus').removeClass('btn-outline-success').addClass('btn-outline-danger');
                $('#ipfsStatus').text('IPFS Offline');
            });

        }
     
   
    });

    $("#ipfs-icon-ref").on("click", showSettings);

    $('#stop').on("click", function(){
       
      pubsub.publish("ipfs:getId");
   
    });
    
    $('#version').on("click", function(){

        pubsub.once("ipfs:checkStatus", function(ver){
            $('#version').text("version:" + ver.version);
            setTimeout(clearVersion,2000);
        });

    });


    $('#refresh').on("click", function(){
    
        $(".card").remove(function(){
         getFeaturedData();
      });
   
  //   getFeaturedData();

      
   
    });


     $('#open').on("click", function(){
        console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));

    });
});
