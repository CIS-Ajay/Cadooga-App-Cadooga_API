const multer  = require('multer')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const AWS = require('aws-sdk');

module.exports = class UploadUtils {

    constructor(directoryPath = 'uploads/default') {
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
              fs.mkdirSync(directoryPath, { recursive: true })
              cb(null, directoryPath)
            },
            filename: function (req, file, cb) {
              cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname)) //Appending extension
            }
        })
      
        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        });

    }

    uploadFile (type = /jpg|jpeg|png|heic/, fileSize = 20000000) {
        try{ 
            return  multer({ 
                storage: this.storage,
                limits: {fileSize: fileSize},   // This limits file size to 2 million bytes(2mb)
                fileFilter: (req, file, cb) => {
                    console.log("File extension:", path.extname(file.originalname).toLowerCase());
                    const validFileTypes = type;
                    const extname = validFileTypes.test(path.extname(file.originalname).toLowerCase());
                
                    if (extname) {
                        return cb(null, true);
                    } else {
                        return cb("Error: Images Only! Supported formats are jpg, jpeg, png.");
                    }
                }
            });
        }
        catch(error){
            console.log("Error get all :--------------", err);
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }
    }


    // right old function
    // uploadFileAws(req, res, next) {
    //     AWS.config.update({
    //         region: process.env.S3_REGION,
    //         accessKeyId: process.env.S3_ACCESS_KEY,
    //         secretAccessKey: process.env.S3_SECRET_KEY
    //     });
    
    //     const file = req.file;
    //     const url = req.body.photo;

    //     if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    //         console.log("File is already hosted, bypassing upload:------------------->>>>", url);
    //         req.uploadData = {
    //             Location: url, // Directly assign the URL to `uploadData`
    //         };
    //         return next();
    //     }
        
    //     if (!file) {
    //         req.uploadData = null; // Set uploadData to null if no file is uploaded
    //         return next();
    //     }
    
    //     fs.readFile(file.path, (err, data) => {
    //         if (err) {
    //             console.error("File read error:", err);
    //             return res.status(500).send("Error reading file.");
    //         }
    
    //         const params = {
    //             Bucket: "cadooga-react-native-app",
    //             Key: `${Date.now()}_${file.originalname}`,
    //             Body: data,
    //         };
    
    //         const s3bucket = new AWS.S3();
    //         s3bucket.upload(params, (uploadErr, uploadData) => {
    //             fs.unlink(file.path, (unlinkErr) => {
    //                 if (unlinkErr) {
    //                     console.error("Error deleting temp file:", unlinkErr);
    //                 }
    //                 console.log("Temp File Deleted");
    //             });
    
    //             if (uploadErr) {
    //                 console.error("Upload error:", uploadErr);
    //                 return res.status(403).send({
    //                     message: uploadErr.message || "Upload failed",
    //                     code: uploadErr.code,
    //                     statusCode: uploadErr.statusCode,
    //                     region: uploadErr.region || "unknown",
    //                     requestId: uploadErr.requestId,
    //                     extendedRequestId: uploadErr.extendedRequestId
    //                 });
    //             }
    
    //             req.uploadData = uploadData;
    //             next();
    //         });
    //     });
    // }
    

    async uploadFileAws(req, res, next) {
        AWS.config.update({
            region: process.env.S3_REGION,
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        });
    
        const file = req.file;
        const url = req.body.photo;
    
        // Bypass if already hosted image URL is provided
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            console.log("File already hosted:", url);
            req.uploadData = { Location: url };
            return next();
        }
    
        // No file received
        if (!file) {
            req.uploadData = null;
            return next();
        }
    
        const filePath = file.path;
    
        try {
            // Ensure file is accessible
            await fs.promises.access(filePath, fs.constants.F_OK);
    
            // Read file content
            const fileData = await fs.promises.readFile(filePath);
    
            // Upload to S3
            const s3 = new AWS.S3();
            const uploadParams = {
                Bucket: "cadooga-react-native-app",
                Key: `${Date.now()}_${file.originalname}`,
                Body: fileData,
            };
    
            const uploadData = await s3.upload(uploadParams).promise();
    
            // Clean up temp file
            await fs.promises.unlink(filePath);
            console.log("Temp file deleted");
    
            req.uploadData = uploadData;
            next();
        } catch (err) {
            console.error("Upload Error:", err);
    
            return res.status(500).send({
                message: err.message || "File upload failed",
                stack: err.stack || null,
            });
        }
    }
    
    
    deleteFileFromS3 = async (pathToImage) => {
        const bucketName = process.env.S3_BUCKETS;
        let key = pathToImage;
    
        if (pathToImage.startsWith("https://")) {
            const urlParts = pathToImage.split("/");
            key = decodeURIComponent(urlParts[urlParts.length - 1]);
        }
    
        console.log("Bucket Name:", bucketName);
        console.log("Deleting key from S3:", key);
    
        const params = {
            Bucket: bucketName,
            Key: key,
        };
    
        try {
            const data = await this.s3.deleteObject(params).promise();
            console.log('Object deleted successfully:', data);
            return data;
        } catch (err) {
            console.error('Error deleting object:', err.message || err);
            throw err;
        }
    }
    

}