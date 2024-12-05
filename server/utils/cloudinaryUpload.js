import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = async (file, folder = 'events') => {
  try {
    const isVideo = file.mediaType === 'video';
    const options = {
      folder,
      resource_type: isVideo ? 'video' : 'image',
    };

    if (!isVideo) {
      options.width = 1080;
      options.quality = 'auto';
      options.crop = 'limit';
    }

    const result = await cloudinary.uploader.upload(file.path, options);
    
    return {
      type: file.mediaType,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
}; 

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw new Error(`Error deleting from Cloudinary: ${error.message}`);
    }
  };