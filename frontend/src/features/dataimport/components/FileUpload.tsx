import React from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-dashed border-2 p-6 rounded-lg text-center ${
        isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-600 dark:text-gray-400">
        {isDragActive
          ? 'Datei hier ablegen...'
          : 'Datei hierher ziehen oder klicken, um eine CSV-, Word- oder PDF-Datei hochzuladen'}
      </p>
    </div>
  );
};

export default FileUpload;