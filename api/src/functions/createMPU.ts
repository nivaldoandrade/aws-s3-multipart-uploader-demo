import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as z from 'zod/mini';
import { env } from '../config/env';
import { createMultipartUpload } from '../services/createMultipartUpload';
import { generateSignedUrl } from '../services/generateSignedUrl';
import { bodyParser } from '../utils/bodyParser';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

const schema = z.object({
  filename: z.string().check(
    z.trim(),
    z.minLength(1, '\'filename\' is required'),
  ),
  totalChunks: z.number('Expected number').check(
    z.gte(1, '\'totalChunks\' must be between 1 and 10000'),
    z.lte(10000, '\'totalChunks\' must be between 1 and 10000'),
  ),
});

export async function handler(event: APIGatewayProxyEventV2) {
  try {
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

    const { filename, totalChunks } = data;

    const bucket = env.FILE_BUCKET_NAME;
    const key = `${Date.now()}-${filename}`;

    const uploadId = await createMultipartUpload({ bucket, key });

    const urls = await generateSignedUrl({ bucket, key, totalChunks, uploadId });

    return lambdaHttpResponse(201, {
      bucket,
      key,
      uploadId,
      urls,
    });
  } catch (error) {
    if (error && (typeof error === 'object' && 'statusCode' in error)) {
      return error;
    }

    console.log(error);

    return lambdaHttpResponse(500, {
      error: 'INTERNAL SERVER ERROR.',
    });
  }
}
