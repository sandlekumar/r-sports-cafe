const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Configure Cloudinary if credentials exist
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ Cloudinary configured successfully');
} else {
  console.log('ℹ️ Cloudinary credentials not detected — using local /uploads fallback');
}

/**
 * Upload a memory buffer (e.g. processed by sharp)
 * @param {Buffer} buffer
 * @param {Object} options
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'r-sports-cafe',
        resource_type: options.resource_type || 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Upload a file from disk (e.g. video reel)
 * @param {string} filePath
 * @param {Object} options
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadFile = (filePath, options = {}) => {
  return cloudinary.uploader.upload(filePath, {
    folder: options.folder || 'r-sports-cafe',
    resource_type: options.resource_type || 'auto',
    ...options,
  });
};

/**
 * Smart image saver:
 * If Cloudinary is configured -> uploads buffer to Cloudinary and returns secure_url.
 * If Cloudinary is not configured -> writes buffer to local disk in /uploads/{subdir}/{filename} and returns /uploads/{subdir}/{filename}.
 */
const saveImage = async ({ buffer, folder = 'general', filename, fallbackSubdir }) => {
  if (isConfigured) {
    try {
      const result = await uploadBuffer(buffer, {
        folder: `r-sports-cafe/${folder}`,
        resource_type: 'image',
      });
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local storage:', err);
    }
  }

  // Fallback: local disk
  const sub = fallbackSubdir || folder;
  const dir = path.join(__dirname, '../uploads', sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const localPath = path.join(dir, filename);
  fs.writeFileSync(localPath, buffer);
  return `/uploads/${sub}/${filename}`;
};

/**
 * Smart video saver:
 * If Cloudinary is configured -> uploads video file to Cloudinary and deletes local temporary file.
 * If Cloudinary is not configured -> leaves local file in place and returns /uploads/{subdir}/{filename}.
 */
const saveVideo = async ({ filePath, folder = 'reels', filename, fallbackSubdir }) => {
  if (isConfigured) {
    try {
      const result = await uploadFile(filePath, {
        folder: `r-sports-cafe/${folder}`,
        resource_type: 'video',
      });
      // Remove local temp file after successful upload to save disk space
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary video upload error, falling back to local storage:', err);
    }
  }

  // Fallback: local disk path
  const sub = fallbackSubdir || folder;
  return `/uploads/${sub}/${filename}`;
};

module.exports = {
  isConfigured,
  cloudinary,
  uploadBuffer,
  uploadFile,
  saveImage,
  saveVideo,
};
