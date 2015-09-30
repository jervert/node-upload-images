// /index.js
/*jslint node: true */
'use strict';

var $Q = {
  config: {
    port: 7200,
    sizes: [256, 1024]
  }
},
  fs = require('fs'),
  path = require('path'),
  express = require('express'),
  multer  = require('multer'),
  _ = require('underscore'),
  upload,
  app = express();

$Q.utils = require('./node/utils.js')($Q, _);

upload = multer({
  storage: multer.diskStorage($Q.utils.multerUpload),
  fileFilter: function (req, file, cb) {
    var extension = path.extname(file.originalname);
    console.log('FILE TYPE: ' + extension);
    if (extension !== '.jpg' && extension !== '.png') {
      console.log('FILE REJECTED!');
      return cb(null, false);
    }
    console.log('FILE ACCEPTED!');
    cb(null, true)
  }
});

app.use(express.static('public'));
app.use(express.static('data'));

app.post('/send-image', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.post('/send-image', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.get('/images/:size/:image', function (req, res) {
  $Q.utils.thumbnailExists(req, res);
});

app.listen(process.env.PORT || $Q.config.port);