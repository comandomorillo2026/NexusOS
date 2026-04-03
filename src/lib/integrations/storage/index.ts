// Storage Integration Types
export type StorageProvider = 'google_drive' | 'dropbox' | 'onedrive' | 's3';

export interface StorageConfig {
  provider: StorageProvider;
  accessToken: string;
  refreshToken?: string;
  rootFolderId?: string;
  rootFolderName?: string;
}

export interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink?: string;
  downloadLink?: string;
  thumbnailLink?: string;
  createdTime?: Date;
  modifiedTime?: Date;
  parentId?: string;
}

export interface StorageFolder {
  id: string;
  name: string;
  parentId?: string;
  childCount?: number;
}

// Storage service stub - implement based on provider
export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async listFiles(folderId?: string): Promise<StorageFile[]> {
    // Implementation depends on provider
    console.log(`Listing files in folder: ${folderId || 'root'}`);
    return [];
  }

  async uploadFile(file: File, folderId?: string): Promise<StorageFile | null> {
    console.log(`Uploading file: ${file.name} to folder: ${folderId || 'root'}`);
    return null;
  }

  async downloadFile(fileId: string): Promise<Blob | null> {
    console.log(`Downloading file: ${fileId}`);
    return null;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    console.log(`Deleting file: ${fileId}`);
    return true;
  }

  async createFolder(name: string, parentId?: string): Promise<StorageFolder | null> {
    console.log(`Creating folder: ${name} in parent: ${parentId || 'root'}`);
    return null;
  }

  async getStorageUsage(): Promise<{ used: number; limit: number }> {
    return { used: 0, limit: 15 * 1024 * 1024 * 1024 }; // 15GB default
  }
}

export default StorageService;
