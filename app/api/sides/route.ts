import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/sides
export async function GET() {
  try {
    const sides = await prisma.side.findMany({
      orderBy: {
        category: "asc",
      },
    });
    return NextResponse.json(sides);
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération des sides:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des sides",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/sides
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { description, category } = await request.json();

    if (!description || !category) {
      return NextResponse.json(
        { error: "Description et catégorie requises" },
        { status: 400 }
      );
    }

    const side = await prisma.side.create({
      data: {
        description,
        category,
      },
    });
    return NextResponse.json(side);
  } catch (error) {
    console.error("Erreur détaillée lors de la création du side:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du side",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/sides/:id
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id, description } = await request.json();

    if (!id || !description) {
      return NextResponse.json(
        { error: "ID et description requis" },
        { status: 400 }
      );
    }

    const side = await prisma.side.update({
      where: { id },
      data: { description },
    });
    return NextResponse.json(side);
  } catch (error) {
    console.error("Erreur détaillée lors de la mise à jour du side:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour du side",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sides/:id
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await prisma.side.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur détaillée lors de la suppression du side:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression du side",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
