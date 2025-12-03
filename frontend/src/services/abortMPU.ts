import { httpClient } from './httpClient';

interface IAbortMPUParams {
  bucketName: string;
  key: string;
  uploadId: string;
}

export async function abortMPU({ bucketName, key, uploadId }: IAbortMPUParams) {

  await httpClient.delete('/abort-mpu', {
    data: {
      bucketName,
      key,
      uploadId,
    },
  });
}
