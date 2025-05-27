import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
      // Supprimer l'ancienne image
      const oldImagePath = join(process.cwd(), "public", oldPlat.fileUrl);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (file) {
      // Créer un nom de fichier unique
      const timestamp = Date.now();
      fileName = `plat_${timestamp}.${file.type.split("/")[1]}`;
      const filePath = join(process.cwd(), "public", "plats", fileName);

      // Convertir le fichier en buffer et l'écrire dans le dossier public
      const buffer = await file.arrayBuffer();
      await writeFile(filePath, new Uint8Array(buffer));
      fileUrl = `/plats/${fileName}`;
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
