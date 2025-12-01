import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as z from 'zod/mini';

import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3Client';
import { bodyParser } from '../utils/bodyParser';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

const uploadedPartsSchema = z.object({
  eTag: z.string().check(
    z.trim(),
    z.minLength(1, '\'eTag\' is required'),
  ),
  partNumber: z.number('Expected number').check(
    z.gte(1, '\'partNumber\' must be between 1 and 10000'),
    z.lte(10000, '\'partNumber\' must be between 1 and 10000'),
  ),
});

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
  uploadedParts: z.array(uploadedPartsSchema),
});

export async function handler(event: APIGatewayProxyEventV2) {

  const body = bodyParser(event.body);

  const { success, data, error } = schema.safeParse(body);

  if (!success) {
    return lambdaHttpResponse(401, {
      errors: error.issues.map(issue => ({
        field: issue.path.join('.'),
        error: issue.message,
      })),
    });
  }

  const { bucketName, key, uploadId, uploadedParts } = data;

  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: uploadedParts.map(({ eTag, partNumber }) => ({
        ETag: eTag,
        PartNumber: partNumber,
      })),
    },
  });

  await s3Client.send(command);

  return lambdaHttpResponse(204);

}
