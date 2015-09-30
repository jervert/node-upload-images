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

$Q.utils = require('./node/utils.js')($Q, _);

app.use(express.static('public'));
app.use(express.static('data'));
app.use(express.static('uploads'));

app.post('/send-image', upload.single('image'), function (req, res) {
  res.redirect('/');
});

app.get('/images/:size/:image', function (req, res) {
  $Q.utils.thumbnailExists(req, res);
});

app.listen(process.env.PORT || $Q.config.port);