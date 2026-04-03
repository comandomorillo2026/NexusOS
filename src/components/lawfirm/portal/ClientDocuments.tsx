'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Search,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Calendar,
  Folder,
  ChevronRight,
  X,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  category: string;
  fileSize: number;
  mimeType: string;
  documentDate: string;
  description?: string;
  fileUrl: string;
}

interface ClientDocumentsProps {
  documents: Document[];
  onDownload: (docId: string) => void;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Case Documents',
    search: 'Search documents...',
    noDocuments: 'No documents available',
    noResults: 'No documents match your search',
    categories: {
      all: 'All',
      pleadings: 'Pleadings',
      discovery: 'Discovery',
      correspondence: 'Correspondence',
      contracts: 'Contracts',
      court_filings: 'Court Filings',
      evidence: 'Evidence',
      other: 'Other',
    },
    download: 'Download',
    view: 'View',
    fileSize: 'Size',
    date: 'Date',
    category: 'Category',
    bytes: 'bytes',
    kb: 'KB',
    mb: 'MB',
  },
  es: {
    title: 'Documentos del Caso',
    search: 'Buscar documentos...',
    noDocuments: 'No hay documentos disponibles',
    noResults: 'No hay documentos que coincidan con su búsqueda',
    categories: {
      all: 'Todos',
      pleadings: 'Escritos',
      discovery: 'Descubrimiento',
      correspondence: 'Correspondencia',
      contracts: 'Contratos',
      court_filings: 'Presentaciones Judiciales',
      evidence: 'Evidencia',
      other: 'Otros',
    },
    download: 'Descargar',
    view: 'Ver',
    fileSize: 'Tamaño',
    date: 'Fecha',
    category: 'Categoría',
    bytes: 'bytes',
    kb: 'KB',
    mb: 'MB',
  },
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return FileArchive;
  return FileText;
};

const formatFileSize = (bytes: number, t: typeof translations.en) => {
  if (bytes === 0) return `0 ${t.bytes}`;
  const k = 1024;
  const sizes = [t.bytes, t.kb, t.mb];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    pleadings: 'bg-blue-100 text-blue-700',
    discovery: 'bg-purple-100 text-purple-700',
    correspondence: 'bg-green-100 text-green-700',
    contracts: 'bg-orange-100 text-orange-700',
    court_filings: 'bg-red-100 text-red-700',
    evidence: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || colors.other;
};

export function ClientDocuments({ documents, onDownload, language = 'en' }: ClientDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const t = translations[language];

  // Get unique categories
  const categories = ['all', ...new Set(documents.map(d => d.category))];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat 
              ? 'bg-[#1E3A5F] hover:bg-[#2C4A6F]' 
              : 'border-gray-200'
            }
          >
            {t.categories[cat as keyof typeof t.categories] || cat}
          </Button>
        ))}
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {documents.length === 0 ? t.noDocuments : t.noResults}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredDocuments.map(doc => {
            const FileIcon = getFileIcon(doc.mimeType);
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-6 h-6 text-[#1E3A5F]" />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(doc.fileSize, t)}</span>
                        <span>•</span>
                        <span>{doc.documentDate}</span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{doc.description}</p>
                      )}
                    </div>

                    {/* Category Badge */}
                    <Badge className={`${getCategoryColor(doc.category)} hidden sm:inline-flex`}>
                      {t.categories[doc.category as keyof typeof t.categories] || doc.category}
                    </Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewDoc(doc)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(doc.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4 text-[#C4A35A]" />
                      </Button>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5 text-[#1E3A5F]" />
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewDoc && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">{t.category}</p>
                  <p className="font-medium">{t.categories[previewDoc.category as keyof typeof t.categories] || previewDoc.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.fileSize}</p>
                  <p className="font-medium">{formatFileSize(previewDoc.fileSize, t)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.date}</p>
                  <p className="font-medium">{previewDoc.documentDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-medium">{previewDoc.mimeType}</p>
                </div>
              </div>

              {/* Preview Area */}
              <div className="border rounded-lg p-8 bg-gray-50 min-h-[300px] flex items-center justify-center">
                {previewDoc.mimeType.startsWith('image/') ? (
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <File className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Preview not available for this file type</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </Button>
                <Button 
                  className="bg-[#C4A35A] hover:bg-[#B8943D]"
                  onClick={() => {
                    onDownload(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.download}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientDocuments;
