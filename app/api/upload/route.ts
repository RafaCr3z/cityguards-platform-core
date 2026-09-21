import { NextResponse } from "next/server";
import { getContainerClient } from "@/lib/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Gerar um nome único para o ficheiro para não haver colisões
    const fileExtension = file.name.split('.').pop();
    const blobName = `${crypto.randomUUID()}.${fileExtension}`;

    // Obter o container client do Azure
    const containerClient = getContainerClient("occurrences-photos");
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Transformar o ficheiro num array buffer e fazer upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    // Construir a URL pública (O container no Azure deve estar com Public Access Level = Blob)
    const imageUrl = blockBlobClient.url;

    return NextResponse.json({ url: imageUrl }, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading image to blob storage:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
