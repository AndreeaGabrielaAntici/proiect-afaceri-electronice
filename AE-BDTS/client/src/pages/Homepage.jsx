import { useState, useEffect } from "react";
import Filters from "../components/Filters";
import Products from "../components/Products";
import DataSorting from "../components/DataSorting";
import { getProductCategories, getProducts } from "../routes/products";

function Homepage() {
  const [filters, setFilters] = useState({ category: "" });
  const [sorting, setSorting] = useState(1);

  // State for data
  const [categories, setCategories] = useState([]);
  const [products, setProductsData] = useState([]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesFromServer = await getProductCategories();
      setCategories(categoriesFromServer);
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters or sorting changes
  useEffect(() => {
    const fetchProducts = async () => {
      const productsFromServer = await getProducts(filters, sorting);
      setProductsData(productsFromServer);
    };
    fetchProducts();
  }, [filters, sorting]);

  return (
    <div className="homepageWrapper">
      {/* Pass categories to Filters so it can render a category dropdown */}
      <Filters setFilters={setFilters} categories={categories} />
      <div>
        {/* DataSorting can modify the sorting state which triggers products re-fetch */}
        <DataSorting setSorting={setSorting} />
        {/* Pass the fetched products to Products to display */}
        <Products filters={filters} sorting={sorting} products={products} />
      </div>
    </div>
  );
}

export default Homepage;
