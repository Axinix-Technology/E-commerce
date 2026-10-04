import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  RotateCcw,
  Receipt,
  ShieldCheck,
  Plus
} from "lucide-react";
import populateApi from "../../../api/populate.api";

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState({});
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    Promise.all([
      populateApi.read("faq_category", { limit: 20, filter: { status: 1 } }),
      populateApi.read("faq_item", { limit: 50, filter: { status: 1 } }),
    ])
      .then(([catRes, faqRes]) => {
        if (catRes?.data) setCategories(catRes.data);
        if (faqRes?.data) setFaqs(faqRes.data);
      })
      .catch(() => {});
  }, []);

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const defaultFaqs = [
    {
      id: "f1",
      category: "Orders & Shipping",
      question: "How can I track my shipment in real-time?",
      answer: "You can track your parcel live on our 'Track an Order' page using either your Statutory Sale Order Number (e.g., SO-20261003-8491) or your courier AWB tracking number. Automated SMS updates are dispatched at every milestone.",
    },
    {
      id: "f2",
      category: "Orders & Shipping",
      question: "What are the standard shipping timelines across India?",
      answer: "Tier-1 Metro locations (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata) receive shipments within 24 to 48 hours via Air Express. Surface shipments to regional PIN codes arrive within 3 to 5 business days.",
    },
    {
      id: "f3",
      category: "Returns & Refunds",
      question: "What is your return and exchange policy?",
      answer: "We offer a 7-day hassle-free inspection return window from delivery. Items must retain intact barcode security tags and original protective packaging. Doorstep courier pickup is complimentary.",
    },
    {
      id: "f4",
      category: "Returns & Refunds",
      question: "How are refunds disbursed and how long do they take?",
      answer: "Refunds for UPI payments reflect instantly within 15 minutes of warehouse QC approval. Credit and debit card refunds reflect in your bank account statement within 3 to 5 business banking days.",
    },
    {
      id: "f5",
      category: "Statutory GST & Invoicing",
      question: "Can I claim GST Input Tax Credit (ITC) on my purchases?",
      answer: "Yes! Provide your registered 15-character GSTIN and official Trade Name at checkout. Your digital Tax Invoice will be generated with state codes, CGST/SGST/IGST breakdown, and automatically uploaded for GSTR-2B reconciliation.",
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  const filteredFaqs = displayFaqs.filter((f) => {
    const q = f.question?.toLowerCase() || "";
    const a = f.answer?.toLowerCase() || "";
    const term = search.toLowerCase();
    return q.includes(term) || a.includes(term);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Frequently Asked Questions</span>
          </h1>
          <p className="text-xs text-gray-400">
            Find immediate answers regarding orders, returns, statutory invoicing, and tracking
          </p>
        </div>

        <Link
          to="/help-policies/faq/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Ask a Question</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Knowledge Base: <strong className="text-white">{displayFaqs.length || "—"} Articles</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Support Desk: <strong className="text-emerald-400">Online & Active</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          GSTR-2B Compliance: <strong className="text-[var(--brand-primary)]">Verified</strong>
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by keywords (e.g. Return, GSTIN, Tracking, BlueDart, Refund)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[var(--brand-primary)]"
        />
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems[faq.id || faq.question];
          return (
            <div
              key={faq.id || faq.question}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id || faq.question)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="space-y-1 pr-4">
                  {faq.category && (
                    <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
                      {typeof faq.category === "object" ? faq.category?.name : faq.category}
                    </span>
                  )}
                  <h3 className="text-xs font-bold text-white">{faq.question}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-300 leading-relaxed border-t border-white/[0.04]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
