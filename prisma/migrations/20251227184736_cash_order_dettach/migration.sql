/*
  Warnings:

  - You are about to drop the column `orderId` on the `CashPayment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CashPayment" DROP CONSTRAINT "CashPayment_orderId_fkey";

-- DropIndex
DROP INDEX "CashPayment_orderId_key";

-- AlterTable
ALTER TABLE "CashPayment" DROP COLUMN "orderId";
