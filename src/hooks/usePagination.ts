
import { useState, useEffect } from 'react';

export function usePagination<T>(data: T[], initialItemsPerPage: number = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const maxPage = Math.ceil(data.length / itemsPerPage);

    useEffect(() => {
        // If current page is beyond max page (e.g. after filtering), reset to max page (or 1 if empty)
        if (maxPage > 0 && currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
        // If we have data but page is 0 (shouldn't happen with 1-based indexing, but safe to check)
        if (maxPage > 0 && currentPage < 1) {
            setCurrentPage(1);
        }
    }, [data.length, itemsPerPage, maxPage, currentPage]);

    const currentData = () => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    };

    const next = () => {
        setCurrentPage((curr) => Math.min(curr + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage((curr) => Math.max(curr - 1, 1));
    };

    const jump = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, maxPage));
        setCurrentPage(pageNumber);
    };

    return {
        next,
        prev,
        jump,
        currentData: currentData(),
        currentPage,
        maxPage,
        itemsPerPage,
        setItemsPerPage
    };
}
