const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /products/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // Transform categories into slug/name pairs
    const transformed = categories.map(cat => ({
      slug: cat.name.toLowerCase(),
      name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
    }));

    return res.json(transformed);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /products (with optional sorting)
router.get("/", async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    const validFields = ["title", "price", "createdAt"];
    const validOrders = ["asc", "desc"];

    let orderClause = {};
    if (sortBy && order && validFields.includes(sortBy) && validOrders.includes(order)) {
      orderClause[sortBy] = order;
    }

    const products = await prisma.product.findMany({
      include: { category: true, reviews: true },
      orderBy: orderClause,
    });

    // Return products wrapped in an object
    return res.json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /products/category/:categoryName (with optional sorting)
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { sortBy, order } = req.query;

    const validFields = ["title", "price", "createdAt"];
    const validOrders = ["asc", "desc"];

    let orderClause = {};
    if (sortBy && order && validFields.includes(sortBy) && validOrders.includes(order)) {
      orderClause[sortBy] = order;
    }

    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
      include: { category: true, reviews: true },
      orderBy: orderClause,
    });

    // Return products wrapped in an object to match frontend expectation
    return res.json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
