/*
  Warnings:

  - You are about to drop the column `fileData` on the `Menu` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "fileData",
ADD COLUMN     "fileUrl" TEXT NOT NULL;
