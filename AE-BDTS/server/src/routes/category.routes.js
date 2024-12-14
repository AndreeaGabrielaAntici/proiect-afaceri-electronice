const express = require("express");
const prisma = require("../prisma");
const LoginSchema = require("../dtos/auth.dtos/login.dto");
const CheckTokenSchema = require("../dtos/auth.dtos/checkToken.dto");
const { comparePassword } = require("../utils/bcryptUtils");
const { generateToken, isValidToken } = require("../utils/tokenUtils");
const { getValidationErrors } = require("../utils/validateUtils");

const router = express.Router();

// GET /products/categories
router.get("/categories", async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      });
  
      const categoryNames = categories.map((cat) => cat.name);
      return res.json(categoryNames);
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
  
      let orderClause = {};
      if (sortBy && order) {
        const validFields = ["name", "price", "createdAt"];
        const validOrders = ["asc", "desc"];
  
        if (validFields.includes(sortBy) && validOrders.includes(order)) {
          orderClause[sortBy] = order;
        }
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
        include: { category: true },
        orderBy: orderClause,
      });
  
      return res.json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
