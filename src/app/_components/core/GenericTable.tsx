// Définition des types pour les props du composant
import { Fragment } from "react";

type TableColumn<T> = {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  onClick?: (item: T) => void;
};

type TableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newSkip: number) => void;
};

// Composant Tableau Générique avec Style
function GenericTable<T>({
  data,
  columns,
  total,
  skip,
  take,
  onPageChange,
}: TableProps<T>): JSX.Element {
  return (
    <div className="mt-6 rounded-lg border border-gray-200">
      <div className="overflow-x-auto rounded-t-lg">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key) + String(index)}
                  className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((column, index) => (
                  <td
                    key={String(column.key) + String(index)}
                    className={`whitespace-nowrap px-4 py-2 text-gray-700  ${column.onClick ? "cursor-pointer" : ""}`}
                    onClick={() => column.onClick?.(item)}
                  >
                    {column.render ? (
                      column.render(item[column.key], item)
                    ) : (
                      <Fragment key={String(column.key) + String(index)}>
                        {item[column.key] as React.ReactNode}
                      </Fragment>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <GenericPaginator
        total={total}
        take={take}
        skip={skip}
        onPageChange={onPageChange}
      />
    </div>
  );
}
export function GenericPaginator({
  total,
  take,
  skip,
  onPageChange,
}: {
  total: number;
  take: number;
  skip: number;
  onPageChange: (newSkip: number) => void;
}): JSX.Element {
  const totalPages = Math.ceil(total / take);
  const currentPage = skip / take + 1;
  const maxPagesToShow = 5; // Nombre maximum de pages à afficher autour de la page actuelle
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange((currentPage - 2) * take);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage * take);
  };

  const handlePageSelect = (page: number) => {
    onPageChange((page - 1) * take);
  };

  return (
    <div className="rounded-b-lg border-t border-gray-200 px-4 py-2">
      <ol className="flex items-center justify-end gap-1 text-xs font-medium">
        <li>
          <button
            onClick={() => handlePageSelect(1)}
            disabled={currentPage === 1}
            className="min-w-[40px] rounded border bg-white px-2 py-1 text-gray-900 hover:bg-gray-100"
          >
            Première
          </button>
        </li>
        <li>
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex min-w-[40px] items-center justify-center rounded border bg-white px-2 py-1 text-gray-900 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 4.293a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414l5 5a1 1 0 001.414-1.414L6.414 10l3.293-3.293a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {startPage > 1 && <li>...</li>}
        {[...Array(endPage - startPage + 1).keys()].map((index) => (
          <li key={startPage + index}>
            <button
              onClick={() => handlePageSelect(startPage + index)}
              className={`min-w-[40px] rounded border px-2 py-1 ${currentPage === startPage + index ? "bg-blue-600 text-white" : "bg-white text-gray-900 hover:bg-gray-100"}`}
            >
              {startPage + index}
            </button>
          </li>
        ))}
        {endPage < totalPages && <li>...</li>}

        <li>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex min-w-[40px] items-center justify-center rounded border bg-white px-2 py-1 text-gray-900 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L13.586 10l-3.293 3.293a1 1 0 000 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
        <li>
          <button
            onClick={() => handlePageSelect(totalPages)}
            disabled={currentPage === totalPages}
            className="min-w-[40px] rounded border bg-white px-2 py-1 text-gray-900 hover:bg-gray-100"
          >
            Dernière
          </button>
        </li>
      </ol>
    </div>
  );
}

export default GenericTable;
