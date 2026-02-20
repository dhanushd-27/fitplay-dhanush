-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isDemoOrder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TransactionLedger" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;
