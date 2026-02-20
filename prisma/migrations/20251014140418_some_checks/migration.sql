/*
  Warnings:

  - You are about to alter the column `address` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `deliveryInstructions` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `phNumber` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "address" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "deliveryInstructions" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "phNumber" SET DATA TYPE VARCHAR(15);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" VARCHAR(150);
