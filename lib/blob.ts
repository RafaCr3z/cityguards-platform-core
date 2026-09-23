import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

/**
 * Azure Blob Storage Client Factory
 * Supports:
 * 1. Zero-Keys / Azure Managed Identity (via AZURE_BLOB_SERVICE_URL & DefaultAzureCredential)
 * 2. Development Connection String Fallback (via BLOB_STORAGE_CONNECTION_STRING)
 */
const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING || "";
const blobServiceUrl = process.env.AZURE_BLOB_SERVICE_URL || "";

function initBlobClient(): BlobServiceClient | null {
  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }
  
  if (blobServiceUrl) {
    try {
      // Dynamic import or fallback for managed identity / anonymous client
      const { DefaultAzureCredential } = require("@azure/identity");
      return new BlobServiceClient(blobServiceUrl, new DefaultAzureCredential());
    } catch {
      return new BlobServiceClient(blobServiceUrl);
    }
  }

  return null;
}

export const blobServiceClient = initBlobClient();

export const getContainerClient = (containerName: string) => {
  if (!blobServiceClient) {
    throw new Error("Azure Blob Storage is not configured (missing AZURE_BLOB_SERVICE_URL or BLOB_STORAGE_CONNECTION_STRING)");
  }
  return blobServiceClient.getContainerClient(containerName);
};
