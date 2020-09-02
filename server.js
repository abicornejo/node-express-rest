const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let config = require('./config');
let middleware = require('./middleware');
const morgan = require('morgan');
const _ = require('lodash');
const fs = require('fs')
const csv = require('csv-parser')

class HandlerGenerator {
    login (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        // For the given username fetch user from DB
        let mockedUsername = 'admin';
        let mockedPassword = 'password';

        if (username && password) {
            if (username === mockedUsername && password === mockedPassword) {
                let token = jwt.sign({username: username},
                    config.secret,
                    { expiresIn: '24h' // expires in 24 hours
                    }
                );
                // return the JWT token for the future API calls
                res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                });
            } else {
                res.send(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        } else {
            res.send(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }
    }
    index (req, res) {
        res.json({
            success: true,
            message: 'Index page'
        });
    }
}

function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}

// Starting point of the server
function main () {
    let app = express(); // Export app for other routes to use


    // enable files upload
    app.use(fileUpload({
        createParentPath: true
    }));

    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(morgan('dev'));
    let handlers = new HandlerGenerator();
    const port = process.env.PORT || 8000;
    app.use(bodyParser.urlencoded({ // Middleware
        extended: true
    }));
    app.use(bodyParser.json());
    // Routes & Handlers
    app.post('/login', handlers.login);
    app.get('/', middleware.checkToken, handlers.index);
    app.get('/data', middleware.checkToken,async (req, res) => {

        let users = [];
        fs.createReadStream('input.csv')
            .pipe(csv())
            .on('data', function (row) {
                const user = {
                    name: row.name,
                    segment1: row.segment1,
                    segment2: row.segment2,
                    segment3: row.segment3,
                    segment4: row.segment4,
                    platformId: row.platformId,
                    clientId: row.clientId,
                }
                users.push(user)
            })
            .on('end', function () {
                //console.table(users)
                // TODO: SAVE users data to another file
                let sort = 'asc';
                let sortField = 'clientId';
                let limit = 6;
                if(req.query.sort){
                    sort = req.query.sort;
                }
                if(req.body.sort){
                    sort = req.body.sort
                }
                if(req.query.sortField){
                    sortField = req.query.sortField;
                }
                if(req.body.sortField){
                    sortField = req.body.sortField
                }
                if(req.query.limit){
                    limit = req.query.limit;
                }
                if(req.body.limit){
                    limit = req.body.limit
                }


                users = users.sort(compareValues(sortField, sort));


                if(limit){
                    users = users.slice(0, limit);
                }

                console.log(users);

                res.send({
                    status: true,
                    users: users
                });
            })
    });
    app.post('/file', middleware.checkToken, async (req, res) => {
        try {
            if(!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded'
                });
            } else {
                console.log("CHECKING FILE");
                console.log(req.files);
                //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
                let file = req.files.file;

                if (!file.name.match(/\.(csv|CSV)$/)) {
                    res.send({
                        status: false,
                        message: 'Only csv files are allowed!'
                    });
                }


                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                file.mv('./uploads/' + file.name);

                //send response
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });
    app.get('/file', middleware.checkToken,async (req, res) => {

        let fileName =null;
        if(req.query.fileName){
            fileName = req.query.fileName;
        }
        if(req.body.fileName){
            fileName = req.body.fileName
        }

        const fileToDownload = 'uploads/' + fileName;

        res.download(fileToDownload);
    });


    app.listen(port, () => console.log(`Server is listening on port: ${port}`));
}

main();
