"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { User, Menu, X, Sparkles, ShoppingCart, Wallet } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { cartItemsAtom, clearCartAtom, clearWishlistAtom } from '@/lib/store';
import useSWR from 'swr';
import { useUser } from '@/app/hooks/useUser';
import { usePathname } from 'next/navigation';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wasAuthenticated, setWasAuthenticated] = useState<boolean | null>(null);
  const cartItems = useAtomValue(cartItemsAtom);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const clearCart = useSetAtom(clearCartAtom);
  const clearWishlist = useSetAtom(clearWishlistAtom);
  const pathname = usePathname();
  const router = useRouter();
const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  
  const { isAuthenticated } = useUser();
  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useSWR(
    isAuthenticated ? "/api/wallets?personal=true" : null,
    fetcher
  );
  
  const walletBalance = walletData?.wallet?.balance || 0;

  // Check if we're on pages that should have solid navbar
  const isPageWithSolidNavbar = pathname?.includes('/profile') || pathname?.includes('/cart') || pathname?.includes('/product') ;

  useEffect(() => {
    const handleScroll = () => {
      if (isPageWithSolidNavbar) {
        // On profile/cart pages, become solid immediately on any scroll
        setIsScrolled(window.scrollY > 0);
      } else {
        // On other pages, use normal scroll threshold
        setIsScrolled(window.scrollY > 0);
      }
    };

    // Set initial state - start transparent on all pages
    setIsScrolled(false);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPageWithSolidNavbar]);

  // Clear cart and wishlist when user logs out
  useEffect(() => {
    if (wasAuthenticated !== null && wasAuthenticated && !isAuthenticated) {
      // User just logged out
      clearCart();
      clearWishlist();
    }
    setWasAuthenticated(isAuthenticated);
  }, [isAuthenticated, wasAuthenticated, clearCart, clearWishlist]);

  const handleVisitProfile = () => {
  if (!isAuthenticated) {
    toast.error("You should sign in to visit the profile section");
    setProfileDropdownOpen(false);
    return;
  }

  router.push("/profile");
  setProfileDropdownOpen(false);
};

const handleSignIn = () => {
  if (isAuthenticated) {
    router.push("/profile");
  } else {
    router.push("/login");
  }
  setProfileDropdownOpen(false);
};


  const navLinks = [
    { label: 'Home', href: '/home' },
    { label: 'About us', href: '/about' },
    { label: 'Wellness Store', href: '/store' },
    
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950"
      
    >

      <div className="max-w-7xl mx-auto px-6 lg:px-8  flex items-center justify-between">
        <Link href="/" className="group cursor-pointer">
          <Image
            src="/logo.png"
            alt="FitPlay Logo"
            width={130}
            height={100}
            className="transition-all duration-300 scale-105 md:scale-125 drop-shadow-lg rounded-lg object-contain"
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`font-medium text-lg transition-all duration-300 relative group ${
                isScrolled ? 'text-gray-200 hover:text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="relative">
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          ))}

          <Link
  href="/"
  className="relative group"
>
  <div
    className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500 ${
      isScrolled
        ? 'bg-emerald-400/25 border border-emerald-400/50 shadow-md shadow-emerald-500/20'
        : 'bg-emerald-400/15 border border-emerald-400/30 backdrop-blur-md'
    }`}
  >
    <Sparkles
      className={`w-4 h-4 transition-colors duration-500 ${
        isScrolled ? 'text-emerald-200' : 'text-emerald-300'
      }`}
    />
    <span
      className={`font-semibold text-sm tracking-wide transition-colors duration-500 ${
        isScrolled ? 'text-white' : 'text-emerald-100'
      }`}
    >
      Gut Health
    </span>
  </div>

  {/* subtle glow ring */}
  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 blur-md group-hover:opacity-40 transition-all duration-500 pointer-events-none" />
