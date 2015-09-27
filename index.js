// /index.js
/*jslint node: true */
'use strict';

var $Q = {},
  fs = require('fs'),
  express = require('express'),
  multer  = require('multer'),
  _ = require('underscore'),
  gm = require('gm'),
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

$Q.utils = {
  readFileBinary: function (res, file) {
    fs.readFile(file, function (err, data) {
      if (err) {
        console.log(err);
        console.log(file);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('Error 404');
      } else {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data);
      }
    });
  }
}

app.post('/send-image', upload.single('image'), function (req, res, next) {
  res.redirect('/');
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

app.use(express.static('public'));
app.use(express.static('data'));
app.use(express.static('uploads'));

app.get('/images/:size/:image', function (req, res, next) {
  var size = req.param('size'),
    image = req.param('image'),
    file = 'content/thumbs/' + size + '/'+ image;
  //gm('uploads/' + image).resize(width [, height [, options]])
  
  fs.exists(file, function (exists) {
    if (exists) {
      $Q.utils.readFileBinary(res, file);
    } else {
      gm('uploads/' + image)
        .resize(size)
        .autoOrient()
      .write(file, function (err) {
        console.log('WRITE: ' + file);
        $Q.utils.readFileBinary(res, file);
      });
    }
  });


  
  //next();
});

app.listen(3000);