/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CategoryEnum" AS ENUM ('Fitness_And_Gym_Equipment', 'Nutrition_And_Health', 'Diagnostics_And_Prevention', 'Ergonomics_And_Workspace_Comfort', 'Health_And_Wellness_Services');

-- CreateEnum
CREATE TYPE "SubCategoryEnum" AS ENUM ('Cardio_Equipment', 'Probiotics_And_Supplements', 'Wearable_Health_Technology', 'Standing_Desks_And_Accessories', 'Onsite_Fitness_Classes_And_Workshops');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "address2" VARCHAR(150),
ADD COLUMN     "city" VARCHAR(50),
ADD COLUMN     "pinCode" VARCHAR(10),
ADD COLUMN     "state" VARCHAR(50);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "subCategory",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "categoryOld" "CategoryEnum",
ADD COLUMN     "subCategoryId" TEXT,
ADD COLUMN     "subCategoryOld" "SubCategoryEnum";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "sku" VARCHAR(100);

-- DropEnum
DROP TYPE "Category";

-- DropEnum
DROP TYPE "SubCategory";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
