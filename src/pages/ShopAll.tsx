import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X, Check, Grid3X3, LayoutGrid, LayoutList, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProductCard, { type Product } from "@/components/ProductCard";
import Footer from "@/components/Footer";

import product1 from "@/assets/product-1.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2 from "@/assets/product-2.jpg";
import product2Hover from "@/assets/product-2-hover.jpg";
import product3 from "@/assets/product-3.jpg";
import product3Hover from "@/assets/product-3-hover.jpg";
import product4 from "@/assets/product-4.jpg";
import product4Hover from "@/assets/product-4-hover.jpg";

const allProducts: Product[] = [
  { image: product1, hoverImage: product1Hover, name: "Midnight Silk Drape Saree", category: "Fusion Sarees", price: "₹18,500" },
  { image: product2, hoverImage: product2Hover, name: "Ivory Embroidered Anarkali", category: "Designer Anarkali", price: "₹22,800" },
  { image: product3, hoverImage: product3Hover, name: "Terracotta Lehenga Set", category: "Contemporary Lehengas", price: "₹28,500" },
  { image: product4, hoverImage: product4Hover, name: "Lavender Chiffon Kurta Set", category: "Premium Kurtas", price: "₹12,900" },
  { image: product3, hoverImage: product3Hover, name: "Rose Gold Festive Saree", category: "Festive Collection", price: "₹24,500", tag: "BESTSELLER" },
  { image: product1, hoverImage: product1Hover, name: "Emerald Silk Co-ord Set", category: "Co-ord Sets", price: "₹16,200" },
  { image: product2, hoverImage: product2Hover, name: "Pearl White Anarkali Gown", category: "Dresses", price: "₹19,800" },
  { image: product4, hoverImage: product4Hover, name: "Dusty Pink Sharara Set", category: "Co-ord Sets", price: "₹15,600" },
  { image: product1, hoverImage: product1Hover, name: "Royal Blue Drape Saree", category: "Fusion Sarees", price: "₹21,000", tag: "LIMITED" },
];

const categories = ["Dresses", "Co-ord Sets", "Fusion Sarees", "Festive Collection"];
const sizes = ["XS", "S", "M", "L", "XL"];
const availabilityOptions = ["In Stock", "Pre-Order"];

