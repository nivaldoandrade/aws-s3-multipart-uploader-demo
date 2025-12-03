import { useState, type ChangeEvent } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { calculateChunkSize } from './lib/calculateChunkSize';
import { abortMPU } from './services/abortMPU';
import { completeMPU } from './services/completeMPU';
import { startMPU } from './services/startMPU';
import { uploadChunk } from './services/uploadChunk';

function App() {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File>();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    const chunksSize = calculateChunkSize(selectedFile.size);
    const totalChunks = Math.ceil(selectedFile.size / chunksSize);

    let bucketName: string | undefined;
    let uploadId: string | undefined;
    let key: string | undefined;

    try {
      const result = await startMPU({
        filename: selectedFile.name,
        totalChunks,
      });

      const { urls } = result;
      bucketName = result.bucket;
      uploadId = result.uploadId;
      key = result.key;

      const uploadedBytesByPart = new Map<number, number>();

      const uploadedParts = await Promise.all(
        urls.map(async ({ url, partNumber }, index) => {
          const partCount = index;

          const start = partCount * chunksSize;
          const end = start + chunksSize;

          const currentChunk = selectedFile.slice(start, end);

          const eTag = await uploadChunk({
            url,
            chunk: currentChunk,
            fileSize: selectedFile.size,
            partNumber,
            uploadedBytesByPart,
            onProgress(percent) {
              setProgress(percent);
            },
          });

          return {
            eTag,
            partNumber,
          };
        }),
      );

      await completeMPU({
        bucketName,
        key,
        uploadId,
        uploadedParts,
      });

      setProgress(100);
    } catch {
      if (key && uploadId && bucketName) {
        await abortMPU({ bucketName, key, uploadId });
      }
    }
  }

  return (
    <div className='min-h-svh flex items-center justify-center'>
      <div className='w-full max-w-2xl my-10 px-4'>
        <h1 className='text-center sm:text-left text-4xl tracking-tighter'>
          Selecione um arquivo: {progress}
        </h1>
        <form className='space-y-4 mt-5' onSubmit={handleUpload}>
          <Input
            className='cursor-pointer'
            type='file'
            onChange={handleFileChange}
          />
          <Button
            className='w-full cursor-pointer'
            type='submit'
          >
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default App;
