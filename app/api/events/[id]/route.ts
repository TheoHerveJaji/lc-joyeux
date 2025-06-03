import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const data = await request.json();

    const event = await prisma.event.update({
      where: {
        id: parseInt(id),
      },
      data: {
        titre: data.titre,
        date: new Date(data.date),
        heure: data.heure,
        description: data.description,
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
