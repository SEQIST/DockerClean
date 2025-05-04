import { useState, ChangeEvent } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialRowsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentData: T[];
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  startIndex: number;
  endIndex: number;
  rowsPerPage: number;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const usePagination = <T>({ data, initialRowsPerPage = 10 }: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const totalEntries = data.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  return {
    currentData,
    currentPage,
    totalPages,
    totalEntries,
    startIndex,
    endIndex,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
};

export default usePagination;