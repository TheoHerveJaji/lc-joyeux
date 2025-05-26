import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

const MENU_FILE_PATH = join(process.cwd(), "public", "menu.pdf");

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

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Le fichier doit être un PDF" },
        { status: 400 }
      );
    }

    // Vérifier si un ancien menu existe et le supprimer
    try {
      await readFile(MENU_FILE_PATH);
      await unlink(MENU_FILE_PATH);
    } catch (error) {
      // Ignorer l'erreur si le fichier n'existe pas
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(MENU_FILE_PATH, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'upload du menu:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du menu" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fileExists = await readFile(MENU_FILE_PATH).catch(() => null);
    return NextResponse.json({
      exists: !!fileExists,
      url: fileExists ? "/menu.pdf" : null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du menu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du menu" },
      { status: 500 }
    );
  }
}
