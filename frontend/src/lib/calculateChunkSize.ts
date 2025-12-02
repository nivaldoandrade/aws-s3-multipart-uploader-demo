const MB = 1024 * 1024;

const CHUNK_SIZES = {
  SMALL: 5 * MB,
  MEDIUM: 10 * MB,
  LARGE: 25 * MB,
  XLARGE: 55 * MB,
} as const;

const FILE_SIZE_LIMITS = {
  SMALL: 100 * MB, //100MB
  MEDIUM: 1 * 1024 * MB, //1GB
  LARGE: 10 * 1024 * MB,  //10GB
} as const;

export function calculateChunkSize(fileSize: number) {
  if (fileSize < FILE_SIZE_LIMITS.SMALL) {
    return CHUNK_SIZES.SMALL;
  }

  if (fileSize < FILE_SIZE_LIMITS.MEDIUM) {
    return CHUNK_SIZES.MEDIUM;
  }

  if (fileSize < FILE_SIZE_LIMITS.LARGE) {
    return CHUNK_SIZES.LARGE;
  }

  return CHUNK_SIZES.XLARGE;
}
