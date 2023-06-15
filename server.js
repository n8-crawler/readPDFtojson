const express = require('express');
const cors = require('cors');
var pdf_table_extractor = require("pdf-table-extractor");
const path = require("path");
const app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
const formidable = require('formidable');
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs')
app.get('/', (request, response, next) => {
    response.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/', (request, response, next) => {
    var fileloc;
    var file_name;
    var form = new formidable.IncomingForm()
    form.parse(request)
    form.on('fileBegin', function (name, file) {
        file.filepath = path.join(__dirname + '/' + file.originalFilename)
        fileloc = file.filepath;
        file_name = file.originalFilename;
        console.log('file loaded')


        function success(result) {
            x = JSON.stringify(result);
            console.log(x)
            response.json(result)

            fs.writeFile("output.json", x, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("JSON file has been saved.");
            });


        }


        function error(err) {
            console.error('Error: ' + err);
        }
        console.log('>>>>>>>>>>')
        pdf_table_extractor(file_name, success, error);




    })

});




app.get('/showdata', (request, response, next) => {
    fs.readFile("output.json", function (err, data) {


        if (err) throw err;

        const movies = JSON.parse(data);

        var movieslist = movies['pageTables'][0]['tables']
        response.render('uplad.ejs', { movieslist: movieslist })
    });

});

app.post('/saveData', (request, response, next) => {
    var form = new formidable.IncomingForm()
    form.parse(request)
    response.json(request.body)

});


app.use(express.static("templates"));

app.listen(3000, () => {
    console.log(`Server is running on port 8000.`);
});