"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPolicyPage() {
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
                  Privacy Policy
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto rounded-full"></div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Fitplay.life ("we", "us", "our") respects your privacy and is committed to protecting your personal data. 
                  This Privacy Policy explains how we collect, use, store, and safeguard your information when you use our platform.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By accessing or using Fitplay.life, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-2">We may collect:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-6">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Company name and role</li>
                  <li>Shipping and billing address</li>
                  <li>Login credentials (encrypted)</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Transaction Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-6">
                  <li>Orders placed on the platform</li>
                  <li>Payment status (we do not store card or UPI details)</li>
                  <li>Wallet/credit usage</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device information</li>
                  <li>Usage data and activity logs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 mb-2">We use your information to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Provide and operate the Fitplay.life platform</li>
                  <li>Process orders and payments</li>
                  <li>Manage user accounts and roles</li>
                  <li>Communicate order updates and notifications</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payments</h2>
                <p className="text-gray-700 leading-relaxed">
                  Payments on Fitplay.life are processed securely via third-party payment gateways such as Razorpay. 
                  We do not store or process sensitive payment information like card numbers or UPI credentials.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
                <p className="text-gray-700 mb-2">We may share limited data with:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Payment gateways (for transaction processing)</li>
                  <li>Fulfillment and service partners (for order delivery)</li>
                  <li>Analytics and infrastructure service providers</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell or rent your personal data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement reasonable technical and organizational safeguards to protect your data against 
                  unauthorized access, loss, or misuse.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 mb-2">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request correction or deletion</li>
                  <li>Withdraw consent (subject to legal obligations)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions regarding this Privacy Policy, contact us at:
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