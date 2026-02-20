"use client";

import React, { useEffect, useState } from "react";
import { Wallet, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


interface CreditPurchaseProps {
  currentCredits: number;
  requiredCredits: number;
  onClose?: () => void;
}

const PACKS = [500, 1000, 2000];
const CREDIT_RATE = 2; // ₹1 = 2 credits

export function CreditPurchase({
  currentCredits,
  requiredCredits,
  onClose,
}: CreditPurchaseProps) {
  // 🔑 Keep input as string (important)
  const [amountInput, setAmountInput] = useState<string>("500");
  const [selectedPack, setSelectedPack] = useState<number | null>(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failure">("idle");
  const [profile, setProfile] = useState<any>(null);

  const amount = Number(amountInput) || 0;
  const credits = amount * CREDIT_RATE;

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    if (amount <= 0) return;

    // Check if user is demo user
    const session = await fetch("/api/auth/session").then(r => r.json());
    if ((session?.user as any)?.isDemo) {
      toast.error("Demo users cannot top-up wallet", {
        description: "Demo accounts come with 10,000 free credits for testing. Top-ups are not available.",
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    setStatus("idle");

    const loaded = await loadRazorpay();
    if (!loaded) {
      setIsProcessing(false);
      alert("Razorpay failed to load");
      return;
    }

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const order = await res.json();
    if (!order?.key) {
      setIsProcessing(false);
      alert("Order creation failed");
      return;
    }

    onClose?.();

    const razorpay = new (window as any).Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "FitPlay Life",
      description: "Credit Top-up",
      order_id: order.razorpayOrderId,
      handler: async (response: any) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const result = await verify.json();
        setStatus(result.success ? "success" : "failure");
      },
      modal: {
        ondismiss: () => setStatus("failure"),
      },
      prefill: {
        name: profile?.data?.name || "User",
        email: profile?.data?.email || "user@email.com",
        contact: profile?.data?.phone || "9999999999",
      },
      theme: { color: "#10B981" },
    });

    razorpay.open();
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
            <Wallet className="w-5 h-5" />
            Buy Credits
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Balance:{" "}
            <Badge className="bg-emerald-100 text-emerald-700">
              {currentCredits} credits
            </Badge>
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Conversion */}
      <div className="rounded-lg bg-emerald-100 text-emerald-800 text-sm px-3 py-2">
        💡 Conversion Rate: <strong>₹1 = 2 credits</strong>
      </div>

      {/* Preset Packs */}
      <div>
        <p className="text-sm font-medium mb-2">Quick Packs</p>
        <div className="grid grid-cols-3 gap-3">
          {PACKS.map((pack) => (
            <Button
              key={pack}
              variant={selectedPack === pack ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => {
                setSelectedPack(pack);
                setAmountInput(String(pack));
              }}
            >
              ₹{pack}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <p className="text-sm font-medium mb-1">Custom Amount (₹)</p>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Enter any amount"
          value={amountInput}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "") {
              setAmountInput("");
              setSelectedPack(null);
              return;
            }

            if (!/^\d+$/.test(value)) return;

            setAmountInput(value);
            setSelectedPack(null);
          }}
        />
      </div>

      {/* Calculation */}
      <div className="border rounded-xl p-4 bg-white space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Amount</span>
          <span className="font-semibold">₹{amount}</span>
        </div>
        <div className="flex justify-between">
          <span>Credits</span>
          <span className="font-semibold text-emerald-700">
            {credits} credits
          </span>
        </div>
      </div>

      {/* Status */}
      {status === "success" && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" /> Payment successful
        </div>
      )}

      {status === "failure" && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle className="w-4 h-4" /> Payment failed or cancelled
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600"
          disabled={isProcessing || amount <= 0}
          onClick={handlePay}
        >
          {isProcessing ? "Processing..." : `Pay ₹${amount}`}
        </Button>
      </div>
    </div>
  );
}
