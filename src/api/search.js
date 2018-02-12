const axios = require("axios");

const elasticsearch = require('elasticsearch');
//const elasticSearchURL = "http://localhost:9200/twitter/_doc/2";
const client = new elasticsearch.Client({
      host:'http://localhost:9200',
      log:'trace'
});


var isElasticSearchOnline = function(){

  return client.search({
  	index:'twitter',
  	q:"trying"
  });

}

var bulk= function (){

	return client.bulk({
		body:[
			//action
			{ index: {_index:'myindex' , _type:'mytype' } },
				{
					title:'fooboo boo foo'
				},
				{ index: {_index:'myindex' , _type:'mytype' } },
				{
					title:'zoozozozo'
				},
				
				
			
		]
	});

}


var put = function(courseData){

   return client.index({

	  index: 'myindex',
	  type: 'mytype',
	  body: {
	    title: 'Test 1',
	    tags: ['y', 'z'],
	    published: true,
	  }
	  });

}


module.exports = {
	isElasticSearchOnline,
	put,
	bulk

};	