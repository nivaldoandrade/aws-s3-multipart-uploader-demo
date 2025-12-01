import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../clients/s3Client';

interface IGenerateSignedUrl {
  totalChunks: number;
  bucket: string;
  key: string;
  uploadId: string;
}
export async function generateSignedUrl({
  totalChunks,
  bucket,
  key,
  uploadId,
}: IGenerateSignedUrl) {
  const partNumbers = Array.from({ length: totalChunks }, (_, index) => index + 1);

  const signedURLPromises = partNumbers.map(partNumber => {
    const uploadPartCommand = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(
      s3Client,
      uploadPartCommand,
      {
        expiresIn: 1 * 60 * 60, //1hr
      },
    );
  });

  const urls = await Promise.all(signedURLPromises);

  return urls.map((url, index) => ({
    url,
    partNumber: partNumbers[index],
  }));
}
