import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck } from 'react-icons/fi';
import { ProcessedData } from '@/types/common';
import Loading from './Loading';
import { apiService } from '@/services/api';

interface FileUploaderProps {
  onUpload: (data: ProcessedData, sourceType: string) => void;
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        const response = await apiService.uploadFile(file);
        onUpload(response.processed_data, 'file');
        setUploadedFiles(prev => [...prev, file]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt', '.log']
    },
    multiple: true
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop file upload area"
      >
        <input {...getInputProps()} aria-label="File input" />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop files here, or click to select files"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports CSV, JSON, XLSX, TXT, and LOG files
        </p>
      </div>

      {isUploading && (
        <div className="mt-4">
          <Loading message="Uploading files..." size="small" />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2" role="alert">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
          <ul className="space-y-2" role="list">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                role="listitem"
              >
                <FiFile className="h-4 w-4" aria-hidden="true" />
                <span>{file.name}</span>
                <FiCheck className="h-4 w-4 text-green-500 ml-auto" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 