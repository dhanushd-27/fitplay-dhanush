"use client";

import { useState } from "react";

export default function ConnectShopifyPage() {
  const [shop, setShop] = useState("");
  const [error, setError] = useState("");

  const normalizeShopDomain = (input: string) => {
    let domain = input.trim();

    // remove https:// or http://
    domain = domain.replace(/^https?:\/\//, "");

    // remove trailing slash
    domain = domain.replace(/\/$/, "");

    return domain;
  };

  const handleConnect = () => {
    setError("");

    const cleanedShop = normalizeShopDomain(shop);

    if (!cleanedShop.endsWith(".myshopify.com")) {
      setError("Please enter a valid Shopify domain (mystore.myshopify.com)");
      return;
    }

    window.location.href = `/api/shopify/install?shop=${cleanedShop}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Connect Your Shopify Store
        </h1>

        <input
          type="text"
          placeholder="mystore.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleConnect}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
        >
          Install Shopify App
        </button>
      </div>
    </div>
  );
}
