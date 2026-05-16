import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

const CartCheckoutRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const { search } = useLocation();

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams(search);
    params.set("channel", "online_store");
    const target = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/checkouts/cn/${token}?${params.toString()}`;
    window.location.replace(target);
  }, [token, search]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F1ED" }}>
      <p className="font-cormorant text-[18px]" style={{ color: "hsl(0 0% 30%)" }}>
        Redirecting to secure checkout…
      </p>
    </div>
  );
};

export default CartCheckoutRedirect;
