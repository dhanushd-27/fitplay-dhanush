-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('CREDIT', 'PURCHASE', 'REFUND');

-- AlterTable
ALTER TABLE "public"."TransactionLedger" ADD COLUMN     "transactionType" "public"."TransactionType";
