import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://a70443ad0981a11365cf43ccf024ae79.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'e97c738df1df08451a3a4a8f64e089fa',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '753665cea8a63d85dcc9e7a5dd507ba7b308e55f315f7491d6d2492dc0323d3e',
  },
});

export async function uploadToR2(file: File, path: string = 'uploads') {
  const fileBuffer = await file.arrayBuffer();
  const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const key = `${path}/${uniqueFilename}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'img',
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    })
  );

  return `https://${process.env.R2_PUBLIC_DOMAIN || 'cdn.zuricart.co.ke'}/${key}`;
}

export async function deleteFromR2(url: string) {
  const key = url.replace(`https://${process.env.R2_PUBLIC_DOMAIN || 'cdn.zuricart.co.ke'}/`, '');
  await R2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'img',
      Key: key,
    })
  );
}