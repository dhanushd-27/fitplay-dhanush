"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              FitPlay.life
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Transforming corporate wellness through innovative technology and curated health solutions.
            </p>
            <div className="flex space-x-4 pt-4">
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/home" className="text-gray-400 hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link href="/store" className="text-gray-400 hover:text-emerald-400 transition-colors">Wellness Store</Link></li>
              <li><Link href="/benefits" className="text-gray-400 hover:text-emerald-400 transition-colors">My Benefits</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-emerald-400 transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/partner" className="text-gray-400 hover:text-emerald-400 transition-colors">Partner With Us</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-gray-400 hover:text-emerald-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-emerald-400 mt-0.5" />
                <span className="text-gray-400">support@fitplay.life</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-emerald-400 mt-0.5" />
                <span className="text-gray-400">+91 1800-123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                <span className="text-gray-400">Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 FitPlay.life. All rights reserved. Empowering wellness, one employee at a time.</p>
        </div>
      </div>
    </footer>
  );
}