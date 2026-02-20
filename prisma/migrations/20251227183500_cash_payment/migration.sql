-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isCashPayment" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "CashPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "receipt" TEXT,
    "attempts" INTEGER,
    "createdAtRazorpay" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashPayment_orderId_key" ON "CashPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CashPayment_razorpayPaymentId_key" ON "CashPayment"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "CashPayment_razorpayOrderId_key" ON "CashPayment"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "CashPayment" ADD CONSTRAINT "CashPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
