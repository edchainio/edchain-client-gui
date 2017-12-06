var log = require('electron-log');

const httpURL="http://localhost:8080/ipfs/";
const edchainNodeURL="http://139.59.66.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";

const { ipcRenderer, remote } = require('electron');
const { dialog } = remote.require('electron');

var node = {
    up: false,
    status: 'timed out',
    peerID: null,
    publisherID: null,
    info: '',
};

var openCourseLink = function(event,url){
    event.preventDefault();
    ipcRenderer.send('createAndShowChildWindow', url);
};

var createHomePageCard = function(image, title, indexURL){
    $(".loader").hide();
    cardHtml="<div class='card'><img src=" + image +">";
    cardHtml= cardHtml + "<p class='card-text'>";
    // ... shameful ...
    cardHtml= cardHtml + "<a id='courseLink' onclick=openCourseLink(event,'" + indexURL +"') href='#'>"+ title + "</a>";   
    cardHtml= cardHtml + "</p></div>";
    $('#rows').append(cardHtml);
};

var showSettings = function(event){
    event.preventDefault();
    // why is the file directly referenced here?
    let url='file://' + __dirname + '/src/html/settings.html';
    ipcRenderer.send('createChildWindow', url);
    ipcRenderer.send('showChildWindow');
};  

// Feels like there is a course object in here somewhere

var getData = function(url){
    return $.ajax({
        url: url,
        method: 'GET',
    });
};

var onFailure = function(){
    log.info(arguments);
};

// async and await would work wonders here
var getFeaturedData = function(){
    getData(edchainNodeURL).done(function(edchainData){
        
        edchainData["courses"].forEach(function(course){

            var parentData = getData(ipfsGetURL + course.hash + "&encoding=json");

            parentData.done(function(data){
                
                var contentHash = data["Links"][0].Hash;
                var courseContents = getData(ipfsGetURL + contentHash + "$encoding=json");
                
                courseContents.done(function(data){
                    data.Links.forEach(function(link){
                        if(link.Name === "contents") {
                            getCourseDetails(link.Hash, contentHash, function(imageURL, indexURL){
                                var title = course.title;
                                createHomePageCard(imageURL, title, indexURL);
                            });
                        }
                    });
                }).fail(onFailure);

            }).fail(onFailure);
        });        
    }).fail(onFailure);
};

var getCourseDetails = function(contentsHash, indxHash, callback){
    var url = ipfsGetURL + contentsHash + "&encoding=json";
    
    getData(url).done(function(data){    
        
        data.Links.forEach(function(link){
            if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){
                jpgHash = link.Hash;
            } else if (link.Name.endsWith('index.htm')){
                indxHash = contentsHash + '/index.htm';
            }
        });

        callback(httpURL + jpgHash, httpURL + indxHash);
    });
};


var isIPFSOnline = function(){
    ipcRenderer.send("ipfs:isOnline");
};

ipcRenderer.on("isOnline", function(event, value){
    setIPFSStatusButton(value);
    setTimeout(isIPFSOnline, 3000);
});

function setIPFSStatusButton(isOnline){

    if(isOnline){
      $('#ipfs-icon-ref').removeClass('btn-outline-danger').addClass('btn-success');
      $('#img-ipfs-icon').prop("alt",'IPFS Online');
  
    }
    else{
        $('#ipfs-icon-ref').removeClass('btn-success').addClass('btn-outline-danger');
        // $('#ipfsStatus').text('IPFS Offline');
    }

};

$(document).ready(function() {
   
    setTimeout(getFeaturedData, 3000);
    // Avoid setInterval is a bit unwieldy
    // setInterval(isIPFSOnline,3000);
    isIPFSOnline()
    
    ipcRenderer.on("start", function(){
        $('#ipfsStatus').removeClass('btn-outline-danger').addClass('btn-outline-success');
        $('#ipfsStatus').text('IPFS Online');
    });

    ipcRenderer.on("stop", function(){
        $('#ipfsStatus').removeClass('btn-outline-success').addClass('btn-outline-danger');
        $('#ipfsStatus').text('IPFS Offline');
    });

    $('#ipfsStatus').on("click", function(){
         
        if($('#ipfsStatus').hasClass('btn-outline-danger')){
            ipcRenderer.send("ipfs:start");
        }

        else if($('#ipfsStatus').hasClass('btn-outline-success')){
            ipcRenderer.send("ipfs:stop");

        }
     
   
    });

    $("#ipfs-icon-ref").on("click", showSettings);

    $('#stop').on("click", function(){
       
        ipcRenderer.send("ipfs:getId");
   
    });
    
    $('#version').on("click", function(){
        ipcRenderer.send("ipfs:checkStatus");
    });

    ipcRenderer.on("checkStatus", function(event, ver){
        $('#version').text("version:" + ver.version);
        setTimeout(function(){
            $('#version').text("version:" + "");
        }, 2000);
    });


    $('#refresh').on("click", function(){
    
        $(".card").remove(function(){
            getFeaturedData();
        });
    });


    $('#open').on("click", function(){
        // what is the point of this?
        console.log(
            dialog.showOpenDialog(
                {
                    properties: ['openFile', 'openDirectory', 'multiSelections']
                }
            )
        );
    });
});


// REMOVE THESE IF THEY ARE NOT BEING USED

// NOT USED
var setStatus = function($element){
    // we should probably move away from setInterval
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



// NOT USED
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
