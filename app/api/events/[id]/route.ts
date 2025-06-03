import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const event = await prisma.event.update({
      where: {
        id: parseInt(params.id),
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
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(params.id),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
