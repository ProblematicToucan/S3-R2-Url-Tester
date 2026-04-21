export interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export type HttpMethod = 'PUT' | 'POST';

export interface HeaderPair {
  key: string;
  value: string;
}
