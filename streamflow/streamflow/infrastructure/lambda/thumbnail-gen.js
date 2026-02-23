// infrastructure/lambda/thumbnail-gen.js
// Triggered automatically when a .mp4 is uploaded to S3 videos/ prefix.
// Writes a metadata JSON to the thumbnails/ folder.

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({});

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key    = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (!key.endsWith('.mp4')) continue; // only process video files

    const thumbKey = key
      .replace('videos/', 'thumbnails/')
      .replace('.mp4', '-meta.json');

    const meta = JSON.stringify({
      source:    key,
      bucket,
      size:      record.s3.object.size,
      generated: new Date().toISOString(),
      status:    'processed',
    }, null, 2);

    await s3.send(new PutObjectCommand({
      Bucket:      bucket,
      Key:         thumbKey,
      Body:        meta,
      ContentType: 'application/json',
    }));

    console.log(`Metadata written to: ${thumbKey}`);
  }

  return { statusCode: 200, body: 'Done' };
};
