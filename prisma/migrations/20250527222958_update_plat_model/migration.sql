/*
  Warnings:

  - You are about to drop the column `image` on the `Plat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plat" DROP COLUMN "image",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT;
