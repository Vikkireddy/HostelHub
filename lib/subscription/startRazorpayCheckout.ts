import { fetchWithHostel } from "@/lib/ApiClient";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription/constants";

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayLoader: Promise<boolean> | null = null;

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayWindowOptions) => RazorpayWindowInstance;
  }
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayWindowOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayWindowInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

export interface StartRazorpayCheckoutOptions {
  prefill?: { name?: string; email?: string; contact?: string };
  onPaid: (payload: { expiresAt: string }) => void | Promise<void>;
  onOrderFailed: (message: string) => void;
  onVerifyFailed: (message: string) => void;
  onDismiss?: () => void;
  onPaymentFailed?: () => void;
}

async function ensureRazorpayLoaded(timeoutMs = 12000): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;
  if (razorpayLoader) return razorpayLoader;

  razorpayLoader = new Promise<boolean>((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };

    const existing = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`
    ) as HTMLScriptElement | null;

    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = RAZORPAY_CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", () => finish(Boolean(window.Razorpay)), { once: true });
    script.addEventListener("error", () => finish(false), { once: true });

    window.setTimeout(() => finish(Boolean(window.Razorpay)), timeoutMs);
  });

  const loaded = await razorpayLoader;
  if (!loaded) {
    razorpayLoader = null;
  }
  return loaded;
}

/**
 * Creates a Razorpay order and opens checkout. Calls onPaid after server verification.
 */
export async function startRazorpayCheckout(
  planId: string,
  hostelId: number,
  options: StartRazorpayCheckoutOptions
): Promise<void> {
  const loaded = await ensureRazorpayLoaded();
  const Rz = loaded && typeof window !== "undefined" ? window.Razorpay : undefined;
  if (!Rz) {
    options.onOrderFailed(
      "Razorpay checkout failed to load. Check internet/ad-blocker and try again."
    );
    return;
  }

  let orderData: {
    success: boolean;
    message?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    planName?: string;
  };

  try {
    const orderRes = await fetchWithHostel("/api/subscription/create-order", hostelId, {
      method: "POST",
      body: JSON.stringify({ planId }),
    });
    orderData = await orderRes.json();
  } catch {
    options.onOrderFailed("Failed to create payment order. Please try again.");
    return;
  }

  if (
    !orderData.success ||
    !orderData.orderId ||
    orderData.amount == null ||
    !orderData.currency ||
    !orderData.keyId
  ) {
    options.onOrderFailed(orderData.message || "Failed to create order");
    return;
  }

  const { orderId, amount, currency, keyId, planName } = orderData;

  const rzpOptions: RazorpayWindowOptions & { modal?: { ondismiss?: () => void } } = {
    key: keyId,
    amount,
    currency,
    order_id: orderId,
    name: "Admin HostelHub",
    description: `${planName ?? "Plan"} — Monthly subscription`,
    prefill: options.prefill,
    theme: { color: "#18222e" },
    modal: {
      ondismiss: options.onDismiss,
    },
    handler: async (response: RazorpayPaymentResponse) => {
      try {
        const verifyRes = await fetchWithHostel("/api/subscription/verify-payment", hostelId, {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success && typeof verifyData.expiresAt === "string") {
          await options.onPaid({ expiresAt: verifyData.expiresAt });
        } else {
          options.onVerifyFailed(verifyData.message || "Payment verification failed");
        }
      } catch {
        options.onVerifyFailed("Failed to verify payment. Please contact support.");
      }
    },
  };

  const rzp = new Rz(rzpOptions);
  rzp.on("payment.failed", () => {
    options.onPaymentFailed?.();
  });
  rzp.open();
}

export function planLabel(planId: string): string {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name ?? planId;
}
