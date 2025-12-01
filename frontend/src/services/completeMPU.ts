import { httpClient } from './httpClient';

interface ICompleteMPUParams {
  bucketName: string;
  key: string;
  uploadId: string;
  uploadedParts: {
    eTag: string;
    partNumber: number
  }[]
}

export async function completeMPU({ bucketName, key, uploadId, uploadedParts }: ICompleteMPUParams) {

  await httpClient.post('complete-mpu', {
    bucketName,
    key,
    uploadId,
    uploadedParts,
  });

}
