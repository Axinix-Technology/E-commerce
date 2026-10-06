import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Input, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Frequently Asked Questions
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Find immediate answers regarding orders, returns, statutory invoicing, and tracking
            </p>
          </div>
        </div>

        <Link to="/help-policies/faq/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Ask a Question
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Knowledge Base: <strong className="text-primary-token font-medium">{formatQty(displayFaqs.length)} Articles</strong></span>
        <span>•</span>
        <span>Support Desk: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Online & Active</strong></span>
        <span>•</span>
        <span>GSTR-2B Compliance: <strong className="text-brand-token font-medium">Verified</strong></span>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search by keywords (e.g. Return, GSTIN, Tracking, BlueDart, Refund)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems[faq.id || faq.question];
          return (
            <div
              key={faq.id || faq.question}
              className="rounded-2xl bg-surface-elevated/40 border border-token hover:border-brand-token/40 transition-all overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleItem(faq.id || faq.question)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="space-y-1 pr-4">
                  {faq.category && (
                    <span className="text-[10px] font-bold text-brand-token uppercase tracking-wider block">
                      {typeof faq.category === "object" ? faq.category?.name : faq.category}
                    </span>
                  )}
                  <h3 className="text-xs font-bold text-primary-token">{faq.question}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-token shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-token shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-secondary-token leading-relaxed border-t border-token">
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
