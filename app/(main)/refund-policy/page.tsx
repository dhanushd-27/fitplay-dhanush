"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function RefundPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <>
      {/* Custom Solid Green Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-800 to-emerald-900 border-b border-emerald-700/50 shadow-lg shadow-emerald-500/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="group cursor-pointer">
            <Image
              src="/logo.png"
              alt="FitPlay Logo"
              width={120}
              height={120}
              className="transition-all duration-300 group-hover:scale-105 drop-shadow-lg rounded-lg object-contain"
              priority
            />
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-white/80 hover:text-white transition-all duration-300 font-medium">
              Home
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white transition-all duration-300 font-medium">
              About us
            </Link>
            <Link href="/store" className="text-white/80 hover:text-white transition-all duration-300 font-medium">
              Wellness Store
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/partner" 
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
            >
              Partner with Us
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-4">
                  Refund & Cancellation Policy
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto rounded-full"></div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Fitplay.life, we strive to ensure a smooth and transparent experience. 
                  Refunds and cancellations are handled based on product type and fulfillment status.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Cancellation</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Orders can be cancelled before dispatch, subject to vendor policies</li>
                  <li>Once dispatched, cancellation may not be possible</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refunds</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Eligible refunds are processed to the original payment method or wallet/credits, as applicable</li>
                  <li>Refund timelines may vary depending on the payment gateway and partner</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Credits & Wallet</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Credits used for purchases are non-refundable unless explicitly stated</li>
                  <li>In case of eligible cancellations, credits may be restored to the user wallet</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Digital services or consultations once availed</li>
                  <li>Items marked as non-returnable by partners</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
                <p className="text-gray-700 leading-relaxed">
                  Refunds typically take 5–10 business days to reflect, depending on payment method.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  For refund or cancellation requests, contact:
                </p>
                <p className="text-emerald-600 font-medium mt-2">
                  📧 support@fitplay.life
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}