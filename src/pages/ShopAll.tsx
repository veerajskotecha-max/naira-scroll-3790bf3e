import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const FilterSidebar = ({
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  selectedSizes,
  toggleSize,
}: {
  selectedCategories: string[];
  toggleCategory: (c: string) => void;
  priceRange: number[];
  setPriceRange: (v: number[]) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
}) => (
  <div className="space-y-8">
    {/* Filters label */}
    <div>
      <p
        className="font-cormorant text-[13px] uppercase tracking-[0.15em] font-medium"
        style={{ color: "hsl(0 0% 48%)" }}
      >
        Filters
      </p>
      <Separator className="mt-3" style={{ backgroundColor: "hsl(0 0% 85%)" }} />
    </div>

    {/* Categories */}
    <div>
      <h3
        className="font-cormorant text-[18px] font-semibold mb-4"
        style={{ color: "hsl(0 0% 18%)" }}
      >
        Categories
      </h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-3 cursor-pointer group"
          >
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
    </div>

    {/* Price Range */}
    <div>
      <h3
        className="font-cormorant text-[18px] font-semibold mb-4"
        style={{ color: "hsl(0 0% 18%)" }}
      >
        Price Range
      </h3>
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
    </div>

    {/* Sizes */}
    <div>
      <h3
        className="font-cormorant text-[18px] font-semibold mb-4"
        style={{ color: "hsl(0 0% 18%)" }}
      >
        Size
      </h3>
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
    </div>
  </div>
);

const ShopAll = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const filterProps = {
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    selectedSizes,
    toggleSize,
  };

  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <div
        className="min-h-screen"
        style={{ backgroundColor: "hsl(0 0% 98%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10 py-10 md:py-14 lg:py-16">
          {/* Page header */}
          <div className="flex items-center justify-between mb-10 md:mb-12">
            <h1
              className="font-cormorant text-[28px] md:text-[34px] lg:text-[40px] font-semibold"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              Shop All
            </h1>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-md border font-cormorant text-[14px] font-medium transition-colors duration-200"
                    style={{
                      borderColor: "hsl(0 0% 82%)",
                      color: "hsl(0 0% 25%)",
                    }}
                  >
                    <SlidersHorizontal size={15} />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-cormorant text-[20px]">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar {...filterProps} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort dropdown */}
              <Select defaultValue="newest">
                <SelectTrigger
                  className="w-[180px] md:w-[200px] font-cormorant text-[14px] border rounded-md"
                  style={{
                    borderColor: "hsl(0 0% 82%)",
                    color: "hsl(0 0% 30%)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="font-cormorant">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low" className="font-cormorant">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="font-cormorant">Price: High to Low</SelectItem>
                  <SelectItem value="popular" className="font-cormorant">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-10 lg:gap-14">
            {/* Left sidebar — desktop only */}
            <aside className="hidden lg:block w-[280px] shrink-0 self-start sticky top-[130px] max-h-[calc(100vh-150px)] overflow-y-auto">
              <FilterSidebar {...filterProps} />
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-[60px]">
                {allProducts.map((product, i) => (
                  <ProductCard key={i} product={product} index={i} visible />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopAll;
