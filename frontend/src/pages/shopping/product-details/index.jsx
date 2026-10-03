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
  Heart,
  Share2,
  Sliders
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

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
      } catch (err) {
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
      <div className="py-20 text-center text-xs font-mono text-gray-400">
        Loading product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-gray-400 text-sm">Product not found.</p>
        <Link
          to="/shopping/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.selling_price
    ? Number(selectedVariant.selling_price)
    : Number(product.selling_price) || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/shopping/products"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>

        <Link
          to={`/shopping/product-details/create?id=${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--brand-primary)] hover:underline font-semibold"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Request Custom Sizing</span>
        </Link>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Visual Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-gray-900/60 border border-white/10 aspect-square flex items-center justify-center">
            <img
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
              {product.category?.name || "Exclusive Collection"}
            </span>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                {product.brand || "Axinix Tailors"}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400 font-mono">
                SKU: {selectedVariant?.sku || product.slug}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-medium">5.0 (Verified Artisan Craft)</span>
            </div>
          </div>

          {/* Pricing & GST Notice */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--brand-primary)]">
                {currentPrice > 0 ? `₹${currentPrice.toLocaleString("en-IN")}` : "—"}
              </span>
              <span className="text-xs text-gray-400 font-medium">Inclusive of all taxes</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Input Tax Credit (ITC) available with registered GSTIN at checkout.
            </p>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">
                Select Variant / Size
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selectedVariant?.id === v.id
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-md"
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30"
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
              <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 text-sm font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-mono font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>
          </div>

          {/* Specification Pills */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08] text-xs">
            <div>
              <span className="text-gray-500 block">Textile Material</span>
              <span className="text-gray-200 font-medium">{product.material || "100% Pure Natural Fibers"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Gender & Age</span>
              <span className="text-gray-200 font-medium">{product.gender_label || "Unisex"} • {product.age_group || "Adult"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
