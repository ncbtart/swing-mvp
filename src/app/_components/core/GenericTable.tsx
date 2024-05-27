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
      <ol className="flex justify-end gap-1 text-xs font-medium">
        <li>
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180"
          >
            <span className="sr-only">Prev Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {[...Array(totalPages).keys()].map((page) => (
          <li key={page}>
            <button
              onClick={() => handlePageSelect(page + 1)}
              className={`block size-8 rounded border leading-8 ${currentPage === page + 1 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-100 bg-white text-gray-900"}`}
            >
              {page + 1}
            </button>
          </li>
        ))}

        <li>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180"
          >
            <span className="sr-only">Next Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ol>
    </div>
  );
}

export default GenericTable;
