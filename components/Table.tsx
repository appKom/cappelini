import TableCard from "./TableCard";
import { FaTrash } from "react-icons/fa";
import React from "react";
import { useRouter } from "next/router";

export type ColumnType = {
  label: string;
  field: string;
};

export type RowType = {
  id: string;
  link?: string;
  [key: string]: any;
};

interface TableProps {
  columns: ColumnType[];
  rows: RowType[];
  onDelete?: (id: string, name: string) => void;
}

const Table = ({ rows, columns, onDelete }: TableProps) => {
  const router = useRouter();

  return (
    <>
      <div className="hidden overflow-auto border border-gray-200 rounded-lg shadow-md md:flex dark:border-gray-700">
        <table className="w-full text-gray-500 border-collapse dark:bg-online-darkBlue dark:text-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map((column) => (
                <React.Fragment key={column.label}>
                  {column.label !== "Delete" ? (
                    <th className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 sm:px-6 sm:py-4 sm:text-sm">
                      {column.label}
                    </th>
                  ) : (
                    <th className="px-10 py-2"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="border-t border-gray-100 dark:border-0">
            {rows.map((row, index) => (
              <tr
                key={"tr-" + index}
                className="relative cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-900 dark:border-gray-700"
                onClick={() => row.link && router.push(row.link)}
              >
                {columns.map((column) => (
                  <td
                    key={row.id + "-" + column.field}
                    className={`px-4 py-2 text-xs ${columns.indexOf(column) === 0 ? "font-medium" : ""
                      } sm:px-6 sm:py-4 sm:text-sm`}
                  >
                    {column.field === "delete" && onDelete ? (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row.id, row.name);
                          }}
                          className="text-black dark:text-white hover:text-red-700 hover:text-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      row[column.field]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col space-y-4 md:hidden">
        {rows.map((row, index) => (
          <TableCard key={"TableCard-" + index} period={row} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
};

export default Table;
