/*
  Warnings:

  - Added the required column `availableStock` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Variant" ADD COLUMN     "availableStock" INTEGER NOT NULL;
