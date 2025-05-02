"use client";

import { useState, useRef, useEffect } from "react";
import {
  Cloud,
  X,
  Check,
  AlertCircle,
  FileText,
  Image,
  File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUploadCard() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Load files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem("uploadedFiles");
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("uploadedFiles", JSON.stringify(files));
  }, [files]);

  // Function to clean the URL by removing the async function
  const cleanUrl = (url) => {
    const cleanedUrl = url.replace(
      /s3\.async \(\) => {[^}]+}\.amazonaws\.com/,
      "s3.eu-central-1.amazonaws.com"
    );
    return cleanedUrl;
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <Image className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    else return (bytes / 1048576).toFixed(0) + " MB";
  };

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

  const uploadFile = async (file) => {
    setUploadStatus({
      type: "uploading",
      message: `Uploading ${file.name}...`,
    });
    console.log(`Starting upload for: ${file.name}`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      console.log("File uploaded successfully:", data);

      const cleanedUrl = cleanUrl(data.url);

      const successMessage = (
        <div className="space-y-2">
          <p className="text-green-600 font-medium">
            ✅ File "{data.fileName}" uploaded successfully!
          </p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">File URL:</p>
            <a
              href={cleanedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {cleanedUrl}
            </a>
          </div>
          <div className="text-sm text-gray-600">
            <p>File Details:</p>
            <ul className="list-disc list-inside">
              <li>Size: {formatFileSize(data.fileSize)}</li>
              <li>Type: {data.fileType}</li>
            </ul>
          </div>
        </div>
      );

      setUploadStatus({
        type: "success",
        message: successMessage,
      });

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: data.fileName || file.name,
        size: data.fileSize || file.size,
        type: data.fileType || file.type,
        progress: 100,
        completed: true,
        url: cleanedUrl,
        previewUrl: cleanedUrl,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus({
        type: "error",
        message: `❌ Upload failed: ${err.message}`,
      });
      return null;
    }
  };

  const handleFiles = async (fileList) => {
    const newFiles = [];

    for (const file of Array.from(fileList)) {
      const uploadedFile = await uploadFile(file);
      if (uploadedFile) {
        newFiles.push(uploadedFile);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      {/* Animated Clouds Background */}
      <div className="absolute h-screen inset-0 overflow-hidden pointer-events-none">
        {[
          // Left to right clouds
          { y: "5%", delay: 0, duration: 20, size: 24, direction: "left" },
          { y: "15%", delay: 0.5, duration: 25, size: 20, direction: "left" },
          { y: "25%", delay: 1, duration: 30, size: 28, direction: "left" },
          { y: "35%", delay: 1.5, duration: 35, size: 16, direction: "left" },
          { y: "45%", delay: 2, duration: 40, size: 32, direction: "left" },
          { y: "55%", delay: 2.5, duration: 45, size: 20, direction: "left" },
          { y: "65%", delay: 3, duration: 50, size: 24, direction: "left" },
          { y: "75%", delay: 3.5, duration: 55, size: 28, direction: "left" },
          { y: "85%", delay: 4, duration: 60, size: 16, direction: "left" },
          { y: "95%", delay: 4.5, duration: 65, size: 20, direction: "left" },
          // Right to left clouds
          { y: "10%", delay: 0.25, duration: 20, size: 20, direction: "right" },
          { y: "20%", delay: 0.75, duration: 25, size: 28, direction: "right" },
          { y: "30%", delay: 1.25, duration: 30, size: 16, direction: "right" },
          { y: "40%", delay: 1.75, duration: 35, size: 24, direction: "right" },
          { y: "50%", delay: 2.25, duration: 40, size: 20, direction: "right" },
          { y: "60%", delay: 2.75, duration: 45, size: 32, direction: "right" },
          { y: "70%", delay: 3.25, duration: 50, size: 16, direction: "right" },
          { y: "80%", delay: 3.75, duration: 55, size: 24, direction: "right" },
          { y: "90%", delay: 4.25, duration: 60, size: 28, direction: "right" },
        ].map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute text-gray-200 h-screen"
            initial={{
              x: cloud.direction === "left" ? "-100px" : "calc(100vw + 100px)",
              y: cloud.y,
              opacity: 0.6,
            }}
            animate={{
              x: cloud.direction === "left" ? "calc(100vw + 100px)" : "-100px",
              y: cloud.y,
              opacity: 0.6,
            }}
            transition={{
              duration: cloud.duration,
              delay: cloud.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Cloud className={`h-${cloud.size} w-${cloud.size}`} />
          </motion.div>
        ))}
      </div>

      <div className="h-full w-full flex p-8 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 overflow-y-auto"
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold text-gray-800 mb-4"
          >
            Uploaded Files
          </motion.h2>
          <div className="space-y-3">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {getFileIcon(file.type)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-1 text-xs text-gray-500"
                      >
                        <p>{formatFileSize(file.size)}</p>
                        <div className="flex justify-end">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 bg-blue-100 px-2 py-0.5 rounded hover:underline truncate"
                          >
                            View File
                          </a>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Deadline Lovers
            </h1>
            <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md shadow-xl rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm"
          >
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Upload Files
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop your files here or click to browse
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`mt-6 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
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
                <motion.div
                  animate={{ y: isDragging ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Cloud className="mx-auto h-16 w-16 text-blue-400" />
                </motion.div>
                <p className="mt-4 text-sm font-medium text-gray-600">
                  {isDragging
                    ? "Drop your files here"
                    : "Drag & Drop your files here"}
                </p>
                <p className="mt-1 text-xs text-gray-500">OR</p>
                <button
                  className="mt-3 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
              </motion.div>

              <AnimatePresence>
                {uploadStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 rounded-md p-3 ${
                      uploadStatus.type === "success"
                        ? "bg-green-50 text-green-800"
                        : uploadStatus.type === "error"
                        ? "bg-red-50 text-red-800"
                        : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    <div className="flex items-center">
                      {uploadStatus.type === "success" ? (
                        <Check className="mr-2 h-5 w-5" />
                      ) : uploadStatus.type === "error" ? (
                        <AlertCircle className="mr-2 h-5 w-5" />
                      ) : (
                        <Cloud className="mr-2 h-5 w-5 animate-pulse" />
                      )}
                      <div className="text-sm">{uploadStatus.message}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
