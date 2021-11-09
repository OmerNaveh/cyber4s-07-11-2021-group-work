const express  = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const deleteRouter = require('./routers/deleteRouters');
const getRouters = require('./routers/getRouters');
const postRouters = require('./routers/postRouters');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const mongoose = require('mongoose');
const { response } = require('express');

// accessing the password from the gitigore file
let password;
try {
    password = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../superSecretPasswordTomongo.json'), 'utf-8'))[0];
    console.log(password);
} catch(error) {
    console.log('password could not be accesed');
}


// url adress to acces mongodb
const url = `mongodb+srv://Arnon-Asquira:${password}@cluster0.sihgr.mongodb.net/arnonsfirstdatabase?retryWrites=true&w=majority`;

// mongoose logic
mongoose.connect(url);

const phoneEntrySchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Entry = mongoose.model('Entry', phoneEntrySchema);

// intilizing the app
const app = express();

app.use(express.json()) // parses request body to json

const port = process.env.PORT || 3001;

// disableling cors
app.use(cors({
    origin: '*',
    methods: '*'
}));

// serving the javascript file for the index html staticly so that it can be used
app.use(express.static(path.resolve(__dirname,`../dist`)));

// serving the index html file to the client for interaction with the rest of the api
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

// morgan middleware
app.use(morgan(function (tokens, req, res) {
    return  [
        req.method,
        res.statusCode,
        JSON.stringify(req.body)]
  }));


// retrieving all the phone book object
//app.use('/', getRouters);
app.get('/api/persons/', async (req, res) => {
    await Entry.find({})
    .then(result => {
        res.json(result);
        mongoose.connection.close();
    })
    .catch(error => {
        console.log(error);
        res.status(500).send(error);
    })
})

 // deleting specific entry by id
app.use('/api/persons/', deleteRouter);

// creating a new entry 
app.use('/api/persons/', postRouters);


app.use((req, res) => {
    res.status(404).send('unkown endpoint')
});


app.listen(port, (error) => {
    if(error) {
        console.log(error);
        return;
    }
    console.log(`listening on port ${port}`);
});