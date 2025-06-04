import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Supprimer l'ancien menu s'il existe
    await prisma.menu.deleteMany();

    // Convertir le fichier en buffer
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload vers Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "menus",
      resource_type: "auto",
      type: "upload",
      format: "pdf",
    });

    // Créer l'entrée dans la base de données
    const menu = await prisma.menu.create({
      data: {
        fileUrl: uploadResponse.secure_url,
        fileName: file.name,
        fileType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      id: menu.id,
      url: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error("Erreur détaillée lors de l'upload du menu:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'upload du menu",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const menu = await prisma.menu.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Aucun menu trouvé" }, { status: 404 });
    }

    return NextResponse.json({ url: menu.fileUrl });
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération du menu:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du menu",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
