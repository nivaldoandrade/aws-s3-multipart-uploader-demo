import { sleep } from '@/lib/sleep';
import axios from 'axios';

interface IUploadChunkParams {
  url: string;
  chunk: Blob;
  maxRetry?: number;
  partNumber: number;
  fileSize: number;
  uploadedBytesByPart: Map<number, number>;
  abortSignal: AbortSignal;
  onProgress: (percent: number) => void;
}
export async function uploadChunk({ chunk, url, maxRetry = 3, partNumber, fileSize, uploadedBytesByPart, abortSignal, onProgress }: IUploadChunkParams) {
  try {
    const { headers } = await axios
      .put<null, { headers: { etag: string } }>(url, chunk,
        {
          signal: abortSignal,
          onUploadProgress({ loaded }) {

            const previousLoaded = uploadedBytesByPart.get(partNumber) ?? 0;
            const currentLoaded = Math.max(previousLoaded, loaded);

            uploadedBytesByPart.set(partNumber, currentLoaded);

            let uploadedTotal = 0;

            uploadedBytesByPart.forEach(value => {
              uploadedTotal += value;
            });

            const nextPercent = Math.floor((uploadedTotal / fileSize) * 99);

            onProgress(nextPercent);
          },
        });

    return headers.etag.replace(/"/g, '');
  } catch (error) {
    if (maxRetry > 0) {
      await sleep(2000);
      return uploadChunk({
        chunk, url,
        fileSize,
        onProgress,
        partNumber,
        uploadedBytesByPart,
        abortSignal,
        maxRetry: maxRetry - 1,
      });
    }

    throw error;
  }
}
