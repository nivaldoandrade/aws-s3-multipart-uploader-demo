import { sleep } from '@/lib/sleep';
import axios from 'axios';

interface IUploadChunkParams {
  url: string;
  chunk: Blob;
  maxRetry?: number
}
export async function uploadChunk({ chunk, url, maxRetry = 3 }: IUploadChunkParams) {
  try {
    const { headers } = await axios.put<null, { headers: { etag: string } }>(url, chunk);

    return headers.etag.replace(/"/g, '');
  } catch (error) {
    if (maxRetry > 0) {
      await sleep(2000);
      return uploadChunk({ chunk, url, maxRetry: maxRetry - 1 });
    }

    throw error;
  }
}
