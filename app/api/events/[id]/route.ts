import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const formData = await request.formData();
    const titre = formData.get("titre") as string;
    const date = formData.get("date") as string;
    const heure = formData.get("heure") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    if (!titre || !date || !heure || !description) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    let fileUrl = existingEvent.fileUrl;
    let fileName = existingEvent.fileName;
    let fileType = existingEvent.fileType;

    if (removeImage) {
      fileUrl = null;
      fileName = null;
      fileType = null;
    } else if (file) {
      const buffer = await file.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      const dataURI = `data:${file.type};base64,${base64String}`;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "events",
        resource_type: "image",
        type: "upload",
      });

      fileUrl = uploadResponse.secure_url;
      fileName = file.name;
      fileType = file.type;
    }

    const event = await prisma.event.update({
      where: {
        id: parseInt(id),
      },
      data: {
        titre,
        date: new Date(date),
        heure,
        description,
        fileUrl,
        fileName,
        fileType,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
