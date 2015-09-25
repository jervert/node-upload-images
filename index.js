// /index.js
'use strict';

var fs = require('fs'),
  express = require('express'),
  multer  = require('multer'),
var _ = require('underscore');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {console.log(file)
    cb(null, file.fieldname + '-' + Date.now() + '.' + _.last(file.originalname.split('.')));
  }
});
var upload = multer({ storage: storage });

var app = express();



app.post('/send-image', upload.single('image'), function (req, res, next) {
  /*fs.readFile('/etc/passwd', 'utf8', callback);*/
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

app.use(express.static('public'));

app.listen(3000);