import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ProductDetailPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const slug = searchParams.get("slug");
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let prodData = null;
        if (productId) {
          prodData = await populateApi.readOne("product_type", productId, {
            populate: { category: ["id", "name"] },
          });
        } else if (slug) {
          const res = await populateApi.read("product_type", {
            filter: { slug },
            limit: 1,
            populate: { category: ["id", "name"] },
          });
          if (res?.data?.length > 0) prodData = res.data[0];
        }

        if (prodData) {
          setProduct(prodData);
          // Fetch variants for this product
          const varRes = await populateApi.read("product_variant", {
            filter: { product_id: prodData.id, status: 1 },
          });
          if (varRes?.data?.length > 0) {
            setVariants(varRes.data);
            setSelectedVariant(varRes.data[0]);
          }
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const existing = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    const itemIdx = existing.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.variant_id === (selectedVariant?.id || null)
    );

    const price = selectedVariant?.selling_price
      ? Number(selectedVariant.selling_price)
      : Number(product.selling_price) || 0;

    if (itemIdx >= 0) {
      existing[itemIdx].quantity += quantity;
    } else {
      existing.push({
        id: Date.now(),
        product_id: product.id,
        variant_id: selectedVariant?.id || null,
        name: product.name,
        brand: product.brand,
        size: selectedVariant?.size || "Standard",
        color: selectedVariant?.color || "Standard",
        sku: selectedVariant?.sku || product.slug || `SKU-${product.id}`,
        selling_price: price,
        quantity,
        image_url:
          product.image_url ||
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      });
    }

    localStorage.setItem("customer_cart", JSON.stringify(existing));
    toast.success(`Added ${quantity} × "${product.name}" to cart`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-muted-token">
        Loading product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-secondary-token text-sm">Product not found.</p>
        <Link to="/shopping/products">
          <Button variant="primary" size="sm" icon={ArrowLeft}>
            Back to Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.selling_price
    ? Number(selectedVariant.selling_price)
    : Number(product.selling_price) || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb / Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/shopping/products"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>

        <Link
          to={`/shopping/product-details/create?id=${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-brand-token hover:underline font-semibold"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Request Custom Sizing</span>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Collection: <strong className="text-primary-token font-medium">{product.category?.name || "Ready to Wear"}</strong></span>
        <span>•</span>
        <span>M.R.P: <strong className="text-brand-token font-medium">{currentPrice > 0 ? `₹${currentPrice.toLocaleString("en-IN")}` : "—"}</strong></span>
        <span>•</span>
        <span>Tax Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">100% ITC Eligible</strong></span>
        <span>•</span>
        <span>Variants: <strong className="text-primary-token font-medium">{formatQty(variants.length)} Configured</strong></span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Visual Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-surface-elevated/60 border border-token aspect-square flex items-center justify-center shadow-xs">
            <img
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-surface/80 text-primary-token backdrop-blur-md border border-token shadow-xs">
              {product.category?.name || "Exclusive Collection"}
            </span>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-token uppercase tracking-wider">
                {product.brand || "Axinix Tailors"}
              </span>
              <span className="text-muted-token">•</span>
              <span className="text-xs text-muted-token font-mono">
                SKU: {selectedVariant?.sku || product.slug}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-token tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs text-muted-token font-medium">5.0 (Verified Artisan Craft)</span>
            </div>
          </div>

          {/* Pricing & GST Notice */}
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-token space-y-1 shadow-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-brand-token">
                {currentPrice > 0 ? `₹${currentPrice.toLocaleString("en-IN")}` : "—"}
              </span>
              <span className="text-xs text-muted-token font-medium">Inclusive of all taxes</span>
            </div>
            <p className="text-[11px] text-muted-token">
              Input Tax Credit (ITC) available with registered GSTIN at checkout.
            </p>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-secondary-token">
                Select Variant / Size
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selectedVariant?.id === v.id
                        ? "bg-brand-token text-white border-brand-token shadow-xs"
                        : "bg-surface-elevated/60 text-secondary-token border-token hover:border-brand-token/40"
                    }`}
                  >
                    <span>{v.size || "Standard"}</span>
                    {v.color && <span className="ml-1 opacity-75">• {v.color}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl bg-surface border border-token p-1 shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-token hover:text-primary-token hover:bg-surface-elevated text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-mono font-bold text-primary-token">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-token hover:text-primary-token hover:bg-surface-elevated text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                className="flex-1"
                icon={ShoppingBag}
                onClick={handleAddToCart}
              >
                Add to Shopping Cart
              </Button>
            </div>
          </div>

          {/* Specification Pills */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-token text-xs">
            <div>
              <span className="text-muted-token block">Textile Material</span>
              <span className="text-primary-token font-medium">{product.material || "100% Pure Natural Fibers"}</span>
            </div>
            <div>
              <span className="text-muted-token block">Gender & Age</span>
              <span className="text-primary-token font-medium">{product.gender_label || "Unisex"} • {product.age_group || "Adult"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
