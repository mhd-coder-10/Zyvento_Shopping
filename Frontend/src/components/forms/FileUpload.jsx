import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';

const FileUpload = ({
    label,
    name,
    onChange,
    error,
    accept = 'image/*',
    multiple = false,
    maxSize = 5 * 1024 * 1024,
    required = false,
    disabled = false,
    className = '',
    value = [],
}) => {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState(value || []);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (selectedFiles) => {
        const validFiles = [];
        const errors = [];

        selectedFiles.forEach((file) => {
            if (file.size > maxSize) {
                errors.push(`${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
                return;
            }
            validFiles.push(file);
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        const newFiles = multiple ? [...files, ...validFiles] : validFiles;
        setFiles(newFiles);
        if (onChange) {
            onChange({ target: { name, files: newFiles } });
        }
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (onChange) {
            onChange({ target: { name, files: newFiles } });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6
                    ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                    transition-all duration-200
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={disabled ? undefined : handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    disabled={disabled}
                    className="hidden"
                />

                <div className="text-center">
                    <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                        {dragActive ? 'Drop files here' : 'Click or drag files to upload'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {accept.replace(/\*/g, '').toUpperCase()} up to {maxSize / 1024 / 1024}MB
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                                <div className="flex items-center space-x-2">
                                    <FiFile className="text-gray-400" />
                                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                                    <span className="text-xs text-gray-400">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (<p className="mt-1 text-sm text-red-600">{error}</p>)}
        </div>
    );
};

export default FileUpload;