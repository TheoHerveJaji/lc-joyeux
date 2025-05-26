import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plat = await prisma.plat.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(
      plat || {
        nom: "",
        description: "",
        tags: [],
        image: "",
        createdAt: null,
        updatedAt: null,
        id: null,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du plat" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const plat = await prisma.plat.create({
      data: {
        nom: data.nom,
        description: data.description,
        tags: data.tags,
        image: data.image,
      },
    });
    return NextResponse.json(plat);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du plat" },
      { status: 500 }
    );
  }
}
