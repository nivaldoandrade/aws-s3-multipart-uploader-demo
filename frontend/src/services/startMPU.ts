import { httpClient } from './httpClient';

interface IStartMPUParams {
  filename: string
  totalChunks: number
}

interface IResponse {
  bucket: string;
  key: string;
  uploadId: string;
  urls: {
    url: string;
    partNumber: string;
  }[];
}

export async function startMPU({ filename, totalChunks }: IStartMPUParams) {
  const { data } = await httpClient.post<IResponse>('/create-mpu', {
    filename,
    totalChunks,
  });

  return {
    ...data,
  };

}