</Link>

        </div>

        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated && (
            <Link href="/profile?tab=wallet">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500 cursor-pointer group ${
                isScrolled
                  ? 'bg-emerald-400/30 border border-emerald-400/60 hover:bg-emerald-400/40 hover:border-emerald-400/70'
                  : 'bg-emerald-400/20 border border-emerald-400/40 hover:bg-emerald-400/30 hover:border-emerald-400/50'
              }`}>
                <Wallet className={`w-4 h-4 transition-colors duration-500 ${
                  isScrolled ? 'text-emerald-200 group-hover:text-emerald-100' : 'text-emerald-200/90 group-hover:text-emerald-100'
                }`} />
                <span className={`text-sm font-semibold transition-colors duration-500 ${
                  isScrolled ? 'text-emerald-200 group-hover:text-emerald-100' : 'text-emerald-200/90 group-hover:text-emerald-100'
                }`}>
                  {walletLoading ? '...' : walletError ? 'Error' : `${walletBalance} credits`}
                </span>
              </div>
            </Link>
          )}
          
          <Link href="/cart">
            <button className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              isScrolled
                ? 'bg-emerald-400/30 border border-emerald-400/60'
                : 'bg-emerald-400/20 border border-emerald-400/40 hover:bg-emerald-400/25 hover:border-emerald-400/50'
            } group`}>
              <ShoppingCart className={`w-5 h-5 transition-colors duration-500 ${
                isScrolled ? 'text-emerald-200 group-hover:text-emerald-100' : 'text-emerald-200/90 group-hover:text-emerald-100'
              }`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </Link>

          <Link href="/partner">
            <button className={`relative group px-6 py-2.5 overflow-hidden transition-all duration-500 rounded-full ${
              isScrolled ? 'shadow-lg shadow-emerald-500/20' : 'shadow-lg shadow-emerald-500/10'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-500 rounded-full ${
                isScrolled
                  ? 'from-emerald-600 to-teal-600'
                  : 'from-emerald-600/60 to-teal-600/60 group-hover:from-emerald-500/70 group-hover:to-teal-500/70'
              }`}></div>
              <div className={`absolute inset-0.5 rounded-full transition-colors duration-500 ${
                isScrolled ? 'bg-slate-900/80' : 'bg-slate-900/60'
              }`}></div>
              <span className={`relative font-semibold text-sm transition-colors duration-500 ${
                isScrolled ? 'text-white' : 'text-white/90'
              }`}>Partner with Us</span>
            </button>
          </Link>

     <div className="relative">
  <button
    onClick={() => {
      if (isAuthenticated) {
        router.push("/profile");
      } else {
        setProfileDropdownOpen(!profileDropdownOpen);
      }
    }}
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
      isScrolled
        ? 'bg-emerald-400/30 border border-emerald-400/60'
        : 'bg-emerald-400/20 border border-emerald-400/40 hover:bg-emerald-400/25 hover:border-emerald-400/50'
    } group`}
  >
    <User className={`w-5 h-5 transition-colors duration-500 ${
      isScrolled ? 'text-emerald-200 group-hover:text-emerald-100' : 'text-emerald-200/90 group-hover:text-emerald-100'
    }`} />
  </button>

  {/* 👇 SHOW DROPDOWN ONLY IF NOT AUTHENTICATED */}
  {!isAuthenticated && profileDropdownOpen && (
    <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
      <button
        onClick={handleVisitProfile}
        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition"
      >
        Visit Profile
      </button>
      <button
        onClick={handleSignIn}
        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition"
      >
        Sign In
      </button>
    </div>
  )}
</div>

        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isScrolled
              ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
              : 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30'
          }`}
        >
          {isOpen ? (
            <X className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white/90'}`} />
          ) : (
            <Menu className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white/90'}`} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10 backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-gray-300 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

                  <Link
  href="/"
  className="relative group"
>
  <div
    className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500 ${
      isScrolled
        ? 'bg-emerald-400/25 border border-emerald-400/50 shadow-md shadow-emerald-500/20'
        : 'bg-emerald-400/15 border border-emerald-400/30 backdrop-blur-md'
    }`}
  >
    <Sparkles
      className={`w-4 h-4 transition-colors duration-500 ${
        isScrolled ? 'text-emerald-200' : 'text-emerald-300'
      }`}
    />
    <span
      className={`font-semibold text-sm tracking-wide transition-colors duration-500 ${
        isScrolled ? 'text-white' : 'text-emerald-100'
      }`}
    >
      Gut Health
    </span>
  </div>

  {/* subtle glow ring */}
  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 blur-md group-hover:opacity-40 transition-all duration-500 pointer-events-none" />
</Link>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {isAuthenticated && (
                <Link href="/profile?tab=wallet" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/30 hover:border-emerald-400/40 transition-all duration-300 cursor-pointer">
                    <Wallet className="w-5 h-5 text-emerald-300" />
                    <span className="text-emerald-200 font-medium">
                      {walletLoading ? 'Loading...' : walletError ? 'Error loading credits' : `${walletBalance} credits`}
                    </span>
                  </div>
                </Link>
              )}
              
              
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-emerald-300" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium">Cart</span>
                </button>
              </Link>

              <Link href="/partner" onClick={() => setIsOpen(false)}>
                <button className="w-full relative group px-6 py-2.5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300 rounded-full"></div>
                  <div className="absolute inset-0.5 bg-slate-900 rounded-full"></div>
                  <span className="relative text-white font-semibold text-sm">Partner with Us</span>
                </button>
              </Link>

    <div className="relative">
  <button
    onClick={() => {
      if (isAuthenticated) {
        router.push("/profile");
        setIsOpen(false);
      } else {
        setProfileDropdownOpen(!profileDropdownOpen);
      }
    }}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
  >
    <User className="w-5 h-5 text-emerald-300" />
    <span className="text-white font-medium">Profile</span>
  </button>

  {!isAuthenticated && profileDropdownOpen && (
    <div className="mt-2 w-full bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => {
          handleVisitProfile();
          setIsOpen(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition"
      >
        Visit Profile
      </button>
      <button
        onClick={() => {
          handleSignIn();
          setIsOpen(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition"
      >
        Sign In
      </button>
    </div>
  )}
</div>


            </div>
            
          </div>
        </div>
      )}
    </nav>
  );
}


