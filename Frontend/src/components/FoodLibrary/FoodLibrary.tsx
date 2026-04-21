import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../../utils/axios";

import type { Food, Props } from "./types";
import { PAGE_SIZE } from "./consts";
import { useDebounce } from "./useDebounce";

import FoodLibraryHeader from "./FoodLibraryHeader";
import FoodSearchBar from "./FoodSearchBar";
import CategoryFilter from "./CategoryFilter";
import FoodGrid from "./FoodGrid";
import FoodDetailModal from "./FoodDetailModal";

const FoodLibrary: React.FC<Props> = ({ onLog }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [logQty, setLogQty] = useState(1);  const subtext = "text-neutral-500";

  const debouncedSearch = useDebounce(searchTerm, 400);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const fetchFoods = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: PAGE_SIZE.toString(),
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (activeCategory !== "All") params.set("category", activeCategory);

        const res = await API.get(`/api/foods?${params.toString()}`);
        const data = res.data;

        const list = Array.isArray(data?.foods)
          ? data.foods
          : Array.isArray(data)
            ? data
            : [];

        if (append) {
          setFoods((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            ...list,
          ]);
        } else {
          setFoods(list);
        }
        setPage(typeof data?.page === "number" ? data.page : pageNum);
        setTotalPages(
          typeof data?.totalPages === "number" && data.totalPages >= 1
            ? data.totalPages
            : 1,
        );
        setTotalCount(typeof data?.totalCount === "number" ? data.totalCount : list.length);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load foods";
        toast.error(typeof msg === "string" ? msg : "Failed to load foods");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, activeCategory],
  );

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    setPage(1);
    fetchFoods(1, false);
  }, [debouncedSearch, activeCategory, fetchFoods]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && page < totalPages) {
          fetchFoods(page + 1, true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, isLoading, isLoadingMore, fetchFoods]);

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0 relative">
      <FoodLibraryHeader totalCount={totalCount} />

      <FoodSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      <CategoryFilter 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />

      {!isLoading && (
        <div className="flex items-center justify-between px-1">
          <span className={`text-sm font-medium ${subtext}`}>
            {totalCount === 0
              ? "No foods found"
              : `Showing ${foods.length} of ${totalCount} food${totalCount !== 1 ? "s" : ""}`}
          </span>
          {totalPages > 1 && (
            <span className={`text-xs font-medium ${subtext}`}>
              Page {page} of {totalPages}
            </span>
          )}
        </div>
      )}

      <FoodGrid
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        foods={foods}
        totalCount={totalCount}
        debouncedSearch={debouncedSearch}
        activeCategory={activeCategory}
        setSearchTerm={setSearchTerm}
        setActiveCategory={setActiveCategory}
        onSelectFood={(f) => {
          setSelectedFood(f);
          setLogQty(1);
        }}
        onLogQuick={(f) => {
          onLog(f, 1);
          toast.success(`Logged 1 portion of ${f.food_name}`);
        }}
      />

      {page < totalPages && !isLoading && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {!isLoading && foods.length > 0 && page >= totalPages && (
        <div className="text-center py-6">
          <span className="text-sm text-neutral-400 font-medium">
            ✓ You've reached the end — {totalCount} food{totalCount !== 1 ? "s" : ""} total
          </span>
        </div>
      )}

      {selectedFood && (
        <FoodDetailModal 
          selectedFood={selectedFood}
          setSelectedFood={setSelectedFood}
          logQty={logQty}
          setLogQty={setLogQty}
          onLog={onLog}
        />
      )}

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FoodLibrary;
