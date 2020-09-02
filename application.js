var express 	= require("express");
var app 	= express();
var bodyParser 	= require('body-parser');
var request 	= require("request");
var fetch = require('node-fetch');
var mysql = require('mysql');

let jsonJira = {};

// Soporte para bodies codificados en jsonsupport.
app.use(bodyParser.json());
// Soporte para bodies codificados
app.use(bodyParser.urlencoded({ extended: true }));

const con = mysql.createConnection({
    host: "remotemysql.com",
    user: "zX3FrGpsse",
    password: "09LVGCtRmn",
    database: "zX3FrGpsse"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    // const sql = "INSERT INTO jiraissues (name, address) VALUES ('Company Inc', 'Highway 37')";
    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("1 record inserted");
    // });
});


app.get('/users', function(req, res) {
    //Fetching from toggl
	fetch('https://www.toggl.com/api/v8/me?with_related_data=true', {
        method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              'b16da068adceb59e15e498ad44976594:api_token'
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
    })
    .then(response => {
	  //console.log(response);
        console.log(
          `Response from toggl: ${response.status} ${response.statusText}`
        );
        return response.text();
    })
    .then(text => console.log(text))
    .catch(err => console.error(err));
	

	//fetch issues from jira
	fetch('https://stackitchallenge.atlassian.net/rest/api/2/issue/LSCC-1', {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${Buffer.from(
              'abicornejo@gmail.com:vVaVdGWMowJeBv8B1VcJ3A8F'
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
    })
    .then(response => {
        console.log(
          `Response from jira: ${response.status} ${response.statusText}`
        );
        return response.text();
    })
    .then(text => {
	  //
      const obj = JSON.parse(text);
	  console.log(obj.expand);


      // jsonJira.projectID = obj.id;
      // jsonJira.jiraIssues = [];
      // jsonJira.jiraIssues.push(
      //     {
      //         id: "PA-2",
      //         statusCategory: "Done",
      //         summary: "PA-2 - Emptied repo.",
      //         assignee: "Joe Doe",
      //         totalDuration: "00:01:00",
      //         totalDurationMillSeconds: 60000,
      //         aggregatedTags: [],
      //         aggregateCategories: [],
      //         estimatedDuration: "03:00:00",
      //         estimatedDurationMillSeconds: 10000000,
      //         togglEntries: []
      //       }
      // )

	
	})
  .catch(err => console.error(err));
	

	
});
 

  
app.listen(8888, function () {
    console.log('Server is running.. on 8888'); 
});
