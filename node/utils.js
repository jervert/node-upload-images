var fs = require('fs'),
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
};