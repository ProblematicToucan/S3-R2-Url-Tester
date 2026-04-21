# S3/R2 Presigned URL Tester

A minimalist, high-performance developer tool for testing and debugging presigned URLs for object storage services like Amazon S3 and Cloudflare R2.

## Features

- **Direct Browser Upload**: Files are sent directly from your browser to the presigned URL using `XMLHttpRequest`.
- **Method Support**: Toggle between `PUT` and `POST` requests.
- **Custom Headers**: Add required S3 headers (e.g., `Content-Type`, `x-amz-acl`) easily.
- **Network Console**: View real-time logs, response headers, and raw body data from the storage endpoint.
- **Clean Minimalism Design**: Focused, distraction-free interface built with Tailwind CSS and Framer Motion.

## How to Use

1. **Paste URL**: Enter your full presigned URL in the top input field.
2. **Select Method**: Choose `PUT` (most common) or `POST` based on how your URL was generated.
3. **Add Headers**: If your storage provider requires specific headers (like `Content-Type` matching the signature), add them in the headers section.
4. **Drop File**: Drag and drop the file you wish to upload.
5. **Execute**: Click "Execute Request" and monitor the **Network Console** for the result.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Framer Motion.
- **Backend**: Express (serving static assets).
- **Runtime**: Node.js v20.x.

## Security Note

This tool executes requests directly in your browser. Ensure you only use trusted presigned URLs. The application does not store or proxy your files—they go straight to your bucket.
