# Elasticsearch loop


Elasticsearch Loop is package are made your elasticsearch full paging loop is easier. Just few line of code you could loop all paging and take action with your data in elasticsearch

### Example

```javascript
var elasticLoop = require("elasticloop");

// Connect Elasticsearch 
elasticLoop.connect({
    host: 'localhost:9200'
});

//Remove comment when you want to debug
//elasticLoop.debugMode();

elasticLoop.query({
        index: 'main',
        q: 'time:[2016-01-01 TO 2016-12-31]',
},function(data){
    //What do you want to do with each data.
},function(data){
    //What do you want to do when your loop is success finish.
},function(data){
    //What do you want to do when query is error.
},function(data){
    //What do you want to do when your loop is finish with error.
});

```

### Remark
* This library is using scan & score method
* Query and connection parameter reference from https://github.com/elastic/elasticsearch-js
