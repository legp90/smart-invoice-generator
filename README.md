# 📄 Smart Invoice Generator

A production-ready, high-performance **Smart Invoice Generator** built with React, TypeScript, and Tailwind CSS v4. This application allows freelance professionals and small businesses to create, preview, and export clean, corporate-grade A4 PDF invoices in real-time.

---

## 🚀 Core Features

- **Real-Time Computations:** Instant mathematical synchronization of line items, itemized totals, subtotal, custom tax rates, discounts, and final net totals using React `useMemo` for optimized rendering performance.
- **Dynamic Line Item Management:** Fluid UX allowing users to dynamically add, update, or clear invoice lines. Features smart focus-selection (`onFocus`) to prevent zero-value inputs from disrupting the user typing flow.
- **Custom Brand Identity:** Local binary image parsing using the native browser `FileReader` API, allowing users to upload and preview corporate logos instantly as Base64 strings.
- **Client-Side Data Persistence:** Automatic background state serialization into `localStorage` via continuous `useEffect` hooks, preserving user data against accidental tab reloads. Includes a structured hard-reset workflow with confirmation alerts.
- **Pixel-Perfect PDF Generation:** Instant extraction of the live A4 document layout into a sharp, multi-device compatible PDF file.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core:** React (Functional Components & Advanced Hooks)
- **Type Safety:** TypeScript (Strict interfaces, Type-only imports under `verbatimModuleSyntax`)
- **Styling Engine:** Tailwind CSS v4 (Modern OKLCH utility classes, custom input spin-button abstractions)
- **Build Tool:** Vite (Ultra-fast Hot Module Replacement)
- **Document Rendering:** `html-to-image` (SVG serialization) & `jsPDF`

---

## ⚡ Technical Challenges & Architectural Wins

### Overcoming the Tailwind v4 OKLCH Color Space Conflict
**The Problem:** Initial implementation utilized the standard `html2canvas` library to take a DOM snapshot of the invoice component. However, Tailwind CSS v4 natively compiles color schemes using the advanced, high-definition **OKLCH space** (e.g., `oklch(0.2 0.05 250)`). `html2canvas` relies on an outdated custom CSS parsing engine that failed to recognize the `oklch` string tokens, throwing silent exceptions and completely crashing the PDF compilation process.

**The Solution:** Instead of downgrading Tailwind or forcing rigid HEX fallback sheets, I refactored the pipeline to use **`html-to-image`**. This modern package bypasses standard text-string parsing by serializing the target DOM element directly into an native XML/SVG node layout, converting it into a crisp high-density canvas data URL. This architectural pivot fixed the rendering pipeline, slashed processing latency, and enabled razor-sharp font rendering inside the downloaded PDF document.

---

## 📦 Local Installation

To run this project locally, clone the repository and follow these steps:

```bash
# 1. Install all project dependencies
npm install

# 2. Run the local development server
npm run dev