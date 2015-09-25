// /index.js
/*jslint node: true */
'use strict';

var fs = require('fs'),
  express = require('express'),
  multer  = require('multer'),
  _ = require('underscore'),
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      console.log(file);
      var fileData = 'data/images.json',
        filename = file.fieldname + '-' + Date.now() + '.' + _.last(file.originalname.split('.'));
      fs.readFile(fileData, 'utf8', function (err, data) {
        if (err) {
          data = {
            images: []
          }
        } else {
          data = JSON.parse(data);
        }
        data.images.push(filename);
        console.log(data);
        fs.writeFile(fileData, JSON.stringify(data), function (err) {
          if (err) {
            throw err;
          }
          console.log('It\'s saved!');
          cb(null, filename);
        });
      });
      
    }
  }),
  upload = multer({ storage: storage }),
  app = express();



app.post('/send-image', upload.single('image'), function (req, res, next) {
  res.redirect('/');
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

app.use(express.static('public'));
app.use(express.static('data'));
app.use(express.static('uploads'));

app.listen(3000);