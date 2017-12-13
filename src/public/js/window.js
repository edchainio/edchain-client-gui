
const { ipcRenderer, remote } = require('electron');

const coursesActions = require("../../shared/actions/courses");
const ipfsActions = require("../../shared/actions/ipfs");
const configureStore = require('../../shared/store/configureStore');

const { registry } = require("electron-redux");

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
    createHomePageCard: function(image, title, indexURL, courseDirectoryHash, courseHash, action){
        $(".loader").hide();
        action = action || "...";
        console.log(arguments);
        var rendered = Mustache.render(
            $("#course-card-template").html(), 
            {image, title, indexURL, courseDirectoryHash, courseHash, action}
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
        courseKeys = Object.keys(state.courses.items);
        if (courseKeys.length){
            courseKeys.forEach(function(key){
                let course = state.courses.items[key];
                let meta = course.META;
                let isReady = meta.urls.image && meta.urls.index && meta.hashes.courseDirectoryHash && course.title;
                if(!$(`#${course.hash}`).length && isReady){
                    __ui.createHomePageCard(
                        meta.urls.image, course.title, meta.urls.index, 
                        meta.hashes.courseDirectoryHash, course.hash
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
    // maybe setTimeout?
    applyState(store.getState());
});
