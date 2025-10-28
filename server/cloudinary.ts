import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

/**
 * Upload a video file to Cloudinary
 */
export async function uploadVideoToCloudinary(
  file: Express.Multer.File | Buffer,
  filename?: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Get the buffer from file
    const buffer = file instanceof Buffer ? file : file.buffer;
    
    if (!buffer) {
      reject(new Error('No file buffer provided'));
      return;
    }

    // Create a readable stream from the file buffer
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'stocksprout/videos',
        // Preserve original filename if provided (remove extension for public_id)
        ...(filename && { public_id: `stocksprout/videos/${filename.replace(/\.[^/.]+$/, '')}` }),
        // Video upload settings - optional optimizations
        // Note: Cloudinary automatically handles video format conversion
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result from Cloudinary'));
        }
      }
    );

    // Write the buffer to the stream
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
}

/**
 * Delete a video from Cloudinary
 */
export async function deleteVideoFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) {
    return null;
  }
  
  // Cloudinary URL format: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/stocksprout/videos/video-123.mp4
  const match = url.match(/\/videos\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}
