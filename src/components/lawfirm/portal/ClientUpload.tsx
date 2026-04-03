'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileArchive,
  X,
  CheckCircle,
  AlertCircle,
  CloudUpload,
  Folder,
  Trash2,
} from 'lucide-react';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface ClientUploadProps {
  onUpload: (files: File[], category: string, description: string) => Promise<void>;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Upload Documents',
    dropzone: 'Drag & drop files here or click to browse',
    maxSize: 'Maximum file size',
    maxFiles: 'Maximum files per upload',
    supportedTypes: 'Supported file types',
    category: 'Document Category',
    categoryPlaceholder: 'Select a category',
    description: 'Description (optional)',
    descriptionPlaceholder: 'Add notes about these documents...',
    upload: 'Upload Documents',
    uploading: 'Uploading...',
    uploadingFiles: 'Uploading files...',
    success: 'Upload complete!',
    error: 'Upload failed. Please try again.',
    noFiles: 'No files selected',
    categories: {
      general: 'General',
      evidence: 'Evidence',
      correspondence: 'Correspondence',
      contracts: 'Contracts',
      identification: 'Identification',
      financial: 'Financial Documents',
      medical: 'Medical Records',
      other: 'Other',
    },
    remove: 'Remove',
    clear: 'Clear All',
    dragActive: 'Drop files here...',
    successMessage: 'Your documents have been securely uploaded and sent to your attorney.',
  },
  es: {
    title: 'Subir Documentos',
    dropzone: 'Arrastre y suelte archivos aquí o haga clic para explorar',
    maxSize: 'Tamaño máximo de archivo',
    maxFiles: 'Máximo de archivos por carga',
    supportedTypes: 'Tipos de archivo soportados',
    category: 'Categoría del Documento',
    categoryPlaceholder: 'Seleccione una categoría',
    description: 'Descripción (opcional)',
    descriptionPlaceholder: 'Agregue notas sobre estos documentos...',
    upload: 'Subir Documentos',
    uploading: 'Subiendo...',
    uploadingFiles: 'Subiendo archivos...',
    success: '¡Carga completa!',
    error: 'Error al subir. Por favor intente nuevamente.',
    noFiles: 'No hay archivos seleccionados',
    categories: {
      general: 'General',
      evidence: 'Evidencia',
      correspondence: 'Correspondencia',
      contracts: 'Contratos',
      identification: 'Identificación',
      financial: 'Documentos Financieros',
      medical: 'Registros Médicos',
      other: 'Otros',
    },
    remove: 'Eliminar',
    clear: 'Limpiar Todo',
    dragActive: 'Suelte los archivos aquí...',
    successMessage: 'Sus documentos han sido subidos de forma segura y enviados a su abogado.',
  },
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return FileArchive;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function ClientUpload({
  onUpload,
  allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip'],
  maxFileSize = 10,
  maxFiles = 5,
  language = 'en',
}: ClientUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const t = translations[language];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `${t.maxSize}: ${maxFileSize}MB`;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(extension)) {
      return `${t.supportedTypes}: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const currentCount = files.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      return;
    }

    const filesToAdd = fileArray.slice(0, availableSlots).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
      error: validateFile(file) || undefined,
    }));

    setFiles(prev => [...prev, ...filesToAdd]);
    setUploadComplete(false);
  }, [files.length, maxFileSize, maxFiles, allowedTypes, t]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearFiles = () => {
    setFiles([]);
    setCategory('');
    setDescription('');
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !category) return;

    setIsUploading(true);
    setUploadComplete(false);

    try {
      // Simulate upload progress
      for (let i = 0; i < files.length; i++) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
        ));

        // Simulate progress
        for (let p = 0; p <= 100; p += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: p } : f
          ));
        }

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success', progress: 100 } : f
        ));
      }

      await onUpload(files.map(f => f.file), category, description);
      setUploadComplete(true);
    } catch (error) {
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const validFiles = files.filter(f => !f.error);
  const hasErrors = files.some(f => f.error);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-[#C4A35A] transition-colors">
        <CardContent className="p-0">
          <div
            className={`p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-[#C4A35A]/10' : 'bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />

            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDragActive ? 'bg-[#C4A35A]' : 'bg-[#1E3A5F]/10'
            } transition-colors`}>
              {isDragActive ? (
                <CloudUpload className="w-8 h-8 text-white" />
              ) : (
                <Upload className="w-8 h-8 text-[#1E3A5F]" />
              )}
            </div>

            <p className={`font-medium mb-2 ${isDragActive ? 'text-[#C4A35A]' : 'text-gray-700'}`}>
              {isDragActive ? t.dragActive : t.dropzone}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>{t.maxSize}: {maxFileSize}MB</span>
              <span>•</span>
              <span>{t.maxFiles}: {maxFiles}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t.uploadingFiles} ({files.length}/{maxFiles})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t.clear}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map(uploadingFile => {
              const FileIcon = getFileIcon(uploadingFile.file.type);
              return (
                <div
                  key={uploadingFile.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-[#1E3A5F]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{uploadingFile.file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(uploadingFile.file.size)}</p>

                    {/* Progress Bar */}
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="h-1 mt-2" />
                    )}

                    {/* Error */}
                    {uploadingFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadingFile.error && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  {/* Remove Button */}
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadingFile.id)}
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Category and Description */}
      {files.length > 0 && !uploadComplete && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700">{t.category} *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t.categoryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.categories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">{t.description}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                disabled={isUploading}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {uploadComplete && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-green-700">{t.success}</p>
            <p className="text-sm text-green-600 mt-1">{t.successMessage}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFiles}
            >
              {language === 'en' ? 'Upload More Documents' : 'Subir Más Documentos'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploadComplete && (
        <Button
          className="w-full bg-[#C4A35A] hover:bg-[#B8943D] py-6"
          onClick={handleUpload}
          disabled={isUploading || hasErrors || !category || validFiles.length === 0}
        >
          {isUploading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              {t.uploading}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t.upload}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default ClientUpload;
