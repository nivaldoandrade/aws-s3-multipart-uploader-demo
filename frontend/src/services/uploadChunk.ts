import axios from 'axios';

interface IUploadChunkParams {
  url: string;
  chunk: Blob;
}

export async function uploadChunk({ chunk, url }: IUploadChunkParams) {

  const { headers } = await axios.put<null, { headers: { etag: string } }>(url, chunk);

  return headers.etag.replace(/"/g, '');
}
