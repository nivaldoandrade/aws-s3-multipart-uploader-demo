import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as z from 'zod/mini';
import { s3Client } from '../clients/s3Client';
import { bodyParser } from '../utils/bodyParser';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

const schema = z.object({
  bucketName: z.string().check(
    z.trim(),
    z.minLength(1, '\'bucketName\' is required'),
  ),
  key: z.string().check(
    z.trim(),
    z.minLength(1, '\'key\' is required'),
  ),
  uploadId: z.string().check(
    z.trim(),
    z.minLength(1, '\'uploadId\' is required'),
  ),
});

export async function handler(event: APIGatewayProxyEventV2) {
  const body = bodyParser(event.body);

  const { data, success, error } = schema.safeParse(body);

  if (!success) {
    return lambdaHttpResponse(401, {
      errors: error.issues.map(issue => ({
        field: issue.path.join('.'),
        error: issue.message,
      })),
    });
  }

  const { bucketName, key, uploadId } = data;

  const command = new AbortMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
  });

  await s3Client.send(command);

  return lambdaHttpResponse(204);
}
