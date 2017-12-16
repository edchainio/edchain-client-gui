
const axios = require("axios");

const httpURL = "http://localhost:8080/ipfs/";
const edchainNodeURL = "http://45.55.235.198:5000/content/addresses/featured";
const ipfsGetURL=  "http://localhost:5001/api/v0/object/get?arg=";


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

var getIpfsData = function(hash){
    return getData(buildIpfsUrl(hash));
};


var getFeatured = function(){
    return getData(edchainNodeURL);
};

var getCourseRoot = function(courseRootHash){
    // actual course ref
    return getIpfsData(courseRootHash);
};

var getCourseDirectory = function(directoryHash){
    return getIpfsData(directoryHash);
};

module.exports = {
	getFeatured,
	getCourseRoot,
	getCourseDirectory,
	buildIndexUrl,
	buildImageUrl
};