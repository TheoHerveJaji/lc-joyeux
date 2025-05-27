import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "admin@cafejoyeux.com";
  const password = "admin123"; // À changer en production !
  const name = "Admin Café Joyeux";

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Un utilisateur admin existe déjà avec cet email");
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log("Utilisateur admin créé avec succès !");
    console.log("Email:", email);
    console.log("Mot de passe:", password);
    console.log("ID:", admin.id);
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
