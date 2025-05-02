"use client";

import { useState, useRef } from "react";
import { Cloud, X, Check } from "lucide-react";

export default function FileUploadCard() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: Math.floor(Math.random() * 100), // Simulate random progress for demo
      completed: file.size < 500000, // Simulate completed for small files
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500 text-white">
          PDF
        </div>
      );
    } else if (fileType.includes("text")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500 text-white">
          TXT
        </div>
      );
    } else {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-500 text-white">
          FILE
        </div>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    else return (bytes / 1048576).toFixed(0) + " MB";
  };

  return (
    <div className="w-full max-w-md shadow-xl rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">UPLOAD FILES</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload documents you want to share with your team.
          </p>
        </div>

        <div
          className={`mt-6 cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInput}
            multiple
          />
          <Cloud className="mx-auto h-12 w-12 text-blue-300" />
          <p className="mt-2 text-sm text-gray-600">
            Drag & Drop your files here
          </p>
          <p className="mt-1 text-xs text-gray-500">OR</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm text-gray-500">Uploaded files</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {file.name}
                      </p>
                      {file.completed ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-xs text-gray-400">
                          {file.progress}%
                        </span>
                      )}
                    </div>
                    {!file.completed && (
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                    {file.completed && (
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