/* ───── Collapsible Filter Section ───── */
const FilterSection = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-1 group">
        <h3
          className="font-cormorant text-[17px] font-semibold"
          style={{ color: "hsl(0 0% 18%)" }}
        >
          {title}
        </h3>
        <ChevronDown
          size={16}
          className="transition-transform duration-200"
          style={{
            color: "hsl(0 0% 50%)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 pb-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};

/* ───── Sidebar Filter Content ───── */
const FilterSidebar = ({
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  selectedSizes,
  toggleSize,
  selectedAvailability,
  toggleAvailability,
}: {
  selectedCategories: string[];
  toggleCategory: (c: string) => void;
  priceRange: number[];
  setPriceRange: (v: number[]) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  selectedAvailability: string[];
  toggleAvailability: (a: string) => void;
}) => (
  <div className="space-y-2">
    <div>
      <p
        className="font-cormorant text-[13px] uppercase tracking-[0.15em] font-medium"
        style={{ color: "hsl(0 0% 48%)" }}
      >
        Filters
      </p>
      <Separator className="mt-3" style={{ backgroundColor: "hsl(0 0% 85%)" }} />
    </div>

    <FilterSection title="Categories">
      <div className="space-y-3">
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedCategories.includes(cat)}
              onCheckedChange={() => toggleCategory(cat)}
              className="border-[hsl(0_0%_70%)] data-[state=checked]:bg-[hsl(186_35%_28%)] data-[state=checked]:border-[hsl(186_35%_28%)]"
            />
            <span
              className="font-cormorant text-[15px] transition-colors duration-200 group-hover:text-[hsl(186_35%_28%)]"
              style={{ color: "hsl(0 0% 35%)" }}
            >
              {cat}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>

    <Separator style={{ backgroundColor: "hsl(0 0% 90%)" }} />

    <FilterSection title="Price Range">
      <Slider
        min={0}
        max={50000}
        step={1000}
        value={priceRange}
        onValueChange={setPriceRange}
        className="mb-3 [&_[role=slider]]:border-[hsl(186_35%_28%)] [&_[role=slider]]:bg-white [&_span:first-child>span]:bg-[hsl(186_35%_28%)]"
      />
      <div className="flex justify-between">
        <span className="font-cormorant text-[14px]" style={{ color: "hsl(0 0% 45%)" }}>
          ₹{priceRange[0]?.toLocaleString("en-IN")}
        </span>
        <span className="font-cormorant text-[14px]" style={{ color: "hsl(0 0% 45%)" }}>
          ₹{priceRange[1]?.toLocaleString("en-IN")}
        </span>
      </div>
    </FilterSection>

    <Separator style={{ backgroundColor: "hsl(0 0% 90%)" }} />

    <FilterSection title="Size">
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className="min-w-[44px] h-[44px] flex items-center justify-center rounded-md font-cormorant text-[14px] font-medium transition-all duration-200 border"
              style={{
                borderColor: isSelected ? "hsl(186 35% 28%)" : "hsl(0 0% 82%)",
                backgroundColor: isSelected ? "hsl(186 35% 28%)" : "transparent",
                color: isSelected ? "hsl(0 0% 100%)" : "hsl(0 0% 35%)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "hsl(186 35% 28%)";
                  e.currentTarget.style.color = "hsl(186 35% 28%)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "hsl(0 0% 82%)";
                  e.currentTarget.style.color = "hsl(0 0% 35%)";
                }
              }}
            >
              {size}
            </button>
          );
        })}
      </div>
    </FilterSection>

    <Separator style={{ backgroundColor: "hsl(0 0% 90%)" }} />

    <FilterSection title="Availability">
      <div className="space-y-3">
        {availabilityOptions.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedAvailability.includes(opt)}
              onCheckedChange={() => toggleAvailability(opt)}
              className="border-[hsl(0_0%_70%)] data-[state=checked]:bg-[hsl(186_35%_28%)] data-[state=checked]:border-[hsl(186_35%_28%)]"
            />
            <span
              className="font-cormorant text-[15px] transition-colors duration-200 group-hover:text-[hsl(186_35%_28%)]"
              style={{ color: "hsl(0 0% 35%)" }}
            >
              {opt}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  </div>
);

