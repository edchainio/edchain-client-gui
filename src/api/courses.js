
const axios = require("axios");

const httpURL = "http://localhost:8080/ipfs/";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";
const edchainNodeURL2 = "http://45.55.235.198:9000/edchain/courses/";


// UTILS

var buildIpfsUrl = function(hash){

    return `${ipfsGetURL}${hash}&encoding=json`;
};

var buildIndexUrl = function(hash){
	return `${httpURL}${hash}/contents/index.htm`;
};

var buildImageUrl = function(hash){
	return `${httpURL}${hash}`;
};

var getData = function(url){
   
   return axios({
        url: url,
        method: 'GET',
    });
};

var getPostData = function(url,searchObj,fetchSize){

    var type=searchObj.search_type;
    var value=searchObj.search_term;
    var subject_matter="";
    var instructor_name="";
    var course_title="";
    var requestObj="";
    var vars={};

    if(value === ''){
        fetchSizeValue=1;
    }
    else{
        fetchSizeValue=200;
    }
     if(type === ''){
     
         requestObj={
            url: url,
            method: 'POST',
            headers:{'content-type':'application/json'},
            data: { 
               'response_size':200,
               "copyright_holder": "MIT", 
            }
      
        };
    
    }
    else if(type === 'subject_matter'){
     
         subject_matter= value;
         
         requestObj={
            url: url,
            method: 'POST',
            headers:{'content-type':'application/json'},
            data: { 
               'response_size':fetchSizeValue,
               'subject_matter':subject_matter,
            }
      
        };
    }
    else if(type==="course_title"){
        course_title=value;
        requestObj={
            url: url,
            method: 'POST',
            headers:{'content-type':'application/json'},
            data: { 
               'response_size':fetchSizeValue,
               'course_title':course_title,
            }
  
        };
    }
    else if(type==="instructor_name"){
        instructor_name=value;
        requestObj={
        url: url,
        method: 'POST',
        headers:{'content-type':'application/json'},
            data: { 
               'response_size':fetchSizeValue,
               'instructor_name':value
            }
  
        };
    }

    return axios(requestObj);
}


var getIpfsData = function(hash){
    return getData(buildIpfsUrl(hash));
};

var getSearchData = function(searchObj,fetchSize){

    return getPostData(edchainNodeURL2,searchObj,fetchSize);
};

var getCourseRoot = function(courseRootHash){
    // actual course ref
  return getIpfsData(courseRootHash);
};

var getCourseDirectory = function(directoryHash){
    return getIpfsData(directoryHash);
};

module.exports = {
    getSearchData,
	getCourseRoot,
	getCourseDirectory,
	buildIndexUrl,
	buildImageUrl
};