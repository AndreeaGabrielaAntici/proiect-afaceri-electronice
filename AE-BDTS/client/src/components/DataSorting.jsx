import { sortingOptions } from "../constants/sort";

const DataSorting = (props) => {
  const { setSorting } = props;

  const handleSortingChange = (event) => {
    setSorting(Number(event.target.value));
  };

  return (
    <div className="dataSortingWrapper">
      <div>
        <label htmlFor="categorySelect">Sort By</label>
      </div>
      <div>
        <select id="categorySelect" onChange={handleSortingChange}>
          {sortingOptions?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DataSorting;
