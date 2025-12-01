import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3Client';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

interface ICreateMultipartUpload {
  bucket: string,
  key: string
}

export async function createMultipartUpload({ bucket, key }: ICreateMultipartUpload) {
  const createMultiPartCommand = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
  });

  const { UploadId } = await s3Client.send(createMultiPartCommand);

  if (!UploadId) {
    throw lambdaHttpResponse(500, {
      error: 'Failed to create multipart upload',
    });
  }

  return UploadId;
}
