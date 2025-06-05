import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("API: Error fetching events:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titre = formData.get("titre") as string;
    const date = formData.get("date") as string;
    const heure = formData.get("heure") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    if (!titre || !date || !heure || !description) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (file) {
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

    const event = await prisma.event.create({
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
    console.error("API: Error creating event:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
