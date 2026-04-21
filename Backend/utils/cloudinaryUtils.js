const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1]; // public_id.jpg
    const folderName = urlParts[urlParts.length - 2]; // folder (if exists)
    
    // public_id is everything after 'upload/' and before the extension
    const uploadIndex = urlParts.indexOf('upload');
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.split('.')[0];

    console.log(`Deleting image with public_id: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Deletion Error:', error);
    return null;
  }
};

module.exports = { deleteCloudinaryImage };
