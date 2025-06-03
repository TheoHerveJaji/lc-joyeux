import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const plat = await prisma.plat.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!plat) {
      return NextResponse.json({ error: "Aucun plat trouvé" }, { status: 404 });
    }

    return NextResponse.json(plat);
  } catch (error) {
    console.error("Erreur lors de la récupération du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du plat" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nom = formData.get("nom") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const file = formData.get("file") as File;

    if (!nom || !description) {
      return NextResponse.json(
        { error: "Le nom et la description sont requis" },
        { status: 400 }
      );
    }

    // Supprimer l'ancien plat s'il existe
    const oldPlat = await prisma.plat.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (oldPlat?.fileUrl) {
      // Supprimer l'ancienne image locale (optionnel, car on passe sur Cloudinary)
      const oldImagePath = join(process.cwd(), "public", oldPlat.fileUrl);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (file) {
      // Upload sur Cloudinary
      const buffer = await file.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      const dataURI = `data:${file.type};base64,${base64String}`;
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "plats",
        resource_type: "image",
        type: "upload",
      });
      fileUrl = uploadResponse.secure_url;
      fileName = file.name;
      fileType = file.type;
    }

    const plat = await prisma.plat.create({
      data: {
        nom,
        description,
        tags: tags ? JSON.parse(tags) : [],
        fileUrl,
        fileName,
        fileType,
      },
    });

    return NextResponse.json(plat);
  } catch (error) {
    console.error("Erreur lors de la création du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du plat" },
      { status: 500 }
    );
  }
}
