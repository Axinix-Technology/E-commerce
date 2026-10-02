---
trigger: always_on
---

# UI Formatting Rule: Zero-Value Representation & Minimalist Metrics

## Rule 1: Zero Values Must Be Rendered as Dash ("—" or " ")
In all data tables, reports, inventory registries, stock summaries, and KPI metrics:
1. **Never Display "0" or "0.00"**:
   - Numeric quantities, opening stock, inward counts, outward counts, closing balances, memo counts, and zero amounts must be displayed as an em-dash (`—`) or hyphen (` `).
   - Example: Instead of `0`, display ` `.
   - Instead of `+0` or `-0`, display ` `.
   - Instead of `₹0.00`, display ` `.
2. **Implementation**:
   - Always pass quantities and amounts through standard formatters:
     - `formatQty(val)`: Returns `num.toLocaleString()` or `"—"` if `num === 0 || !num`.
     - `formatCurrency(val)`: Returns `₹...` or `"—"` if `num === 0 || !num`.

## Rule 2: Minimalist Single-Line Metric Summary Bar (No Bulky KPI Cards)
1. Avoid tall, multi-card KPI grids that consume vertical screen real estate.
2. Render summaries in a sleek, horizontal, single-line metrics bar:
   - `Total Pcs: 1,250 • Total Purchase Cost: ₹4,50,000 • Total Approval Pcs: 45 • Available Sellable: 1,205`
3. Keeps table headers and data rows immediately visible above the fold.
