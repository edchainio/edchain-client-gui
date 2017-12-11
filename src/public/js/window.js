// TODO: MOVE
const httpURL="http://localhost:8080/ipfs/";
const edchainNodeURL="http://45.55.235.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";


const { ipcRenderer, remote } = require('electron');
const { dialog } = remote.require('electron');
var log = remote.require('electron-log');

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
        // TODO: MOVE
        // why is the file directly referenced here?
        let url='file://' + __dirname + '/../html/settings.html';
        ipcRenderer.send('createChildWindow', url);
        ipcRenderer.send('showChildWindow');
    },
    isIPFSOnline: function(){
        ipcRenderer.send("ipfs:isOnline");
    },
    isPinned: function(hash){
        ipcRenderer.send("ipfs:checkPin", hash);
 
    }
};

// Feels like there is a course object in here somewhere

// TODO: MOVE
var __state = {
    "courses": null,
    buildIpfsUrl: function(hash){
        return ipfsGetURL + hash + "&encoding=json";
    },
    getData: function(url){
        return $.ajax({
            url: url,
            method: 'GET',
        });
    },
    getIpfsData: function(hash){
        return __state.getData(__state.buildIpfsUrl(hash));
    },
    onFailure: function(){
        log.info(arguments);
    },
    getFeaturedData: function(callback){
        var featuredData = __state.getData(edchainNodeURL);

        // failure case
        featuredData.fail(__state.onFailure);

        // success case
        featuredData.done(function({courses}){
            __state.courses = courses;
            courses.forEach(function(course){
                __state.getCourseDetail(course, callback);
            });        
        });
    },
    // TODO: MOVE
    getCourseDetail: function(course, callback){
        // actual course ref
        var courseRoot = __state.getIpfsData(course.hash);
        
        course.META = {
            "hashes": {}
        };

        var __hashes = course.META.hashes;
       
        // failure case
        courseRoot.fail(__state.onFailure);
        
        // success case
        courseRoot.done(function(data){

            __hashes.courseDirectoryHash = data["Links"][0].Hash;

            var courseDirectory = __state.getIpfsData(__hashes.courseDirectoryHash);
            
            // failure case
            courseDirectory.fail(__state.onFailure);
            
            // success case
            courseDirectory.done(function(directory){
                
                // course contents
                directory.Links.forEach(function(link){
                    if(link.Name !== "contents") return;
                    
                    __hashes.contentsDirectoryHash = link.Hash;
                    var contentsDirectory = __state.getIpfsData(__hashes.contentsDirectoryHash);
                    
                    // failure case
                    contentsDirectory.fail(__state.onFailure);

                    // success case
                    contentsDirectory.done(function(contents){

                        contents.Links.forEach(function(link){
                            
                            if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){
                                
                                course.META.imageUrl = httpURL + link.Hash;

                            } else if (link.Name.endsWith('index.htm')){
                                
                                course.META.indexUrl = `${httpURL}${__hashes.courseDirectoryHash}/contents/index.htm`;
                            
                            }
                        });
                        callback(course);
                    });
                });
            });
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
    createHomePageCard: function(image, title, indexURL, courseHash, action){
        $(".loader").hide();
        action = action || "...";

        var rendered = Mustache.render(
            $("#course-card-template").html(), 
            {image, title, indexURL, courseHash, action}
        );
        $('#course-cards').append(rendered);
    }

};


$(document).ready(function() {
    
    ipcRenderer.on("isOnline", function(event, value){
        __ui.setIPFSStatusButton(value);
        // wait 3 seconds before checking status again
        setTimeout(__actions.isIPFSOnline, 3000);
    });

    ipcRenderer.on("checkStatus", function(event, ver){
        $('#version').text("version:" + ver.version);
        setTimeout(function(){
            $('#version').text("version:" + "");
        }, 2000);
    });

    ipcRenderer.on("ipfsRemovePin",function(event, hash, wasRemoved){
        if (wasRemoved){
            __actions.isPinned(hash);
        } else {
            // notify user that unpinning failed
        }
    });

    ipcRenderer.on("isPinned",function(event, hash, isPinned){
        // find element with hash
        var 
            action, status,
            $courseCard = $(`#${hash}`),
            $actionLink = $courseCard.find("a.pin-course-link");
        
        if (isPinned){
            // set to pinned state
            action = "unpin";
            status = "Pinned";
            $actionLink.removeClass("unpinImage").addClass("pinImage");
        } else {
            // set to unpinned state
            action = "pin";
            status = "Un-Pinned";
            $actionLink.removeClass("pinImage").addClass("unpinImage");
           
        }
         
        $actionLink.data("action", action);
        $actionLink.text(action);
        $courseCard.find(".pin-status").text(status);
    });

   // TODO: WHICH OF THESE ARE STILL RELEVANT

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
            __state.getFeaturedData(function(course){
                __ui.createHomePageCard(
                    course.META.imageUrl, course.title, 
                    course.META.indexUrl, course.META.hashes.courseDirectoryHash
                );
                __actions.isPinned(course.META.hashes.courseDirectoryHash);
            });
        });
    });

    $('#course-cards').on("click", '.pin-course-link', function(event){
        event.preventDefault();
        var hash = $(this).data("hash");
        var action =  $(this).data("action");
        if(action === "unpin"){
            ipcRenderer.send("ipfs:removePin", hash);
        }
        else {
            ipcRenderer.send("ipfs:addPin", hash);
        }
    });


    // Waiting for ipfs to fire up
    setTimeout(function(){
        __state.getFeaturedData(function(course){
            __ui.createHomePageCard(
                course.META.imageUrl, course.title, 
                course.META.indexUrl, course.META.hashes.courseDirectoryHash
            );
            __actions.isPinned(course.META.hashes.courseDirectoryHash);
        });
    }, 3000);
    
    __actions.isIPFSOnline();
});