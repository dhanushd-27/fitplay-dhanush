import prisma from "@/lib/prisma";

const PRODUCTS = [
    {
        name: "Gut Health Booster",
        description: "Formulated with Prebiotic & Probiotic Strains Commonly Missing In The Indian Gut",
        category: "Nutrition & Health",
        subCategory: "Probiotics & Supplements",
        images: [
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Cover_2.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Benefits.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Symptoms.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Ingredient_Highlight.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Ingredient_Story_1.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Ingredient_story_2.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/90_Day_Journey.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Us_vs_Them.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Back_Label.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/How_to_use.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Certifications.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/CTA.png?v=1743157846",
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Cover.png?v=1743157846"
        ],
        variants: [
            { category: "Quantity", value: "Starter Pack (15 days)", mrp: 599, sku: "SU-GHB-15" },
            { category: "Quantity", value: "30 Sachets (1 month)", mrp: 1199, sku: "SU-GHB-30" },
            { category: "Quantity", value: "60 Sachets (2 months)", mrp: 2399, sku: "SU-GHB-60" },
            { category: "Quantity", value: "90 Sachets (3 months)", mrp: 3599, sku: "SU-GHB-90" }
        ]
    },
    {
        name: "Sleep Gummies",
        description: "Improve Sleep | Muscle & Nerve Relaxation",
        category: "Nutrition & Health",
        subCategory: "Probiotics & Supplements",
        images: [
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Cover_00a6f926-6902-4891-9a20-e2ff32409afa.png?v=1743159614"
        ],
        variants: [
            { category: "Quantity", value: "Pack of 1 (30 gummies)", mrp: 799, sku: "SU-SS-30" },
            { category: "Quantity", value: "Pack of 2 (60 gummies)", mrp: 1599, sku: "SU-SS-60" },
            { category: "Quantity", value: "Pack of 3 (90 gummies)", mrp: 2399, sku: "SU-SS-90" },
            { category: "Quantity", value: "Pack of 4 (120 gummies)", mrp: 3199, sku: "SU-SS-120" }
        ]
    },
    {
        name: "Kids Gummies",
        description: "Kids Probiotics Multivitamin Gummies | Smooth Digestion, Immunity, Growth & Development",
        category: "Nutrition & Health",
        subCategory: "Probiotics & Supplements",
        images: [
            "https://cdn.shopify.com/s/files/1/0687/4523/2705/files/Cover_e79e3904-6157-42e0-9252-859f39e56931.png?v=1745745502"
        ],
        variants: [
            { category: "Quantity", value: "Pack of 1 (30 gummies)", mrp: 799, sku: "SU-JP-30" },
            { category: "Quantity", value: "Pack of 2 (60 gummies)", mrp: 1599, sku: "SU-JP-60" },
            { category: "Quantity", value: "Pack of 3 (90 gummies)", mrp: 2399, sku: "SU-JP-90" },
            { category: "Quantity", value: "Pack of 4 (120 gummies)", mrp: 3199, sku: "SU-JP-120" }
        ]
    }
];

async function main() {
    for (const product of PRODUCTS) {
        const existingProduct = await prisma.product.findFirst({
            where: { name: product.name }
        });

        if (existingProduct) {
            for (const variant of product.variants) {
                const existingVariant = await prisma.variant.findUnique({
                    where: { sku: variant.sku }
                });

                if (!existingVariant) {
                    await prisma.variant.create({
                        data: {
                            variantCategory: variant.category,
                            variantValue: variant.value,
                            mrp: variant.mrp,
                            sku: variant.sku,
                            productId: existingProduct.id
                        }
                    });
                }
            }
            continue;
        }

        const category = await prisma.category.upsert({
            where: { name: product.category },
            update: {},
            create: { name: product.category }
        });

        const subCategory = await prisma.subCategory.findFirst({
            where: { name: product.subCategory, categoryId: category.id }
        }) ?? await prisma.subCategory.create({
            data: {
                name: product.subCategory,
                categoryId: category.id
            }
        });

        const createdProduct = await prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                images: product.images,
                sku: `AUTO-${product.name.replace(/\s+/g, "-").toUpperCase()}`,
                availableStock: 0,
                categoryId: category.id,
                subCategoryId: subCategory.id
            }
        });

        for (const variant of product.variants) {
            const existingVariant = await prisma.variant.findUnique({
                where: { sku: variant.sku }
            });

            if (!existingVariant) {
                await prisma.variant.create({
                    data: {
                        variantCategory: variant.category,
                        variantValue: variant.value,
                        mrp: variant.mrp,
                        sku: variant.sku,
                        productId: createdProduct.id
                    }
                });
            }
        }
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
