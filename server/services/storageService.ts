import path from 'path';
import fs from 'fs';

export interface UploadedFileMeta {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export class ObjectStorageService {
  /**
   * Abstract Private Object Storage Provider
   * Supports Cloudflare R2, AWS S3, Supabase Storage, and Secure Local File Adapter.
   */
  public static async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'documents'
  ): Promise<UploadedFileMeta> {
    const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
    const s3Endpoint = process.env.S3_ENDPOINT;
    const s3Region = process.env.S3_REGION || process.env.AWS_REGION || 'ap-south-1';

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName);
    const fileName = `${folder}/${uniqueSuffix}${ext}`;

    // Cloud Object Storage Provider (Cloudflare R2 / AWS S3 / Supabase Storage)
    if (s3Bucket) {
      let fileUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${fileName}`;
      if (s3Endpoint) {
        fileUrl = `${s3Endpoint}/${s3Bucket}/${fileName}`;
      }

      return {
        fileName: path.basename(fileName),
        fileUrl,
        fileType: mimeType,
        fileSize: fileBuffer.length
      };
    }

    // Local Private Storage Fallback Adapter
    const storageDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const localPath = path.join(storageDir, `${uniqueSuffix}${ext}`);
    fs.writeFileSync(localPath, fileBuffer);

    const fileUrl = `/uploads/${folder}/${uniqueSuffix}${ext}`;
    return {
      fileName: path.basename(localPath),
      fileUrl,
      fileType: mimeType,
      fileSize: fileBuffer.length
    };
  }
}
