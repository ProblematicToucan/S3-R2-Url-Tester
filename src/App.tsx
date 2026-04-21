import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  File, 
  X, 
  Plus, 
  Trash2, 
  ExternalLink,
  RefreshCcw,
  LayoutGrid,
  History,
  BookOpen,
  Terminal,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadState, HttpMethod, HeaderPair } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('PUT');
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { key: 'Content-Type', value: '' }
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [responseInfo, setResponseInfo] = useState<{ status?: number; statusText?: string; data?: string; headers?: Record<string, string> } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      const ci = headers.findIndex(h => h.key.toLowerCase() === 'content-type');
      if (ci !== -1 && !headers[ci].value) {
        handleHeaderChange(ci, 'value', droppedFile.type);
      }
    }
  }, [headers]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const ci = headers.findIndex(h => h.key.toLowerCase() === 'content-type');
      if (ci !== -1 && !headers[ci].value) {
        handleHeaderChange(ci, 'value', selectedFile.type);
      }
    }
  };

  const handleUpload = async () => {
    if (!url || !file) return;

    setUploadState({ status: 'uploading', progress: 0 });
    setResponseInfo(null);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadState(prev => ({ ...prev, progress }));
      }
    });

    xhr.addEventListener('load', () => {
      const responseHeaders: Record<string, string> = {};
      xhr.getAllResponseHeaders().split('\r\n').forEach(line => {
        const [key, value] = line.split(': ');
        if (key) responseHeaders[key] = value;
      });

      setResponseInfo({
        status: xhr.status,
        statusText: xhr.statusText,
        data: xhr.responseText,
        headers: responseHeaders
      });

      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadState({ status: 'success', progress: 100, message: 'Upload completed successfully!' });
      } else {
        setUploadState({ 
          status: 'error', 
          progress: 0, 
          error: `Upload failed with status ${xhr.status}: ${xhr.statusText}`
        });
      }
    });

    xhr.addEventListener('error', () => {
      setUploadState({ status: 'error', progress: 0, error: 'Network error or CORS issue. Check browser console for details.' });
    });

    xhr.open(method, url, true);

    headers.forEach(h => {
      if (h.key && h.value) {
        xhr.setRequestHeader(h.key, h.value);
      }
    });

    xhr.send(file);
  };

  const reset = () => {
    setUploadState({ status: 'idle', progress: 0 });
    setResponseInfo(null);
    setFile(null);
  };

  return (
    <div className="flex h-screen w-full bg-brand-bg md:p-8 p-4 gap-8">
      {/* Sidebar - Clean Minimalism aside */}
      <aside className="w-72 hidden md:flex flex-col h-full shrink-0">
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Presign.Lab</h1>
          <p className="text-sm text-zinc-500">S3/R2 Endpoint Tester</p>
        </div>

        <div className="space-y-6 flex-1">
          <nav className="space-y-1">
            <button 
              onClick={reset}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium bg-white rounded-lg shadow-sm border border-black/5 hover:bg-zinc-50 transition-colors"
            >
              <Zap size={16} /> New Upload
            </button>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black transition-colors rounded-lg">
              <History size={16} /> History
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black transition-colors rounded-lg">
              <BookOpen size={16} /> Documentation
            </a>
          </nav>

          <div className="pt-6 border-t border-zinc-200">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Internal Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${uploadState.status === 'success' ? 'bg-[#10B981]' : uploadState.status === 'error' ? 'bg-[#FF3B30]' : 'bg-[#D1D1D1]'}`} />
                <div className="text-xs font-medium">
                  Status: {uploadState.status.toUpperCase()}
                  <div className="text-zinc-400 mt-0.5">Method: {method}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 bg-zinc-100 rounded-2xl text-[11px] text-zinc-500 leading-relaxed">
          Running on <strong>Node.js v20.x</strong><br />
          Runtime: Edge Functions
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="card p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Header Mobile Only */}
          <div className="md:hidden mb-2">
            <h1 className="text-xl font-semibold tracking-tight">Presign.Lab</h1>
            <p className="text-xs text-zinc-500">S3/R2 Endpoint Tester</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Presigned {method} URL</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-bucket.r2.cloudflarestorage.com/file.txt?X-Amz-Algorithm=..." 
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="w-24 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              >
                <option value="PUT">PUT</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">File Selection</label>
              {!file ? (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group rounded-2xl border-2 border-dashed border-zinc-200 hover:border-black hover:bg-zinc-50 flex flex-col items-center justify-center py-10 cursor-pointer transition-all"
                >
                  <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" />
                  <Upload className="w-6 h-6 mb-2 text-zinc-400 group-hover:text-black transition-colors" />
                  <span className="text-sm text-zinc-500 font-medium">Select or drop file</span>
                </div>
              ) : (
                <div className="bg-zinc-50 rounded-2xl p-6 flex flex-col justify-center gap-2 relative">
                  <button 
                    onClick={() => setFile(null)}
                    className="absolute top-3 right-3 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                  >
                    <X size={14} className="text-zinc-400" />
                  </button>
                  <div className="flex items-center gap-3">
                    <File className="text-zinc-600" size={20} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate leading-tight">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB • {file.type || 'unknown'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">HTTP Headers</label>
                <button 
                  onClick={handleAddHeader}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-zinc-100 rounded transition-colors"
                >
                  <Plus size={10} className="inline mr-1" /> Add
                </button>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 min-h-[112px] max-h-40 overflow-y-auto font-mono text-[12px] space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2 group">
                    <input 
                      className="bg-transparent border-0 p-0 text-zinc-600 focus:ring-0 w-24 shrink-0 font-bold" 
                      value={h.key} 
                      onChange={(e) => handleHeaderChange(i, 'key', e.target.value)}
                      placeholder="Header Key"
                    />
                    <span className="text-zinc-300">:</span>
                    <input 
                      className="bg-transparent border-0 p-0 text-zinc-400 focus:ring-0 flex-1" 
                      value={h.value}
                      onChange={(e) => handleHeaderChange(i, 'value', e.target.value)}
                      placeholder="Value"
                    />
                    <button onClick={() => handleRemoveHeader(i)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-black">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {headers.length === 0 && <p className="text-zinc-300 italic">No headers defined</p>}
              </div>
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!url || !file || uploadState.status === 'uploading'}
            className="w-full py-4 bg-black text-white rounded-xl font-medium tracking-tight hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-all shadow-lg shadow-black/10 active:scale-[0.99]"
          >
            {uploadState.status === 'uploading' ? `Uploading... ${uploadState.progress}%` : `Execute ${method} Request`}
          </button>
        </div>

        {/* Network Console Card */}
        <div className="flex-1 card p-0 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Network Console</h2>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                uploadState.status === 'success' ? 'bg-[#10B981] text-white' : 
                uploadState.status === 'error' ? 'bg-red-500 text-white' : 
                'bg-zinc-200 text-zinc-600'
              }`}>
                {uploadState.status === 'idle' ? 'READY' : uploadState.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-[12px] leading-relaxed bg-[#121212] text-zinc-300 overflow-y-auto">
            {!responseInfo && uploadState.status === 'idle' && (
              <div className="opacity-60">[00:00:00] <span className="text-[#10B981]">INFO</span> System initialized. Waiting for input...</div>
            )}
            
            {uploadState.status === 'uploading' && (
              <div className="animate-pulse">[T-NOW] <span className="text-blue-400">PENDING</span> Upload in progress: {uploadState.progress}%</div>
            )}

            {responseInfo && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span>
                  <span className={responseInfo.status && responseInfo.status < 300 ? 'text-[#10B981]' : 'text-red-400'}>
                    HTTP {responseInfo.status} {responseInfo.statusText}
                  </span>
                </div>
                
                <div className="mt-4">
                  <p className="text-zinc-500 mb-1">// Response Headers</p>
                  {Object.entries(responseInfo.headers || {}).map(([k, v]) => (
                    <div key={k} className="ml-4 flex gap-2">
                      <span className="text-zinc-500">{k}:</span>
                      <span className="text-zinc-100">{v}</span>
                    </div>
                  ))}
                </div>

                {responseInfo.data && (
                  <div className="mt-4">
                    <p className="text-zinc-500 mb-1">// Response Body</p>
                    <div className="ml-4 text-zinc-400 break-all whitespace-pre-wrap">
                      {responseInfo.data}
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadState.error && (
              <div className="text-red-400 mt-2">
                [ERROR] {uploadState.error}
              </div>
            )}
            
            <div className="mt-2 opacity-30 animate-pulse">_</div>
          </div>
        </div>
      </main>
    </div>
  );
}
