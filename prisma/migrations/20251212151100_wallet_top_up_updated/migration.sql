/*
  Warnings:

  - You are about to drop the column `razorpayPaymentId` on the `WalletTopUp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WalletTopUp" DROP COLUMN "razorpayPaymentId",
ADD COLUMN     "attempts" INTEGER,
ADD COLUMN     "createdAtRazorpay" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "receipt" TEXT;