/* ───── Main Page ───── */
const ShopAll = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("newest");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const sortOptions = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  const toggleAvailability = (a: string) =>
    setSelectedAvailability((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  const filterProps = {
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    selectedSizes,
    toggleSize,
    selectedAvailability,
    toggleAvailability,
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setSelectedSizes([]);
    setSelectedAvailability([]);
  };

  /* Navbar heights: mobile 94px, md 100px, lg 116px */
  /* Toolbar height ~52px */
  const toolbarTop = { mobile: 94, md: 100, lg: 116 };
  const sidebarTop = { lg: 116 + 52 + 16 }; // navbar + toolbar + gap

  return (
    <div className="h-screen flex flex-col overflow-hidden pt-[94px] md:pt-[100px] lg:pt-[116px]">
      {/* ── Fixed Shop Toolbar ── */}
      <div
        className="shrink-0 z-30"
        style={{
          backgroundColor: "hsl(0 0% 98%)",
          borderBottom: "1px solid hsl(0 0% 90%)",
        }}
      >
        {/* Desktop / Tablet toolbar */}
        <div className="hidden md:block">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-10">
            <div className="flex items-center justify-between h-[52px] relative">
              {/* Grid toggle – desktop only */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => setGridCols(3)}
                  className="p-2 rounded-md transition-colors duration-150"
                  style={{
                    backgroundColor: gridCols === 3 ? "hsl(0 0% 92%)" : "transparent",
                    color: gridCols === 3 ? "hsl(0 0% 15%)" : "hsl(0 0% 55%)",
                  }}
                  title="3 columns"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className="p-2 rounded-md transition-colors duration-150"
                  style={{
                    backgroundColor: gridCols === 4 ? "hsl(0 0% 92%)" : "transparent",
                    color: gridCols === 4 ? "hsl(0 0% 15%)" : "hsl(0 0% 55%)",
                  }}
                  title="4 columns"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>

              {/* Product count */}
              <p
                className="font-cormorant text-[14px] tracking-wide lg:absolute lg:left-1/2 lg:-translate-x-1/2"
                style={{ color: "hsl(0 0% 45%)" }}
              >
                {allProducts.length} Products
              </p>

              {/* Sort */}
              <div className="ml-auto">
                <Select value={sortValue} onValueChange={setSortValue}>
                  <SelectTrigger
                    className="w-[200px] font-cormorant text-[14px] border rounded-md"
                    style={{ borderColor: "hsl(0 0% 82%)", color: "hsl(0 0% 30%)" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="font-cormorant">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile toolbar */}
        <div className="flex md:hidden items-center gap-3 px-5 h-[52px]">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border font-cormorant text-[14px] font-medium transition-colors duration-200"
                style={{
                  borderColor: "hsl(0 0% 82%)",
                  color: "hsl(0 0% 25%)",
                  backgroundColor: "hsl(0 0% 100%)",
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-cormorant text-[20px]">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 pb-4">
                <FilterSidebar {...filterProps} />
                <div className="flex gap-3 mt-8">
                  <button
                    className="flex-1 py-3 rounded-full border font-cormorant text-[14px] font-medium"
                    style={{ borderColor: "hsl(0 0% 82%)", color: "hsl(0 0% 40%)" }}
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 py-3 rounded-full font-cormorant text-[14px] font-medium"
                    style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
            <DialogTrigger asChild>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border font-cormorant text-[14px] font-medium transition-colors duration-200"
                style={{
                  borderColor: "hsl(0 0% 82%)",
                  color: "hsl(0 0% 25%)",
                  backgroundColor: "hsl(0 0% 100%)",
                }}
              >
                <ArrowUpDown size={14} />
                Sort
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="px-5 pt-5 pb-3">
                <DialogTitle className="font-cormorant text-[18px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
                  Sort By
                </DialogTitle>
              </DialogHeader>
              <div className="pb-5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className="w-full flex items-center justify-between px-5 py-3 font-cormorant text-[15px] transition-colors duration-150"
                    style={{
                      color: sortValue === opt.value ? "hsl(186 35% 28%)" : "hsl(0 0% 30%)",
                      backgroundColor: sortValue === opt.value ? "hsl(186 35% 28% / 0.06)" : "transparent",
                    }}
                    onClick={() => {
                      setSortValue(opt.value);
                      setMobileSortOpen(false);
                    }}
                  >
                    {opt.label}
                    {sortValue === opt.value && <Check size={16} style={{ color: "hsl(186 35% 28%)" }} />}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Fixed two-column shop layout ── */}
      <div className="flex-1 flex min-h-0" style={{ backgroundColor: "hsl(0 0% 98%)" }}>
        <div className="max-w-[1400px] mx-auto flex w-full">
          {/* Fixed sidebar – desktop/tablet */}
          <aside
            className="hidden md:block w-[240px] lg:w-[280px] shrink-0 overflow-y-auto px-8 lg:px-10 py-8"
            style={{ borderRight: "1px solid hsl(0 0% 92%)" }}
          >
            <FilterSidebar {...filterProps} />
          </aside>

          {/* Scrollable product grid */}
          <div className="flex-1 min-w-0 overflow-y-auto px-5 md:px-8 lg:px-10 py-8">
            <div
              className={`grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12 ${
                gridCols === 4
                  ? "lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14"
                  : "lg:grid-cols-3 lg:gap-x-8 lg:gap-y-[60px]"
              }`}
            >
              {allProducts.map((product, i) => (
                <ProductCard key={i} product={product} index={i} visible />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAll;
