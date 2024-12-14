import { sortingOptions } from "../constants/sort";
import { getDummyApiUrl } from "../utils/envUtils";

export const getProductCategories = async () => {
  const result = await fetch(`${getDummyApiUrl()}/products/categories`);
  const response = await result.json();
  return response;
};

export const getProducts = async (filters, sortingId) => {
  let url = `${getDummyApiUrl()}/products`;

  if (filters.category) {
    url += `/category/${filters.category}`;
  }

  if (sortingId) {
    const sortOption = sortingOptions.find((option) => option.id === sortingId);

    if (sortOption) {
      url += `?sortBy=${sortOption.key}&order=${sortOption.order}`;
    }
  }

  const result = await fetch(url);
  const response = await result.json();

  return response;
};
