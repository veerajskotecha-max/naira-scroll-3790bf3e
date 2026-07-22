import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import UrgencyNotification from "@/components/UrgencyNotification";
import { SlidersHorizontal, ArrowUpDown, X, Check, Columns2, LayoutGrid, LayoutList, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProductCard, { productFromShopify } from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ShopHero from "@/components/shop/ShopHero";
import JewellerySection from "@/components/shop/JewellerySection";
import CustomizationCTA from "@/components/product/CustomizationCTA";
import { fetchShopifyProducts } from "@/lib/shopify";

const sizes = ["XS", "S", "M", "L", "XL"];

const categorySlugMap: Record<string, string> = {
  "dresses": "Dresses",
  "co-ord-sets": "Co-ord Sets",
  "fusion-sarees": "Fusion Sarees",
  "festive": "Festive Collection",
  "new": "",
};
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
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  selectedSizes,
  toggleSize,
  selectedAvailability,
  toggleAvailability,
}: {
  categories: string[];
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
              className="min-w-[44px] h-[44px] flex items-center justify-center font-cormorant text-[14px] font-medium transition-all duration-200 border"
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
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("newest");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [mobileLayout, setMobileLayout] = useState<"grid" | "list">("grid");
  const { data: shopifyProducts = [], isLoading, isError } = useQuery({
    queryKey: ["shopify-products", "shop-all"],
    queryFn: () => fetchShopifyProducts(50),
    staleTime: 1000 * 60 * 5,
  });
  const allProducts = useMemo(() => shopifyProducts.map(productFromShopify), [shopifyProducts]);
  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((product) => product.category).filter(Boolean))),
    [allProducts]
  );

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
    categories,
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

  // Auto-apply category from URL query param
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const mapped = categorySlugMap[categoryParam.toLowerCase()];
      if (mapped) {
        setSelectedCategories([mapped]);
      } else {
        setSelectedCategories([]);
      }
    }
  }, [searchParams]);

  /* ── Memoized filtering + sorting ── */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price range filter
    result = result.filter(
      (p) => p.numericPrice >= priceRange[0] && p.numericPrice <= priceRange[1]
    );

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        selectedSizes.some((s) => p.sizes.includes(s))
      );
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      result = result.filter((p) => selectedAvailability.includes(p.availability));
    }

    // Sorting (applied after filtering)
    switch (sortValue) {
      case "price-low":
        result = [...result].sort((a, b) => a.numericPrice - b.numericPrice);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.numericPrice - a.numericPrice);
        break;
      case "popular":
        // Prioritise tagged items (BESTSELLER, etc.)
        result = [...result].sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
        break;
      case "newest":
      default:
        break; // original order
    }

    return result;
  }, [allProducts, selectedCategories, priceRange, selectedSizes, selectedAvailability, sortValue]);

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedAvailability.length +
    (priceRange[0] !== 0 || priceRange[1] !== 50000 ? 1 : 0);

  /* Navbar heights: mobile 94px, md 100px, lg 116px */
  /* Toolbar height ~52px */
  const toolbarTop = { mobile: 94, md: 100, lg: 116 };
  const sidebarTop = { lg: 116 + 52 + 16 }; // navbar + toolbar + gap

  return (
    <div className="min-h-screen flex flex-col pt-[94px] md:pt-[100px] lg:pt-[116px]">
      {/* ── Campaign Hero ── */}
      <ShopHero
        eyebrow="New Arrivals"
        title="The Festive"
        titleAccent="Edit"
        description="Curated silhouettes for the season — handwoven textures, refined embroidery, and contemporary drape."
        primaryCta={{ label: "Shop Now", to: "/shop" }}
        secondaryCta={{ label: "Explore Collection", to: "/shop?category=festive" }}
      />

      {/* ── Jewellery (Coming Soon behind feature flag) ── */}
      <JewellerySection />

      {/* ── Indo-Western Outfits section header ── */}
      <section
        id="indo-western"
        className="w-full"
        style={{ scrollMarginTop: "120px", backgroundColor: "hsl(0 0% 98%)" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 pt-12 md:pt-16 lg:pt-20 pb-6 text-center">
          <span
            className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] font-medium"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            Ready to Wear
          </span>
          <h2
            className="mt-3 font-cormorant text-[34px] md:text-[46px] lg:text-[56px] font-semibold leading-[1.05] tracking-[-0.01em]"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            Indo-Western Outfits
          </h2>
          <div
            className="mx-auto mt-4"
            style={{ width: "56px", height: "1px", backgroundColor: "hsl(150 12% 71%)" }}
          />
        </div>
      </section>

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
                  onClick={() => setGridCols(2)}
                  className="p-2 transition-colors duration-150"
                  style={{
                    backgroundColor: gridCols === 2 ? "hsl(0 0% 92%)" : "transparent",
                    color: gridCols === 2 ? "hsl(0 0% 15%)" : "hsl(0 0% 55%)",
                  }}
                  title="2 columns"
                >
                  <Columns2 size={18} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className="p-2 transition-colors duration-150"
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
                {isLoading ? "Loading" : filteredProducts.length} Product{!isLoading && filteredProducts.length !== 1 ? "s" : ""}
              </p>

              {/* Sort */}
              <div className="ml-auto">
                <Select value={sortValue} onValueChange={setSortValue}>
                  <SelectTrigger
                    className="w-[200px] font-cormorant text-[14px] border"
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
        <div className="flex md:hidden items-center gap-2 px-5 h-[52px]">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border font-cormorant text-[14px] font-medium transition-colors duration-200"
                style={{
                  borderColor: "hsl(0 0% 82%)",
                  color: "hsl(0 0% 25%)",
                  backgroundColor: "hsl(0 0% 100%)",
                }}
              >
                <SlidersHorizontal size={14} />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-cormorant text-[20px]">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 pb-4">
                <FilterSidebar {...filterProps} />
                <div className="flex gap-3 mt-8">
                  <button
                    className="flex-1 py-3 border font-cormorant text-[14px] font-medium"
                    style={{ borderColor: "hsl(0 0% 82%)", color: "hsl(0 0% 40%)" }}
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 py-3 font-cormorant text-[14px] font-medium"
                    style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
            <DialogTrigger asChild>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border font-cormorant text-[14px] font-medium transition-colors duration-200"
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
            <DialogContent className="max-w-[340px] p-0 overflow-hidden">
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

          {/* Layout toggle */}
          <div
            className="flex items-center border overflow-hidden"
            style={{ borderColor: "hsl(0 0% 82%)", backgroundColor: "hsl(0 0% 100%)" }}
          >
            <button
              className="p-2.5 transition-colors duration-150"
              style={{
                backgroundColor: mobileLayout === "grid" ? "hsl(0 0% 92%)" : "transparent",
                color: mobileLayout === "grid" ? "hsl(0 0% 15%)" : "hsl(0 0% 55%)",
              }}
              onClick={() => setMobileLayout("grid")}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              className="p-2.5 transition-colors duration-150"
              style={{
                backgroundColor: mobileLayout === "list" ? "hsl(0 0% 92%)" : "transparent",
                color: mobileLayout === "list" ? "hsl(0 0% 15%)" : "hsl(0 0% 55%)",
              }}
              onClick={() => setMobileLayout("list")}
              title="List view"
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column shop layout ── */}
      <div className="flex-1 flex" style={{ backgroundColor: "hsl(0 0% 98%)" }}>
        <div className="max-w-[1400px] mx-auto flex w-full">
          {/* Sidebar – desktop/tablet */}
          <aside
            className="hidden md:block w-[240px] lg:w-[280px] shrink-0 px-8 lg:px-10 py-8 sticky top-[146px] md:top-[152px] lg:top-[168px] self-start max-h-[calc(100vh-168px)] overflow-y-auto"
            style={{ borderRight: "1px solid hsl(0 0% 92%)" }}
          >
            <FilterSidebar {...filterProps} />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-8">
            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedCategories.map((cat) => (
                  <button
                    key={`chip-cat-${cat}`}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-cormorant text-[13px] font-medium border transition-colors duration-150"
                    style={{
                      borderColor: "hsl(186 35% 28%)",
                      color: "hsl(186 35% 28%)",
                      backgroundColor: "hsl(186 35% 28% / 0.06)",
                    }}
                  >
                    {cat}
                    <X size={12} />
                  </button>
                ))}
                {(priceRange[0] !== 0 || priceRange[1] !== 50000) && (
                  <button
                    onClick={() => setPriceRange([0, 50000])}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-cormorant text-[13px] font-medium border transition-colors duration-150"
                    style={{
                      borderColor: "hsl(186 35% 28%)",
                      color: "hsl(186 35% 28%)",
                      backgroundColor: "hsl(186 35% 28% / 0.06)",
                    }}
                  >
                    ₹{(priceRange[0] / 1000).toFixed(0)}k – ₹{(priceRange[1] / 1000).toFixed(0)}k
                    <X size={12} />
                  </button>
                )}
                {selectedSizes.map((size) => (
                  <button
                    key={`chip-size-${size}`}
                    onClick={() => toggleSize(size)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-cormorant text-[13px] font-medium border transition-colors duration-150"
                    style={{
                      borderColor: "hsl(186 35% 28%)",
                      color: "hsl(186 35% 28%)",
                      backgroundColor: "hsl(186 35% 28% / 0.06)",
                    }}
                  >
                    Size {size}
                    <X size={12} />
                  </button>
                ))}
                {selectedAvailability.map((a) => (
                  <button
                    key={`chip-avail-${a}`}
                    onClick={() => toggleAvailability(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-cormorant text-[13px] font-medium border transition-colors duration-150"
                    style={{
                      borderColor: "hsl(186 35% 28%)",
                      color: "hsl(186 35% 28%)",
                      backgroundColor: "hsl(186 35% 28% / 0.06)",
                    }}
                  >
                    {a}
                    <X size={12} />
                  </button>
                ))}
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 font-cormorant text-[13px] font-medium transition-colors duration-150"
                  style={{ color: "hsl(0 0% 45%)" }}
                >
                  Clear All
                </button>
              </div>
            )}

            {isLoading ? (
              <div
                className={`grid md:grid-cols-2 lg:grid-cols-3 gap-x-5 md:gap-x-6 md:gap-y-12 transition-opacity duration-300 ${
                  mobileLayout === "list" ? "grid-cols-1 gap-y-8" : "grid-cols-2 gap-y-10"
                } ${
                  gridCols === 4 ? "lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14" : "lg:grid-cols-2 lg:gap-x-10 lg:gap-y-16"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted" style={{ aspectRatio: "3/4" }} />
                    <div className="h-4 bg-muted mt-3 w-3/4" />
                    <div className="h-3 bg-muted mt-2 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 || isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-cormorant text-[22px] font-semibold mb-2" style={{ color: "hsl(0 0% 25%)" }}>
                  No products found
                </p>
                <p className="font-cormorant text-[15px] mb-6" style={{ color: "hsl(0 0% 50%)" }}>
                  {isError ? "Shopify products could not be loaded right now." : "Try adjusting your filters to discover more pieces."}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 font-cormorant text-[14px] font-medium transition-colors duration-200"
                  style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid md:grid-cols-2 lg:grid-cols-3 gap-x-5 md:gap-x-6 md:gap-y-12 transition-opacity duration-300 ${
                  mobileLayout === "list" ? "grid-cols-1 gap-y-8" : "grid-cols-2 gap-y-10"
                } ${
                  gridCols === 4
                    ? "lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14"
                    : "lg:grid-cols-2 lg:gap-x-10 lg:gap-y-16"
                }`}
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.handle ?? product.name} product={product} index={i} visible />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Customisation CTA – nudge users who didn't find a fit */}
      <CustomizationCTA />

      {/* Footer at root level – full width */}
      <Footer />
      <UrgencyNotification />
    </div>
  );
};

export default ShopAll;
