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
  express = require('express'),
  multer  = require('multer'),
  _ = require('underscore'),
  upload,
  app = express();

$Q.utils = require('./node/utils.js')($Q, _);

upload = multer({ storage: multer.diskStorage($Q.utils.multerUpload) });

app.use(express.static('public'));
app.use(express.static('data'));

app.post('/send-image', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.get('/images/:size/:image', function (req, res) {
  $Q.utils.thumbnailExists(req, res);
});

app.listen(process.env.PORT || $Q.config.port);