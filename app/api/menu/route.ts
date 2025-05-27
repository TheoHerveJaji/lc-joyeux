import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    console.log("Type de fichier reçu:", file.type);
    console.log("Taille du fichier:", file.size);

    // Supprimer l'ancien menu s'il existe
    await prisma.menu.deleteMany();

    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `menu_${timestamp}.pdf`;
    const menusDir = join(process.cwd(), "public", "menus");
    const filePath = join(menusDir, fileName);

    // Créer le dossier menus s'il n'existe pas
    if (!existsSync(menusDir)) {
      await mkdir(menusDir, { recursive: true });
    }

    // Convertir le fichier en buffer et l'écrire dans le dossier public
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(buffer));

    // Créer l'entrée dans la base de données
    const menu = await prisma.menu.create({
      data: {
        fileUrl: `/menus/${fileName}`,
        fileName: file.name,
        fileType: file.type,
      },
    });

    console.log("Menu créé dans la base de données:", menu);

    return NextResponse.json({
      success: true,
      id: menu.id,
      url: `/menus/${fileName}`,
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
