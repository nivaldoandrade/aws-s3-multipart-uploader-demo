import { ListMultipartUploadsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3Client';
import { env } from '../config/env';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

export async function handler() {
  const command = new ListMultipartUploadsCommand({
    Bucket: env.FILE_BUCKET_NAME,
  });

  const { Uploads } = await s3Client.send(command);

  return lambdaHttpResponse(200, {
    uploads: Uploads ?? [],
  });
}
