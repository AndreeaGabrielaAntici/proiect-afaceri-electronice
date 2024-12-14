const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Upsert categories (this ensures that if "medicine" or "makeup" exist, they won't be duplicated)
  const medicine = await prisma.category.upsert({
    where: { name: "medicine" },
    update: {},
    create: {
      name: "medicine",
    },
  });

  const makeup = await prisma.category.upsert({
    where: { name: "makeup" },
    update: {},
    create: {
      name: "makeup",
    },
  });

  // Create products
  await prisma.product.createMany({
    data: [
      { title: "Ibuprofen", price: 400, categoryId: medicine.id, thumbnail: "ibuprofen.jpg", rating: 4.5 },
      { title: "Paracetamol", price: 500, categoryId: medicine.id, thumbnail: "paracetamol.jpg", rating: 4.2 },
      { title: "CeraVe Crema Hidratantă", price: 100, categoryId: makeup.id, thumbnail: "cerave.jpg", rating: 4.7 },
      { title: "Vichy Dercos Șampon Anti-mătreață", price: 59.99, categoryId: makeup.id, thumbnail: "vichy.jpg", rating: 3.8 },
      { title: "Bioderma Sensibio H2O", price: 99.99, categoryId: makeup.id, thumbnail: "bioderma.jpg", rating: 4.0 },
    ],
    skipDuplicates: true,
  });

  // Fetch products to get their IDs for reviews
  const products = await prisma.product.findMany();

  // Create some reviews for the products
  await prisma.review.createMany({
    data: [
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = prisma;
