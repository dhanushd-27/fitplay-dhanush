"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Script from "next/script";

export default function PaidSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayAndSignup = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please complete the form with a valid email.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError("Failed to load payment library");
      setLoading(false);
      return;
    }

    // create guest order
    const createRes = await fetch("/api/payments/create-guest-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 299, name: form.name, email: form.email, phone: form.phone }),
    });

    const order = await createRes.json();
    if (!createRes.ok) {
      setError(order.error || "Failed to create order");
      setLoading(false);
      return;
    }

    const options: any = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "FitPlay Life",
      description: "One-time access - ₹299",
      order_id: order.razorpayOrderId,
      handler: async function (response: any) {
        // verify and create user
        const verifyRes = await fetch("/api/payments/verify-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          setError(verifyData.error || "Payment verification failed");
        } else {
          // success — ask user to login
          router.push('/login');
        }
        setLoading(false);
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#10B981" },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Paid Account</h2>
        <p className="text-sm text-gray-600 mb-4">One-time payment of ₹299 gives you access to all features.</p>

        <div className="space-y-3">
          <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          <Input placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} />
          <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="mt-6 flex gap-3">
          <Button className="flex-1 bg-emerald-600" onClick={handlePayAndSignup} disabled={loading}>{loading ? 'Processing...' : 'Pay ₹299 & Create Account'}</Button>
          <Button variant="outline" onClick={() => router.push('/signup')}>Invite Signup</Button>
        </div>
      </div>
    </div>
  );
}
