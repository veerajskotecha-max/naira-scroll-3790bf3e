import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

/**
 * Safety net for Shopify checkout links that land on our own domain.
 *
 * Shopify's primary domain is nairaflore.com, which is served by this app — so
 * Shopify sometimes bounces a checkout (/cart/c/<token> or /checkouts/cn/<token>)
 * to nairaflore.com, where it would hit our 404. We catch those paths and send
 * the shopper back to the real checkout on the Shopify domain, keeping every
 * query param (key, discount, channel) intact.
 */
const CartCheckoutRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const { search, pathname } = useLocation();

  useEffect(() => {
    const fallbackToken = pathname.split("/").filter(Boolean).pop();
    const checkoutToken = token || fallbackToken;
    if (!checkoutToken) {
      window.location.replace("/");
      return;
    }
    const params = new URLSearchParams(search);
    params.set("channel", "online_store");
    const target = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/checkouts/cn/${checkoutToken}?${params.toString()}`;
    window.location.replace(target);
  }, [token, search, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F1ED" }}>
      <p className="font-cormorant text-[18px]" style={{ color: "hsl(0 0% 30%)" }}>
        Redirecting to secure checkout…
      </p>
    </div>
  );
};

export default CartCheckoutRedirect;
