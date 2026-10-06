import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ShoppingBag, ArrowRight, BellRing, Layers } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Input, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Search Catalogue
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Real-time keyword search across all indexed product types, materials, and brands
            </p>
          </div>
        </div>

        <Link to={`/shopping/search/create?q=${encodeURIComponent(query)}`}>
          <Button variant="secondary" size="sm" icon={BellRing}>
            Save Search Alert
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Query: <strong className="text-primary-token font-medium">"{query || "All"}"</strong></span>
        <span>•</span>
        <span>Matched Records: <strong className="text-brand-token font-medium">{formatQty(results.length)}</strong></span>
        <span>•</span>
        <span>Index Scope: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Real-Time Search</strong></span>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          placeholder="Search collections (e.g. Linen, Oxford, Pashmina, Derby)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary" size="md" icon={Search} loading={loading}>
          Search
        </Button>
      </form>

      {/* Results View */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-muted-token">
          Searching catalogue index...
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-elevated/40 border border-token space-y-3">
          <Layers className="w-10 h-10 mx-auto text-muted-token" />
          <p className="text-sm font-semibold text-secondary-token">
            {query ? `No items found matching "${query}"` : "Enter a search term to find products"}
          </p>
          <p className="text-xs text-muted-token max-w-sm mx-auto">
            Try searching by fabric type like 'Cotton', garment type like 'Shirt', or brand name like 'Axinix'.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-surface-elevated/40 border border-token hover:border-brand-token/40 transition-all overflow-hidden flex flex-col group shadow-xs"
            >
              <div className="relative h-44 bg-surface-elevated/80 overflow-hidden">
                <img
                  src={
                    p.image_url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-brand-token uppercase">
                    {p.brand || "Axinix"}
                  </span>
                  <h3 className="text-xs font-bold text-primary-token line-clamp-1 mt-0.5">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-muted-token mt-0.5 line-clamp-1">
                    {p.material || "Crafted with fine natural fibers"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-token">
                  <span className="text-sm font-extrabold text-brand-token">
                    {p.selling_price && Number(p.selling_price) > 0
                      ? `₹${Number(p.selling_price).toLocaleString("en-IN")}`
                      : "—"}
                  </span>

                  <Link
                    to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
                    className="p-1.5 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
