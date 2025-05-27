/*
  Warnings:

  - Changed the type of `fileData` on the `Menu` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "fileData",
ADD COLUMN     "fileData" BYTEA NOT NULL;
