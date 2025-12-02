import { AbortMultipartUploadCommand, ListMultipartUploadsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3Client';
import { env } from '../config/env';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

export async function handler() {
  const bucket = env.FILE_BUCKET_NAME;

  const listCommand = new ListMultipartUploadsCommand({
    Bucket: bucket,
  });

  const { Uploads } = await s3Client.send(listCommand);

  if (Uploads) {
    await Promise.all(Uploads?.map(({ Key, UploadId }) => {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key,
        UploadId,
      });

      return s3Client.send(abortCommand);

    }));
  }

  return lambdaHttpResponse(204);
}
