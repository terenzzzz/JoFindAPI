/**
 * A Multer Middleware To Handle FormData and Files Upload
 * @author Zhicong Jiang <zjiang34@sheffield.ac.uk>
 */
const multer = require('multer');

const generalUpload = multer();
// /**
//  * Set Up Files Storage Path
//  * @author Zhicong Jiang <zjiang34@sheffield.ac.uk>
//  */


// var avatarStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/avatar/');
//     },
//     filename: function (req, file, cb) {
//         var original = file.originalname;
//         var file_extension = original.split(".");
//         // Make the file name the date + the file extension
//         filename =  req.body.email + '.' + file_extension[file_extension.length-1];
//         cb(null, filename);
//     }
// });

// var avatar = multer({ storage: avatarStorage });


var upload = multer({ storage: multer.memoryStorage() });

module.exports = {
    upload,
    generalUpload
}
