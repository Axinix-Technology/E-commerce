import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ShoppingBag, ArrowRight, BellRing, Plus, Layers } from "lucide-react";
import populateApi from "../../../api/populate.api";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await populateApi.read("product_type", {
        filter: {
          "name.icontains": searchTerm.trim(),
          status: 1,
        },
        limit: 20,
      });
      if (res?.data) {
        setResults(res.data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Search Catalogue</span>
          </h1>
          <p className="text-xs text-gray-400">
            Real-time keyword search across all indexed product types, materials, and brands
          </p>
        </div>

        <Link
          to={`/shopping/search/create?q=${encodeURIComponent(query)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Save Search Alert</span>
        </Link>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search collections (e.g. Linen, Oxford, Pashmina, Derby)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[var(--brand-primary)]"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
        <button
          type="submit"
          className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Keyword: <strong className="text-white">"{query || "All"}"</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Matched Items: <strong className="text-[var(--brand-primary)]">{results.length || "—"}</strong>
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-gray-400">
          Searching catalogue...
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-gray-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-gray-500" />
          <p className="text-sm font-semibold text-gray-300">
            {query ? `No items found matching "${query}"` : "Enter a search query above"}
          </p>
          <p className="text-xs text-gray-500">
            Try generic keywords like "Shirt", "Stole", "Derby", or "Watch".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[rgba(0,210,210,0.3)] transition-all group flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                  {p.brand || "Axinix"}
                </span>
                <h3 className="text-xs font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors mt-0.5 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                  {p.material || p.description || "Premium handcrafted apparel."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-sm font-extrabold text-white">
                  {p.selling_price && Number(p.selling_price) > 0
                    ? `₹${Number(p.selling_price).toLocaleString("en-IN")}`
                    : "—"}
                </span>
                <span className="text-xs text-[var(--brand-primary)] flex items-center gap-1 font-semibold">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
