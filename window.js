const httpURL="http://localhost:8080/ipfs/";
const edchainNodeURL="http://139.59.66.198:5000/content/addresses/featured";
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
            courses.forEach(function(course){
                __state.getCourseDetail(course, callback);
            });        
        });
    },
    getCourseDetail: function(course){
        // actual course ref
        var courseRoot = __state.getIpfsData(coures.hash);
        
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
                                
                                course.META.indexUrl = httpURL + course.META.contentsDirectoryHash + '/index.htm';
                            
                            }
                        });
                        
                        __ui.createHomePageCard(course.META.imageUrl, course.title, course.META.indexUrl);
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