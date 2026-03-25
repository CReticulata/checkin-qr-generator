'use client';

import { useState, useCallback, useRef } from 'react';

export default function AdminUploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        setUploadResult({
          success: false,
          message: '請選擇 CSV 檔案',
        });
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadResult(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message || '上傳成功',
        });
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh page to update participant count
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setUploadResult({
          success: false,
          message: data.error || '上傳失敗',
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: '網路錯誤，請稍後再試',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-gray-700 mb-3">上傳參與者 CSV</h2>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFile ? (
          <div>
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-800 font-medium">{selectedFile.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600">
              拖放 CSV 檔案到這裡，或點擊選擇檔案
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`
          mt-4 w-full py-3 rounded-lg font-medium transition-colors
          ${selectedFile && !isUploading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isUploading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            上傳中...
          </span>
        ) : (
          '上傳 CSV'
        )}
      </button>

      {/* Upload Result */}
      {uploadResult && (
        <div
          className={`
            mt-4 p-4 rounded-lg
            ${uploadResult.success
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
            }
          `}
        >
          {uploadResult.success ? '✓ ' : '✗ '}
          {uploadResult.message}
        </div>
      )}
    </div>
  );
}
