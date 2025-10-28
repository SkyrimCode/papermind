import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, acceptedTypes, label, uploadedFile }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: false,
  });

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${
          uploadedFile ? 'uploaded' : ''
        }`}
      >
        <input {...getInputProps()} />
        {uploadedFile ? (
          <div className="uploaded-file">
            <CheckCircle size={40} color="#10b981" />
            <div className="file-info">
              <FileText size={20} />
              <span>{uploadedFile.name}</span>
            </div>
          </div>
        ) : (
          <div className="upload-prompt">
            <Upload size={40} />
            <p>
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <span className="file-types">
              Supported: {Object.keys(acceptedTypes).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
