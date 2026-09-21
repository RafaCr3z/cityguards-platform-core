import { BlobServiceClient } from "@azure/storage-blob";

// A string de conexão deve ser obtida no Azure Portal -> Storage Account -> Access Keys
const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING || "";

// Evitamos inicializar se a connection string estiver vazia (ex: no build time)
export const blobServiceClient = connectionString 
  ? BlobServiceClient.fromConnectionString(connectionString)
  : null;

export const getContainerClient = (containerName: string) => {
  if (!blobServiceClient) {
    throw new Error("Azure Blob Storage Connection String is not configured");
  }
  return blobServiceClient.getContainerClient(containerName);
};
