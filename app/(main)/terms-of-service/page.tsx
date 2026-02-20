"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsOfServicePage() {
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
                  Terms of Service
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto rounded-full"></div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using Fitplay.life, you agree to be bound by these Terms of Service. 
                  If you do not agree, please do not use the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  Fitplay.life is a corporate wellness platform that enables employees of partner organizations to 
                  access curated wellness products and services through credits and/or monetary payments.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Users must provide accurate and complete information</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                  <li>Unauthorized use must be reported immediately</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders & Fulfillment</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Orders placed on Fitplay.life are fulfilled by third-party partners</li>
                  <li>Delivery timelines, availability, and fulfillment may vary by product or location</li>
                  <li>Fitplay.life acts as a facilitator and does not manufacture products</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing & Credits</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Prices and credits are determined as per corporate agreements</li>
                  <li>Credits have no cash value and cannot be withdrawn</li>
                  <li>Credits may expire as per company policy</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
                <p className="text-gray-700 mb-2">Users must not:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Misuse the platform</li>
                  <li>Attempt unauthorized access</li>
                  <li>Engage in fraudulent or abusive behavior</li>
                  <li>Violate applicable laws</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  Fitplay.life shall not be liable for indirect, incidental, or consequential damages arising from platform usage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate accounts for violations of these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms shall be governed by the laws of India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                <p className="text-emerald-600 font-medium">
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