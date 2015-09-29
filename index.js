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
  gm = require('gm'),
  imageManipulate = gm.subClass({
    imageMagick: true
  }),
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
        console.log('READ: ' + file);
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data);
      }
    });
  },
  uploadAndRead: function (res, file, image, size) {
    //imageManipulate('uploads/' + image).resize(width [, height [, options]])
    imageManipulate('uploads/' + image)
        .resize(size)
        .autoOrient()
      .write(file, function (err) {
        console.log('WRITE: ' + file);
        $Q.utils.readFileBinary(res, file);
      });
  },
  thumbnailExists: function (req, res) {
    var size = req.params.size,
      image = req.params.image,
      sizePath = 'content/thumbs/' + size,
      file = sizePath + '/'+ image,
      upload = function () {
        $Q.utils.uploadAndRead(res, file, image, size);
      };

    fs.exists(file, function (exists) {
      if (exists) {
        $Q.utils.readFileBinary(res, file);
      } else {
        fs.exists(sizePath, function (exists) {
          if (exists) {
            upload();
          } else {
            fs.mkdir(sizePath, function (err) {
              console.log('MKDIR: ' + sizePath);
              upload();
            });
          }
        });
      }
    });
  }
};

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