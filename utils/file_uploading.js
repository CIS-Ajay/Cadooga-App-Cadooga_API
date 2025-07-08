const fs = require('fs');
const { s3 } = require('../config/awsConfig');
const { storage } = require('./data');

class FileUploading {
  async uploadFileToS3(uploadedFile, fileStorage = storage.profile) {
    try {
      const fileName = `${Date.now()}_${uploadedFile.name}`;
      const params = {
        Bucket: process.env.S3_BUCKETS,
        Key: `${fileStorage}/${fileName}`,
        Body: uploadedFile.data,
        ACL: 'public-read'
      };

      const data = await s3.upload(params).promise();
      console.log("Uploaded to S3:", data);
      return data; 
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Error uploading file to S3.');
    }
  }

  deleteFileFromS3(pathToImage) {
    const bucketName = process.env.S3_BUCKETS;
    const params = {
      Bucket: bucketName,
      Key: pathToImage,
    };
    return s3.deleteObject(params).promise()
      .then(data => {
        console.log('Object deleted successfully:', data);
      })
      .catch(err => {
        console.error('Error deleting object:', err);
      });
  }
}

module.exports = FileUploading;