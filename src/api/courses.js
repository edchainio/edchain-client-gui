
const axios = require("axios");

const httpURL = "http://localhost:8080/ipfs/";
const edchainNodeURL = "http://45.55.235.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";


// UTILS

var buildIpfsUrl = function(hash){
    return ipfsGetURL + hash + "&encoding=json";
};

var getData = function(url){
    return axios({
        url: url,
        method: 'GET',
    });
};

var getIpfsData = function(hash){
    return getData(buildIpfsUrl(hash));
};

var onFailure = function(){
	// should dispatch
    // log.info(arguments);
};



var getFeaturedData = function(callback){
    var featuredData = getData(edchainNodeURL);

    // failure case
    featuredData.fail(onFailure);

    // success case
    featuredData.done(function({courses}){
        courses.forEach(function(course){
            getCourseDetail(course, callback);
        });        
    });
};

// TODO: Break up(maybe move some functionality to actions)

var getCourseDetail = function(course, callback){
    // actual course ref
    var courseRoot = getIpfsData(course.hash);
    
    course.META = {
        "hashes": {}
    };

    var __hashes = course.META.hashes;
   
    // failure case
    courseRoot.fail(onFailure);
    
    // success case
    courseRoot.done(function(data){

        __hashes.courseDirectoryHash = data["Links"][0].Hash;

        var courseDirectory = getIpfsData(__hashes.courseDirectoryHash);
        
        // failure case
        courseDirectory.fail(onFailure);
        
        // success case
        courseDirectory.done(function(directory){
            
            // course contents
            directory.Links.forEach(function(link){
                if(link.Name !== "contents") return;
                
                __hashes.contentsDirectoryHash = link.Hash;
                var contentsDirectory = getIpfsData(__hashes.contentsDirectoryHash);
                
                // failure case
                contentsDirectory.fail(onFailure);

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