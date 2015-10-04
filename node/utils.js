var fs = require('fs'),
  path = require('path'),
  gm = require('gm'),
  imageManipulate = gm.subClass({
    imageMagick: true
  });

module.exports = function ($Q, _) {
  return {
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
          console.log('EXISTS: ' + file);
          $Q.utils.readFileBinary(res, file);
        } else {
          console.log('NOT EXISTS: ' + file);
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
    },
    fileFilter: function (file) {
      var extension = path.extname(file.originalname).toLowerCase(),
        result = extension === '.jpg' || extension === '.jpeg' || extension === '.png';
      console.log('FILE TYPE: ' + extension);
      console.log(result ? 'FILE ACCEPTED!' : 'FILE REJECTED!');
      return result;
    },
    multer: {
      upload: {
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
      }
    }
  };
};