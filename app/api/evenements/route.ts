import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const event = await prisma.event.create({
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
