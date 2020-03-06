require("dotenv").config();
require('rootpath')();

const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('helpers/jwt');
const errorHandler = require('helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(jwt());
app.use('/users', require('routes/users/users.controller'));
app.use(errorHandler);

var mongoUtil = require('helpers/mongoUtil');

mongoUtil.connectToServer(function (err, client) {
    if(err) console.log(err);

    app.use('/api/agent', require('routes/api/agent'))

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
