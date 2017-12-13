// TODO: MOVE
const httpURL="http://localhost:8080/ipfs/";
const edchainNodeURL="http://45.55.235.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";


const { ipcRenderer, remote } = require('electron');
var log = remote.require('electron-log');

const coursesActions = require("../../shared/actions/courses");
const ipfsActions = require("../../shared/actions/ipfs");
const configureStore = require('../../shared/store/configureStore');

// get the global.state from the main process
const initialState = remote.getGlobal('state');

// create store
const store = configureStore(initialState, 'renderer');

ipcRenderer.on('redux-action', (event, payload) => {
    store.dispatch(payload);
});

// these ping main process
var __actions = {
    // should the main.store track the windows aswell?
    openCourseLink: function(url){
        ipcRenderer.send('createAndShowChildWindow', url);
    },
    showSettings: function(){
        ipcRenderer.send('openSettings');
    },
    start: function(){
        store.dispatch(ipfsActions.start());
    },
    stop: function(){

       store.dispatch(ipfsActions.stop());

    },
    // update
    isPinned: function(hash){
        ipcRenderer.send("ipfs:checkPin", hash);
    },
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
    },
    showPeerCount: function(peerCount){
         $('#swarm-count').html(peerCount);
    }

};


var applyState = function applyState(state){
    __ui.setIPFSStatusButton(state.ipfs.isOnline);
    __ui.showPeerCount(state.ipfs.peers);
    if (state.ipfs.isOnline){
        if (!state.courses.items){
        
            store.dispatch(coursesActions.getFeaturedData());
        
        } else {
            Object.keys(state.courses.items).forEach(function(id){
                let course = state.courses.items[id];
                let meta = course.META;
                let isReady = meta.urls.image && meta.urls.index && meta.hashes.courseDirectoryHash && course.title;
                if(!$(`#${course.hash}`).length && isReady){
                    __ui.createHomePageCard(
                        course.hash, meta.urls.image, course.title, 
                        meta.urls.index, meta.hashes.courseDirectoryHash
                    );
                }
            });
        } 
    }
    // __actions.isPinned(course.META.hashes.courseDirectoryHash);
};


$(document).ready(function() {

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

    $("#ipfs-icon-ref").on("click", function(event){
        event.preventDefault();
        __actions.showSettings();
    });

    $('#course-cards').on("click", ".card a.course-link", function(event){
        event.preventDefault();
        var url = $(this).data("url");
        __actions.openCourseLink(url);
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

    store.subscribe(function(){
        // executed when something could have changed the state
        applyState(store.getState());
    });

    applyState(store.getState());
});
