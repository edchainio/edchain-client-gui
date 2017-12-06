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

// these open new windows
var __actions = {
    openCourseLink: function(url){
        ipcRenderer.send('createAndShowChildWindow', url);
    },
    showSettings: function(){
        // why is the file directly referenced here?
        let url='file://' + __dirname + '/src/html/settings.html';
        ipcRenderer.send('createChildWindow', url);
        ipcRenderer.send('showChildWindow');
    },
    isIPFSOnline: function(){
        ipcRenderer.send("ipfs:isOnline");
    }
};

// Feels like there is a course object in here somewhere
var __state = {
    getData: function(url){
        return $.ajax({
            url: url,
            method: 'GET',
        });
    },
    onFailure: function(){
        log.info(arguments);
    },
    // async and await would work wonders here
    getFeaturedData: function(){
        var featuredData = __state.getData(edchainNodeURL);

        // failure case
        featuredData.fail(__state.onFailure);

        // success case
        featuredData.done(function({courses}){
            
            courses.forEach(function(course){

                var parentData = __state.getData(ipfsGetURL + course.hash + "&encoding=json");
                
                // failure case
                parentData.fail(__state.onFailure);
                
                // success case
                parentData.done(function(data){
                    
                    // parent data parsing
                    var contentHash = data["Links"][0].Hash;

                    var courseContents = __state.getData(ipfsGetURL + contentHash + "$encoding=json");
                    
                    // failure case
                    courseContents.fail(__state.onFailure);
                    
                    // success case
                    courseContents.done(function(data){
                        // course contents
                        data.Links.forEach(function(link){
                            if(link.Name === "contents") {
                                __state.getCourseDetails(link.Hash, contentHash, function(imageURL, indexURL){
                                    var title = course.title;
                                    // this should not be here
                                    __ui.createHomePageCard(imageURL, title, indexURL);
                                });
                            }
                        });
                    });

                });
            });        
        });
    },
    getCourseDetails: function(contentsHash, indxHash, callback){
        __state.getData(ipfsGetURL + contentsHash + "&encoding=json").done(function(data){    
            
            data.Links.forEach(function(link){
                if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){
                    jpgHash = link.Hash;
                } else if (link.Name.endsWith('index.htm')){
                    indxHash = contentsHash + '/index.htm';
                }
            });

            callback(httpURL + jpgHash, httpURL + indxHash);
        });
    }
};

var __ui = {
    setIPFSStatusButton: function (isOnline){

        if(isOnline){
          $('#ipfs-icon-ref').removeClass('btn-outline-danger').addClass('btn-success');
          $('#img-ipfs-icon').prop("alt",'IPFS Online');
      
        }
        else{
            $('#ipfs-icon-ref').removeClass('btn-success').addClass('btn-outline-danger');
            // $('#ipfsStatus').text('IPFS Offline');
        }

    }, 
    createHomePageCard: function(image, title, indexURL){
        $(".loader").hide();
        var template = [
            '<div class="card">',
            '<img src=' + image + '>',
            '<p class="card-text">',
            '<a class="course-link" data-url="' + indexURL + '" href="#">' + title + '</a>',
            '</p></div>'
        ];
        
        $('#course-cards').append(template.join(""));
    }

};


$(document).ready(function() {
    
    ipcRenderer.on("start", function(){
        $('#ipfsStatus').removeClass('btn-outline-danger').addClass('btn-outline-success');
        $('#ipfsStatus').text('IPFS Online');
    });

    ipcRenderer.on("stop", function(){
        $('#ipfsStatus').removeClass('btn-outline-success').addClass('btn-outline-danger');
        $('#ipfsStatus').text('IPFS Offline');
    });

    ipcRenderer.on("isOnline", function(event, value){
        __ui.setIPFSStatusButton(value);
        setTimeout(__actions.isIPFSOnline, 3000);
    });

    ipcRenderer.on("checkStatus", function(event, ver){
        $('#version').text("version:" + ver.version);
        setTimeout(function(){
            $('#version').text("version:" + "");
        }, 2000);
    });

    $('#ipfsStatus').on("click", function(){
        if ($('#ipfsStatus').hasClass('btn-outline-danger')){
            ipcRenderer.send("ipfs:start");
        } else if ($('#ipfsStatus').hasClass('btn-outline-success')){
            ipcRenderer.send("ipfs:stop");
        }
    });

    $("#ipfs-icon-ref").on("click", function(event){
        event.preventDefault();
        __actions.showSettings();
    });

    $('#course-cards').on("click", ".card a.course-link", function(event){
        event.preventDefault();
        var url = $(this).data("url");
        __actions.openCourseLink(url);
    });

    $('#stop').on("click", function(){
        ipcRenderer.send("ipfs:getId");
    });
    
    $('#version').on("click", function(){
        ipcRenderer.send("ipfs:checkStatus");
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
    // Why is there a timeout?
    setTimeout(getFeaturedData, 3000);
    __actions.isIPFSOnline();
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
