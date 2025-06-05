import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = parseInt(pathname.split("/").pop() || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const plat = await prisma.plat.findUnique({
      where: { id },
    });

    if (!plat) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    // Supprimer le fichier image si présent
    if (plat.fileUrl) {
      const oldImagePath = join(process.cwd(), "public", plat.fileUrl);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    await prisma.plat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du plat" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = parseInt(pathname.split("/").pop() || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();
    const { removeImage } = body;

    if (!removeImage) {
      return NextResponse.json(
        { error: "Opération non supportée" },
        { status: 400 }
      );
    }

    const plat = await prisma.plat.findUnique({
      where: { id },
    });

    if (!plat) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    if (plat.fileUrl) {
      const oldImagePath = join(process.cwd(), "public", plat.fileUrl);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    const updatedPlat = await prisma.plat.update({
      where: { id },
      data: {
        fileUrl: null,
        fileName: null,
        fileType: null,
      },
    });

    return NextResponse.json(updatedPlat);
  } catch (error) {
    console.error("Erreur lors de la modification du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du plat" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = parseInt(pathname.split("/").pop() || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const formData = await request.formData();
    const nom = formData.get("nom") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const file = formData.get("file") as File | null;

    if (!nom || !description) {
      return NextResponse.json(
        { error: "Le nom et la description sont requis" },
        { status: 400 }
      );
    }

    const existingPlat = await prisma.plat.findUnique({
      where: { id },
    });

    if (!existingPlat) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    let fileUrl = existingPlat.fileUrl;
    let fileName = existingPlat.fileName;
    let fileType = existingPlat.fileType;

    if (file) {
      if (existingPlat.fileUrl) {
        const oldImagePath = join(
          process.cwd(),
          "public",
          existingPlat.fileUrl
        );
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }

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

    const updatedPlat = await prisma.plat.update({
      where: { id },
      data: {
        nom,
        description,
        tags: tags ? JSON.parse(tags) : [],
        fileUrl,
        fileName,
        fileType,
      },
    });

    return NextResponse.json(updatedPlat);
  } catch (error) {
    console.error("Erreur lors de la modification du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du plat" },
      { status: 500 }
    );
  }
}
