import { NextResponse } from "next/server";
import { getContainerClient } from "@/lib/blob";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Aceitar apenas imagens (o input do frontend usa accept="image/*", mas o pedido pode vir de outro cliente)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image exceeds the 10 MB limit" }, { status: 413 });
    }

    // Gerar um nome único para o ficheiro para não haver colisões
    // (ficheiros sem extensão ficam com "jpg" em vez de repetir o nome original)
    const fileExtension = file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
      : "jpg";
    const blobName = `${crypto.randomUUID()}.${fileExtension || "jpg"}`;

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
