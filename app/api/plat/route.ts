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
    const plats = await prisma.plat.findMany({
      orderBy: {
        position: "asc",
      },
      take: 2,
    });

    if (plats.length === 0) {
      return NextResponse.json({ error: "Aucun plat trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      plats,
      date: new Date().toISOString(),
      updatedAt: plats[0].createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des plats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des plats" },
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

    // Deuxième plat (optionnel)
    const nom2 = formData.get("nom2") as string;
    const description2 = formData.get("description2") as string;
    const tags2 = formData.get("tags2") as string;
    const file2 = formData.get("file2") as File;

    if (!nom || !description) {
      return NextResponse.json(
        { error: "Le nom et la description du premier plat sont requis" },
        { status: 400 }
      );
    }

    // Supprimer les anciens plats
    const oldPlats = await prisma.plat.findMany({
      orderBy: {
        position: "asc",
      },
      take: 2,
    });

    // Supprimer les anciennes images
    for (const oldPlat of oldPlats) {
      if (oldPlat?.fileUrl) {
        const oldImagePath = join(process.cwd(), "public", oldPlat.fileUrl);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }
    }

    // Supprimer les anciens plats de la base de données
    await prisma.plat.deleteMany({
      where: {
        id: {
          in: oldPlats.map((p) => p.id),
        },
      },
    });

    // Fonction helper pour uploader une image
    const uploadImage = async (file: File | null) => {
      if (!file) return null;

      const buffer = await file.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      const dataURI = `data:${file.type};base64,${base64String}`;
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "plats",
        resource_type: "image",
        type: "upload",
      });

      return {
        fileUrl: uploadResponse.secure_url,
        fileName: file.name,
        fileType: file.type,
      };
    };

    // Upload des images
    const image1 = await uploadImage(file);
    const image2 = nom2 ? await uploadImage(file2) : null;

    // Créer le premier plat
    const plat1 = await prisma.plat.create({
      data: {
        nom,
        description,
        tags: tags ? JSON.parse(tags) : [],
        fileUrl: image1?.fileUrl || null,
        fileName: image1?.fileName || null,
        fileType: image1?.fileType || null,
        position: 1,
      },
    });

    // Créer le deuxième plat si fourni
    let plat2 = null;
    if (nom2 && description2) {
      plat2 = await prisma.plat.create({
        data: {
          nom: nom2,
          description: description2,
          tags: tags2 ? JSON.parse(tags2) : [],
          fileUrl: image2?.fileUrl || null,
          fileName: image2?.fileName || null,
          fileType: image2?.fileType || null,
          position: 2,
        },
      });
    }

    return NextResponse.json({
      plats: plat2 ? [plat1, plat2] : [plat1],
      date: new Date().toISOString(),
      updatedAt: plat1.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la création des plats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des plats" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du plat est requis" },
        { status: 400 }
      );
    }

    // Récupérer le plat avant de le supprimer pour avoir l'URL de l'image
    const plat = await prisma.plat.findUnique({
      where: { id: parseInt(id) },
    });

    if (!plat) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    // Supprimer l'image si elle existe
    if (plat.fileUrl) {
      const oldImagePath = join(process.cwd(), "public", plat.fileUrl);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    // Supprimer le plat de la base de données
    await prisma.plat.delete({
      where: { id: parseInt(id) },
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du plat est requis" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { removeImage } = body;

    if (removeImage) {
      // Récupérer le plat avant de le modifier pour avoir l'URL de l'image
      const plat = await prisma.plat.findUnique({
        where: { id: parseInt(id) },
      });

      if (!plat) {
        return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
      }

      // Supprimer l'image si elle existe
      if (plat.fileUrl) {
        const oldImagePath = join(process.cwd(), "public", plat.fileUrl);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }

      // Mettre à jour le plat pour retirer l'image
      const updatedPlat = await prisma.plat.update({
        where: { id: parseInt(id) },
        data: {
          fileUrl: null,
          fileName: null,
          fileType: null,
        },
      });

      return NextResponse.json(updatedPlat);
    }

    return NextResponse.json(
      { error: "Opération non supportée" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la modification du plat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du plat" },
      { status: 500 }
    );
  }
}
