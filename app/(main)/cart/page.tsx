"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MapPin,
  Check,
  AlertCircle,
  Package,
  CreditCard,
  Calendar,
  Hash,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { CreditPurchase } from "@/components/CreditPurchase";
import CheckoutVoucherRedemption from "@/app/components/checkout/VoucherRedemption";
import { toast } from "sonner";
import useSWR from "swr";
import {
  cartItemsAtom,
  clearCartAtom,
  purchaseCreditsAtom,
  removeFromCartAtom,
  updateCartQuantityAtom,
  userCreditsAtom,
} from "@/lib/store";
import { useAtomValue, useSetAtom } from "jotai";
import { tr } from "date-fns/locale";
import { useSession } from "next-auth/react";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function CartPage() {
  const { data: session } = useSession();
  const isDemo = (session?.user as any)?.isDemo || false;

  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useSWR("/api/wallets?personal=true", fetcher);

  const walletBalance = walletData?.wallet?.balance || 0;
  const [paymentMethod, setPaymentMethod] = useState("credits");
  const[recharge, setRecharge]= useState(false);
  const[isProcessing, setIsProcessing]= useState(false);

  const userCredits = walletBalance;
  const purchaseCredits = useSetAtom(purchaseCreditsAtom);

  const cartItems = useAtomValue(cartItemsAtom);
  const clearCart = useSetAtom(clearCartAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);
  const updateCartQuantity = useSetAtom(updateCartQuantityAtom);

  const handleCreditPurchase = (credits: number) => {
    const newCredits = purchaseCredits(credits);
    toast.success("Demo: Credits added to balance!", {
      description: `Your demo balance is now ${newCredits} credits. Contact HR for actual credits.`,
      duration: 5000,
    });
  };
  


  const handleClearCart = () => {
    clearCart();
    
    
    toast.success("Cart cleared successfully!");
  };

  const handleRemoveFromCart = (variantKey: string) => {
    const removedItem = removeFromCart(variantKey);

    if (removedItem) {
      toast.info(`${removedItem.title} removed from cart`);
    }
  };

  const [currentStep, setCurrentStep] = useState<
    "cart" | "address" | "confirmation"|"payment"
  >("cart");

  // Address form state
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    instructions: "",
  });

  const [addressErrors, setAddressErrors] = useState({
    pincode: "",
    phone: "",
  });

  const [orderDetails, setOrderDetails] = useState<{
    order: any;
    wallet: any;
  } | null>(null);
  const [cashorderdetails, setCashOrderDetails] = useState<{
    order: any;
    
  } | null>(null);

  // Calculate totals
  const totalCredits = cartItems.reduce(
    (sum, item) => sum + item.credits * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const creditsShortfall = Math.max(0, totalCredits - userCredits);
  const hasEnoughCredits = creditsShortfall === 0;

  const validateAddress = () => {
    return (
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.pincode &&
      address.phone
    );
  };


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    if (isDemo) {
      toast.error("Demo users can only use credits", {
        description: "Demo accounts cannot make cash payments. Only credit-based orders are allowed.",
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);

    const loaded: any = await loadRazorpay();
    if (!loaded) {
      alert("Failed to load Razorpay.");
      setIsProcessing(false);
      return;
    }

    const createOrderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        
        amount: totalCredits * 0.5, 
        isCash: true,
      }),
    });

    const order = await createOrderRes.json();

    if (!order?.key) {
      alert("Failed to create order.");
      setIsProcessing(false);
      return;
    }
    

    const options = {
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    name: "FitPlay Life",
    description: "Credit Purchase",
    order_id: order.razorpayOrderId,
    handler: async function (response: any) {

      try {

        const items = cartItems
          .filter((item) => item.variantId && item.variantId.trim() !== "")
          .map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          }));

        if (items.length === 0) {
          toast.error("No valid items to order", {
            description: "Please ensure all cart items have valid variants.",
            duration: 5000,
          });
          return;
        }

        // Prepare address string
        // const fullAddress = `${address.addressLine1}${
        //   address.addressLine2 ? ", " + address.addressLine2 : ""
        // }, ${address.city}, ${address.state} ${address.pincode}`;
      // Call verify API
      const verifyRes = await fetch("/api/payments/verify-order", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          razorpay_payment_id: response.razorpay_payment_id,
  razorpay_order_id: response.razorpay_order_id,
  razorpay_signature: response.razorpay_signature,
          phNumber: address.phone,
          address:address.addressLine1,
          address2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          deliveryInstructions: address.instructions || null,


  

  
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.order) {
        
        
        toast.success("Order created successfully!", {
          description: "Your order has been placed and will be processed soon.",
          duration: 3000,
        });

        // Store complete order details for confirmation page

        setCashOrderDetails({

          order: verifyData.order,
        
        });

        setCurrentStep("confirmation");
        // Clear cart after successful order
        setTimeout(() => {
          clearCart();
        }, 3000);


      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
    }
    catch (error) {
      toast.error("An error occurred during payment verification.");
    }
    },
    theme: { color: "#10B981" },
  };

  

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
  setIsProcessing(false);
};


  const handleCheckout = async () => {
    if (isDemo && currentStep === "payment" && paymentMethod !== "credits") {
      toast.error("Demo users can only use credits", {
        description: "Demo accounts cannot make cash payments. Only credit-based orders are allowed.",
        duration: 5000,
      });
      return;
    }

    if (currentStep === "cart") {
     
      setCurrentStep("address");
    } else if (currentStep === "address" && validateAddress()) {
      
      setCurrentStep("payment");
    }
    else if(currentStep === "payment" ){
      if(paymentMethod === "credits" && hasEnoughCredits){
        try {
        // Prepare order items - filter out items with null variantId
        const items = cartItems
          .filter((item) => item.variantId && item.variantId.trim() !== "")
          .map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          }));

        if (items.length === 0) {
          toast.error("No valid items to order", {
            description: "Please ensure all cart items have valid variants.",
            duration: 5000,
          });
          return;
        }

        // Prepare address string
        const fullAddress = `${address.addressLine1}${
          address.addressLine2 ? ", " + address.addressLine2 : ""
        }, ${address.city}, ${address.state} ${address.pincode}`;

        const response = await fetch("/api/orders/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            phNumber: address.phone,
            address: fullAddress,
            deliveryInstructions: address.instructions || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create order");
        }

        toast.success("Order created successfully!", {
          description: "Your order has been placed and will be processed soon.",
          duration: 3000,
        });

        // Store complete order details for confirmation page
        setOrderDetails({
          order: result.order,
          wallet: result.wallet,
        });

        setCurrentStep("confirmation");
        // Clear cart after successful order
        setTimeout(() => {
          clearCart();
        }, 3000);
      } catch (error) {
        toast.error("Failed to create order", {
          description:
            error instanceof Error ? error.message : "An error occurred",
          duration: 5000,
        });
      }
    }
    else if (paymentMethod === "cash") {
    await handlePurchase(); //  Razorpay triggered here
  }
    else if(paymentMethod === "credits" && !hasEnoughCredits){
      toast.error("Insufficient credits for this payment method.", {
        description: "Please purchase more credits or select another method.",
        duration: 5000,
      });
      setRecharge(true);
    }
  };
}

  
  const steps = [
    { id: "cart", label: "Cart", completed: true },
    {
      id: "address",
      label: "Address",
      completed: currentStep === "payment",
    },
     {
      id: "payment",
      label: "Payment",
      completed: currentStep === "confirmation",
    },
    { id: "confirmation", label: "Confirmation", completed: false },
  ];
  const activeIndex = steps.findIndex(step => step.id === currentStep);


  if (cartItems.length === 0 && currentStep === "cart") {
    return (
      <div className="min-h-screen">
        {/* Green Header Section */}
        <section className="bg-transparent pt-20 pb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-bg text-emerald-200 mb-6">
              <Link
                href="/store"
                className="hover:text-white flex items-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-emerald-800" />
                <span className="text-green-700"> Back to Store /</span>
              </Link>
              
              <span className="text-green-700 font-medium">Cart</span>
            </div>
            
          </div>
        </section>

        {/* Content Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-4 pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Discover wellness products curated for your health journey
                </p>
                <Link href="/store">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Green Header Section */}
      <section className="pt-20 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb */}
           <div className="flex items-center space-x-2 text-bg text-emerald-200 mb-6">
              <Link
                href="/store"
                className="hover:text-white flex items-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-emerald-800" />
                <span className="text-green-700"> Back to Store /</span>
              </Link>
              
              <span className="text-green-700 font-medium">Cart</span>
            </div>
          
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-4 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
      {/* Progress Steps */}
      <div className="hidden md:block mb-12">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full -z-0" 
             style={{ left: '2rem', right: '2rem' }} />
        
        {/* Progress line */}
        <div 
          className="absolute top-4 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 -z-0"
          style={{ 
            left: '2rem',
            width: `calc(${activeIndex * (100 / (steps.length - 1))}% - 4rem)`

          }}
        />

        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-lg ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white scale-110 ring-4 ring-emerald-200"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white hover:scale-105"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-3 text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  isActive
                    ? "text-emerald-700"
                    : isCompleted
                    ? "text-emerald-600"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Progress Steps - Mobile */}
    <div className="md:hidden mb-8">
      {/* Current Step Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
              {steps.find(s => s.id === currentStep)?.completed ? (
                <Check className="w-6 h-6" strokeWidth={3} />
              ) : (
                <span className="font-bold text-lg">
                  {steps.findIndex(s => s.id === currentStep) + 1}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}</p>
              <p className="text-lg font-bold text-gray-800">
                {steps.find(s => s.id === currentStep)?.label}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* All Steps List */}
      {/* <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-white shadow-md"
                  : isCompleted
                  ? "bg-emerald-50"
                  : "bg-gray-50"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white scale-110"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-emerald-700"
                    : isCompleted
                    ? "text-emerald-600"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div> */}
    </div>

      



      {/* Cart Step */}
      {currentStep === "cart" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Your Cart ({totalItems} items)
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleClearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.variantKey}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-gray-500">
                          {item.brand}
                        </div>
                        <h3 className="text-primary">{item.title}</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-emerald-600">
                            {item.credits} credits
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.variantKey!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              updateCartQuantity({
                                variantKey: item.variantKey!,
                                quantity: item.quantity - 1,
                              })
                            }
                            className="px-2 py-1 hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity({
                                variantKey: item.variantKey!,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="px-2 py-1 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

           
            {/* {!hasEnoughCredits && (
              <CreditPurchase
                currentCredits={userCredits}
                requiredCredits={totalCredits}
                onPurchaseComplete={handleCreditPurchase}
              />
            )} */}

            {/* Voucher Redemption Section */}
            <CheckoutVoucherRedemption 
              onCreditsAdded={(credits) => {
                // Refresh wallet data after voucher redemption
                toast.success(`${credits} credits added from voucher!`);
                // Force a refresh of the SWR data
                window.location.reload();
              }}
            />
          </div>

          {/* Order Summary */}
         <div>
  {walletLoading ? (
    <Card className="border-0 shadow-xl sticky top-4 overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5">
        <div className="h-6 bg-white/20 rounded w-32 animate-pulse"></div>
        <div className="mt-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="h-4 bg-white/20 rounded w-24 animate-pulse mb-2"></div>
          <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              {i < 3 && <div className="h-px bg-gray-100 my-2.5"></div>}
            </div>
          ))}
        </div>
        <div className="space-y-2 mt-4 pt-4 border-t">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="border-0 shadow-xl sticky  top -4 overflow-visible">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-2xl -mt-6">
        <div className="flex items-center justify-between text-white mb-3">
          <h3 className="text-lg font-bold">Order Summary</h3>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        
        {/* Total Amount - Featured */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-white/80 text-xs font-medium mb-1">Total Amount</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalCredits}</span>
            <span className="text-sm text-white/70">credits</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-lg font-bold">or in INR</span>
              <span className="text-lg font-bold text-white">₹{totalCredits * 0.5}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-5 -mt-8 space-y-3 gap-3">
        {/* Compact Details */}
        <div className="space-y-2.5">
          {/* Items */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-bold text-bg">Total Items</span>
            <span className="font-bold text-gray-900 text-bg">{totalItems}</span>
          </div>


         
         
        </div>

       
       

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          {isDemo && (
            <Alert className="border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Demo Account:</strong> You can create orders using only credits. Cash payments are not allowed. Please select credits as your payment method.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleCheckout}
            disabled={isDemo && currentStep === "payment" && paymentMethod !== "credits"}
            title={isDemo && paymentMethod !== "credits" ? "Demo users can only use credits" : ""}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            
                Proceed to Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
             
            
          </Button>

          <Link href="/store">
            <Button variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 mt-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Continue Shopping
            </Button>
          </Link>
        </div>

       

       
      </CardContent>
    </Card>
  )}
</div>
        </div>
      )}

      {/* Address Step */}
     {currentStep === "address" && (
  <div className="grid lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
      <Card className="border-0 shadow-xl">
        <CardHeader className=" border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2  space-y-2 ">
              <Label
                htmlFor="addressLine1"
                className="text-sm font-semibold text-gray-700"
              >
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addressLine1"
                value={address.addressLine1}
                onChange={(e) =>
                  setAddress({ ...address, addressLine1: e.target.value })
                }
                required
                placeholder="House/Flat No., Street Name"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label
                htmlFor="addressLine2"
                className="text-sm font-semibold text-gray-700"
              >
                Address Line 2
              </Label>
              <Input
                id="addressLine2"
                value={address.addressLine2}
                onChange={(e) =>
                  setAddress({ ...address, addressLine2: e.target.value })
                }
                placeholder="Landmark, Area (Optional)"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                required
                placeholder="Enter city"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                required
                placeholder="Enter state"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">
                Pincode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pincode"
                value={address.pincode}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  setAddress({ ...address, pincode: value });
                  setAddressErrors({
                    ...addressErrors,
                    pincode:
                      value.length === 6
                        ? ""
                        : value.length > 0
                        ? "Pincode must be exactly 6 digits"
                        : "",
                  });
                }}
                pattern="[0-9]{6}"
                title="Pincode must be exactly 6 digits"
                maxLength={6}
                required
                placeholder="6-digit pincode"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {addressErrors.pincode && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {addressErrors.pincode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone-number"
                className="text-sm font-semibold text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone-number"
                value={address.phone}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  setAddress({ ...address, phone: value });
                  setAddressErrors({
                    ...addressErrors,
                    phone:
                      value.length === 10
                        ? ""
                        : value.length > 0
                        ? "Phone number must be exactly 10 digits"
                        : "",
                  });
                }}
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits"
                maxLength={10}
                required
                placeholder="10-digit mobile number"
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {addressErrors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {addressErrors.phone}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label
                htmlFor="instructions"
                className="text-sm font-semibold text-gray-700"
              >
                Delivery Instructions
              </Label>
              <Textarea
                id="instructions"
                value={address.instructions}
                onChange={(e) =>
                  setAddress({ ...address, instructions: e.target.value })
                }
                placeholder="Any special instructions for delivery... (e.g., Ring the doorbell twice)"
                className="min-h-[100px] resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("cart")}
              className="flex-1 h-12 border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!validateAddress()}
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Order
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Order Summary */}
    <div>
      {walletLoading ? (
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl sticky top-4 overflow-visible">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 -mt-6 rounded-2xl">
            <div className="flex items-center justify-between text-white mb-3">
              <h3 className="text-lg font-bold">Order Summary</h3>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            {/* Total Amount - Featured */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 ">
              <div className="text-white/80 text-xs font-medium mb-1">Total Amount</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{totalCredits}</span>
                <span className="text-sm text-white/70">credits</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-lg font-bold">or in INR</span>
                  <span className="text-lg font-bold text-white">₹{totalCredits * 0.5}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-5 -mt-4 space-y-3">
            {/* Compact Details */}
            <div className="space-y-2.5">
              {/* Items */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Items</span>
                <span className="font-semibold text-gray-900">{totalItems}</span>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Credits */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Credits Value</span>
                <span className="font-semibold text-emerald-600">{totalCredits} </span>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* INR */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">INR Value</span>
                <span className="font-semibold text-gray-900">₹{totalCredits * 0.5}</span>
              </div>
            </div>

         

            
          </CardContent>
        </Card>
      )}
    </div>
  </div>
)}

     {currentStep === "payment" && (
 

  <div className="grid lg:grid-cols-3 gap-8">
  {/* Payment Method */}
  <div className="lg:col-span-2 space-y-6">
    <Card className="border-0 shadow-xl">
      

      <CardContent className="p-4">
        {/* Payment Options */}
        <div className="space-y-4">
          {/* Credits Option */}
          <label className={`relative flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
            paymentMethod === "credits"
              ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
          }`}>
            <input
              type="radio"
              name="payment"
              value="credits"
              checked={paymentMethod === "credits"}
              onChange={() => setPaymentMethod("credits")}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "credits"
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-300"
            }`}>
              {paymentMethod === "credits" && (
                <div className="w-3 h-3 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  Pay with Credits
                </span>
                
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Instant checkout • Use your available credits or Buy
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-600">{totalCredits}</div>
              <div className="text-xs text-gray-500">credits</div>
            </div>
          </label>

          {/* Cash Option */}
          <label className={`relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
            isDemo 
              ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
              : paymentMethod === "cash"
              ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 cursor-pointer"
              : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md cursor-pointer"
          }`}>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => !isDemo && setPaymentMethod("cash")}
              disabled={isDemo}
              className="sr-only"
            />
              
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === "cash"
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-300"
            }`}>
              {paymentMethod === "cash" && (
                <div className="w-3 h-3 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-900 block">
                Pay with Cash
              </span>
              {isDemo && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Not available for demo accounts
                </p>
              )}
              {!isDemo && (
                <p className="text-sm text-gray-600 mt-1">
                  Pay with  UPI / Netbanking / Cards • 1 Credit = ₹0.5
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">₹{totalCredits * 0.5}</div>
              <div className="text-xs text-gray-500">INR</div>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 mt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("address")}
            className="flex-1 h-12 border-2 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Address
          </Button>

          <Button
            onClick={handleCheckout}
            disabled={!paymentMethod}
            className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>

    {recharge && (
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <CreditPurchase
          currentCredits={userCredits}
          requiredCredits={totalCredits}
          onPurchaseComplete={handleCreditPurchase}
        />
      </div>
    )}
  </div>

  {/* Order Summary */}
  <div>
    <Card className="border-0 shadow-xl  sticky top-4  overflow-visible">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 -mt-6 rounded-2xl ">
        <div className="flex items-center justify-between text-white mb-3">
          <h3 className="text-lg font-bold">Order Summary</h3>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        
        {/* Total Amount - Featured */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-white/80 text-xs font-medium mb-1">Total Amount</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {paymentMethod === "credits" ? totalCredits : paymentMethod === "cash" ? `₹${totalCredits * 0.5}` : "—"}
            </span>
            <span className="text-sm text-white/70">
              {paymentMethod === "credits" ? "credits" : paymentMethod === "cash" ? "INR" : ""}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 -mt-2 space-y-3">
        {/* Compact Details */}
        <div className="space-y-2.5">
          {/* Items */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-semibold text-gray-900">{totalItems}</span>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Credits */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Credits Value</span>
            <span className="font-semibold text-emerald-600">{totalCredits} </span>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* INR */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">INR Value</span>
            <span className="font-semibold text-gray-900">₹{totalCredits * 0.5}</span>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Payment Method */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Payment via</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              paymentMethod === "credits"
                ? "bg-emerald-100 text-emerald-700"
                : paymentMethod === "cash"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-400"
            }`}>
              {paymentMethod ? (paymentMethod === "credits" ? "Credits" : "Cash") : "Not selected"}
            </span>
          </div>
        </div>

     
        
      </CardContent>
    </Card>
  </div>
</div>
  
)}



      

{currentStep === "confirmation" && (orderDetails || cashorderdetails) && (
  <div className="space-y-8 max-w-4xl mx-auto">
    {/* Success Header */}
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-12 h-12 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-3xl text-primary mb-4">Order Confirmed!</h2>
        <p className="text-gray-600">
          Your wellness products have been ordered successfully using your
          company wellness credits.
        </p>
      </div>
    </div>

    {/* Order Details Grid */}
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Order Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Order ID:</span>
              <div className="font-mono text-primary flex items-center space-x-1">
                <Hash className="w-3 h-3" />
                <span>{(orderDetails || cashorderdetails)?.order?.id}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="capitalize">
                  {(orderDetails || cashorderdetails)?.order?.status?.toLowerCase()}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Order Date:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(
                    (orderDetails || cashorderdetails)?.order?.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <div className="font-bold text-emerald-600">
                {(orderDetails || cashorderdetails)?.order?.amount} {cashorderdetails ? "Rupees" : "credits"}
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="pt-2 border-t">
            <span className="text-gray-600 text-sm">Transaction ID:</span>
            <div className="font-mono text-sm text-gray-800">
              {(orderDetails || cashorderdetails)?.order?.transactionId}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Information */}
      {orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Wallet Update</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Previous Balance:</span>
                <div className="font-bold">
                  {(orderDetails?.wallet?.balance || 0) + (orderDetails?.order?.amount || 0)}{" "}
                  credits
                </div>
              </div>
              <div>
                <span className="text-gray-600">Amount Deducted:</span>
                <div className="font-bold text-red-600">
                  -{orderDetails?.order?.amount} credits
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">New Balance:</span>
                <div className="font-bold text-emerald-600 text-lg">
                  {orderDetails?.wallet?.balance} credits
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <span className="text-gray-600 text-sm">Wallet Expiry:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span className="text-sm">
                  {new Date(
                    orderDetails?.wallet?.expiryDate
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Order Items */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5" />
          <span>Order Items ({(orderDetails || cashorderdetails)?.order?.items?.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(orderDetails || cashorderdetails)?.order?.items?.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={item?.product?.images?.[0] || "/placeholder.png"}
                    alt={item?.product?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-primary">
                    {item?.product?.name || "Product"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Variant: {item?.variant?.variantValue || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Product ID: {item?.productId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-bold">{item?.quantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="font-bold text-emerald-600">
                      {item?.price} credits
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-primary">
                      {(item?.price || 0) * (item?.quantity || 0)} credits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Order Total:</span>
            <span className="text-2xl font-bold text-emerald-600">
              {(orderDetails || cashorderdetails)?.order?.amount} {cashorderdetails ? "Rupees" : "credits"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Next Steps */}
    <div className="text-center space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Your order is being processed and will be approved by HR
          </li>
          <li>• You'll receive email updates on order status</li>
          <li>• Products will be delivered once order is approved</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/profile">
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            View Order History
          </Button>
        </Link>
        <Link href="/benefits">
          <Button variant="outline">View My Benefits</Button>
        </Link>
        <Link href="/store">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}
