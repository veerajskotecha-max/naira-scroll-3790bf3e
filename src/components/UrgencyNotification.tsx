import { useState, useEffect, useCallback } from "react";
import { X, TrendingUp } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const productImages = [product1, product2, product3, product4];

const messages = [
  "Only 4 pieces left in stock",
  "7 people are viewing this item right now",
  "This item was purchased 3 times today",
  "Popular item in the last 24 hours",
  "Almost sold out in this size",
  "Recently added to carts by other shoppers",
];

const SESSION_KEY = "naira_urgency_count";
const MAX_POPUPS = 3;

const UrgencyNotification = () => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentImage, setCurrentImage] = useState(product1);
  const [dismissed, setDismissed] = useState(false);

  const getSessionCount = () => {
    return parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
  };

  const incrementCount = () => {
    const count = getSessionCount() + 1;
    sessionStorage.setItem(SESSION_KEY, String(count));
    return count;
  };

  const showPopup = useCallback(() => {
    if (dismissed || getSessionCount() >= MAX_POPUPS) return;

    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    setCurrentImage(productImages[Math.floor(Math.random() * productImages.length)]);
    setExiting(false);
    setVisible(true);
    incrementCount();

    setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 300);
    }, 4500);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return;

    const initialDelay = 8000 + Math.random() * 4000;
    const initialTimer = setTimeout(() => {
      showPopup();

      const interval = setInterval(() => {
        if (getSessionCount() >= MAX_POPUPS) {
          clearInterval(interval);
          return;
        }
        const delay = 25000 + Math.random() * 15000;
        setTimeout(showPopup, delay);
      }, 30000);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, [dismissed, showPopup]);

  // Listen for Add to Cart interaction
  useEffect(() => {
    const handler = () => setDismissed(true);
    const btn = document.getElementById("product-actions");
    if (btn) {
      btn.addEventListener("click", handler);
      return () => btn.removeEventListener("click", handler);
    }
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed z-50 bottom-4 left-4 md:bottom-6 md:left-6 max-w-[320px] w-[calc(100vw-2rem)] md:w-auto transition-all ${
        exiting
          ? "opacity-0 translate-y-3"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        transitionDuration: exiting ? "300ms" : "400ms",
        transitionTimingFunction: "ease-out",
      }}
    >
      <div
        className="flex items-center gap-3 p-3 rounded-xl shadow-lg border"
        style={{
          backgroundColor: "hsl(30 20% 96%)",
          borderColor: "hsl(30 15% 88%)",
          boxShadow: "0 8px 30px -8px hsla(0,0%,0%,0.12)",
        }}
      >
        {/* Product thumbnail */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0">
          <img
            src={currentImage}
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} style={{ color: "hsl(186 35% 28%)" }} />
            <span
              className="text-[10px] uppercase tracking-[0.1em] font-semibold"
              style={{ color: "hsl(186 35% 28%)" }}
            >
              Live Update
            </span>
          </div>
          <p
            className="font-cormorant text-[13px] md:text-[14px] leading-snug font-medium"
            style={{ color: "hsl(0 0% 25%)" }}
          >
            {currentMessage}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors self-start"
          style={{ color: "hsl(0 0% 55%)" }}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default UrgencyNotification;
