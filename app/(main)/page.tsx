"use client"
import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Video, ShoppingBag, ArrowRight, Check, Clock, Users, Star, Stethoscope, Brain, Activity } from 'lucide-react';
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress"
import { useUser } from '@/app/hooks/useUser';
import  ConnectShopifyPage from '../components/vendor/vendor'
import { useProducts } from "@/app/hooks/useProducts";
import { toast } from 'sonner';

const STORAGE_KEY = "gut-course-progress-v";
const ENROLLMENT_KEY = "gut-course-enrollmen";
const TAB_STORAGE_KEY = "sova-active-tab";

function SimpleAnimatedHeading() {
  const texts = ["Learn About Gut Health", "Take Gut Test Today"]
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length)
        setVisible(true)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <h1
      className={`text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-800
        transition-opacity duration-1000
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {texts[index]}
    </h1>
  )
}
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-5 w-3/4 bg-gray-200 rounded" />

        {/* Description */}
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />

        {/* Rating */}
        <div className="h-4 w-24 bg-gray-200 rounded" />

        {/* Button */}
        <div className="pt-4 border-t border-gray-100">
          <div className="h-10 w-24 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}


export default function SovaHealthPage() {
 const [activeTab, setActiveTab] = useState("quiz");
   const { user, isAuthenticated,  refreshSession } = useUser();

useEffect(() => {
  if (typeof window === "undefined") return;

  const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
  if (savedTab) {
    setActiveTab(savedTab);
  }
}, []);
const changeTab = (tab: string) => {
  setActiveTab(tab);
  localStorage.setItem(TAB_STORAGE_KEY, tab);
};

  const { products, isLoading, error } = useProducts();
  const router = useRouter();
  const [courseProgress, setCourseProgress] = useState({
    isEnrolled: false,
    progressPercentage: 0,
    completedModules: 0,
    totalModules: 0
  });

  // Load enrollment and progress on mount
  useEffect(() => {
    const loadCourseData = () => {
      try {
        // Check enrollment
        const enrollmentData = localStorage.getItem(ENROLLMENT_KEY);
        const isEnrolled = enrollmentData === "true";

        if (isEnrolled) {
          // Load progress
          const progressData = localStorage.getItem(STORAGE_KEY);
          if (progressData) {
            const parsed = JSON.parse(progressData);
            const completedCount = parsed.completedModules?.length || 0;
          
            const totalModules = 9;
            const progressPercentage = (completedCount / totalModules) * 100;

            setCourseProgress({
              isEnrolled: true,
              progressPercentage: Math.round(progressPercentage),
              completedModules: completedCount,
              totalModules: totalModules
            });
          } else {
            setCourseProgress({
              isEnrolled: true,
              progressPercentage: 0,
              completedModules: 0,
              totalModules: 10
            });
          }
        }
      } catch (error) {
        console.error("Error loading course data:", error);
      }
    };

    loadCourseData();

    // Set up interval to check for progress updates
    const interval = setInterval(loadCourseData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnrollClick = () => {
    if(!isAuthenticated){
      // show paid/signup modal instead of direct login
      setShowPaidModal(true);
      return;
    }

   else{
    localStorage.setItem(ENROLLMENT_KEY, "true");
    setCourseProgress(prev => ({
      ...prev,
      isEnrolled: true,
      totalModules: 10
    }));
    router.push("/coursepage");
  }
  };

  const handleResumeClick = () => {
       if(!isAuthenticated){
      setShowPaidModal(true);
      return;
    }
    else{
      router.push("/coursepage");
    }
   
  };




  const [open, setOpen] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paywallType, setPaywallType] = useState<"quiz" | "course" | "consultation" | null>(null); // 'quiz' | 'course' | 'consultation'
  // Helper: is user a company user
  // Extend user type to include hasPaidBundle and phone
  // User type for paywall logic
  type UserType = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    company?: any;
    companyId?:string
    hasPaidBundle?: boolean;
    phone?: string | null;
    role?: string;
  };
  const typedUser = user as UserType | undefined;
 
const isCompanyUser = !!typedUser?.companyId;
const isNonCompanyUser = !!typedUser && !typedUser?.companyId;

  // Show paywall for non-company, non-paid users only
 const requirePaywallOrAction = (type, action) => {
  if (!isAuthenticated) {
    setPaywallType(type);
    setShowPaidModal(true);
    return false;
  }

  

  if (typedUser?.companyId) {
    action();
    return true;
  }

  if (!typedUser?.companyId && !typedUser?.hasPaidBundle) {
    
   
    setPaywallType(type);
    setShowPaidModal(true);
    return false;
  }

  action();
    return true;

 
};

  const loadQuiz = () => {
    const oldScript = document.getElementById("quizell-script");
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.src = "https://api.quizell.com/js/qzembed.js?v=24999";
    script.async = true;
    script.id = "quizell-script";
    script.setAttribute("data-qz-key", "oQ8cX8");

    document.body.appendChild(script);
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      loadQuiz();
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const quizzes = [
    {
      title: 'Gut Health Assessment',
      description: 'Discover your digestive health score',
      duration: '5 min',
      icon: Activity,
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  const courses = [
    {
      title: 'Complete Gut Health Masterclass',
      rating: 4.9,
      price: '',
      image: '🌿'
    }
  ];

 
  const getButtonContent = () => {
    if (!courseProgress.isEnrolled) {
      return {
        text: "Enroll Now",
        onClick: handleEnrollClick,
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      };
    } else if (courseProgress.progressPercentage === 100) {
      return {
        text: "Completed",
        onClick: handleResumeClick,
        className: "bg-green-100 text-green-700 cursor-default",
        icon: <Check className="w-4 h-4" />
      };
    } else {
      return {
        text: "Resume",
        onClick: handleResumeClick,
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200"
      };
    }
  };

  if(user?.role === "VENDOR"){
    return(
      <ConnectShopifyPage></ConnectShopifyPage>
    )
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full h-[92vh] md:h-auto md:max-w-3xl bg-slate-950 rounded-t-2xl md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm md:text-base">
                Gut Health Quiz FITPLAY x SOVA
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="h-full overflow-y-auto p-3 md:p-4">
              <div
                id="oQ8cX8"
                data-quizlang="en"
                className="min-h-[400px] rounded-xl border border-emerald-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {showPaidModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-2xl">
            {(!isAuthenticated) ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access requires sign-in</h3>
                <p className="text-sm text-gray-600 mb-4">If you're part of a company, please sign in. Otherwise, sign up as an individual to access the platform.</p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => { setShowPaidModal(false); router.push('/login'); }}
                    className="flex-1 py-2 rounded-lg border border-emerald-200 bg-white text-emerald-700 font-semibold"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { setShowPaidModal(false); router.push('/signup'); }}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                  >
                    Sign up
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Wellness Starter Bundle</h3>
                <ul className="text-gray-700 text-sm mb-4 list-disc pl-5">
                  <li>Gut Health Assessment</li>
                  <li>Gut Health Masterclass</li>
                  <li>1:1 Expert Consultation</li>
                </ul>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4">
                  <span className="font-semibold text-emerald-700">Buy Now @299/-</span>
                  <span className="ml-2 text-gray-500">(One-time access fee)</span>
                </div>
                <button
                  onClick={async () => {
                    // Load Razorpay script if not loaded
                   
                      const script = document.createElement('script');
                      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                      script.async = true;
                      document.body.appendChild(script);
                      await new Promise((resolve) => { script.onload = resolve; });
                    
                    // Create order on backend
                    const orderRes = await fetch('/api/payments/create-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: 299, isCash: true })
                    });
                    const orderData = await orderRes.json();
                    if (!orderData?.key) {
  toast.error("failed to create payment order")
     
      return;
    }

                    const options = {
                    
                      key: orderData.key,
                      amount: 29900,
                      currency: 'INR',
                      name: 'FitPlay Life',
                      description: 'Wellness Starter Bundle',
                      order_id: orderData.razorpayOrderId,
                      handler: async function (response: any) {
                        // Call backend to verify and unlock bundle for user

                        const verifyRes = await fetch('/api/payments/verify-guest', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            bundle: true
                          })
                        });
                       if (verifyRes.ok) {
  toast.success('Payment successful! Access unlocked.');

  await refreshSession();  
  setShowPaidModal(false);
}
 else {
                          const data = await verifyRes.json();
                          toast.error(data.error || 'Payment verification failed');
                        }
                      },
                      prefill: {
                        name: typedUser?.name || '',
                        email: typedUser?.email || '',
                        contact: typedUser?.phone || ''
                      },
                      theme: { color: '#10B981' }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                  }}
                  className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold text-lg mb-3 hover:bg-emerald-700 transition"
                >
                  Buy Now @299/-
                </button>
                <button
                  onClick={() => setShowPaidModal(false)}
                  className="w-full py-2 rounded-lg text-gray-500 border border-gray-200"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-24 " />

      <div className="mx-auto min-h-screen px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl w-full mx-auto  mb-12">
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 md:rounded-3xl rounded-xl p-8 sm:p-12 lg:p-16 shadow-xl border border-emerald-100">
           <div className="flex flex-col sm:flex-row items-center md:gap-2 md:-mt-12 -mt-8">
  <p className="text-sm sm:text-sm md:text-sm font-bold text-emerald-700 md:mb-2">
    Powered By 
  </p>

  <img
  src="./sova.webp"
  alt="Sova"
  className="w-[60px] sm:w-[80px] md:w-[64px] h-auto md:-mt-2 mb-2"
/>

            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <SimpleAnimatedHeading />
                <p className="md:mt-8 mt-2 text-lg text-gray-600 leading-relaxed">
                  Your personalized journey to optimal digestive wellness starts here. Expert guidance, proven methods, lasting results.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Get Started 
                  </button>
                  <button className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold shadow-md hover:shadow-lg border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative ">
                  <div className="w-[150px] h-[150px] md:w-64 md:h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse mt-4"></div>
                  <div className="relative text-9xl sm:text-[12rem] md:animate-float">
                    🩺
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-5xl md:animate-bounce-slow">💚</div>
                  <div className="absolute -top-4 -left-4 text-4xl md:animate-float-delayed-1">🌿</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-3 border border-gray-100">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
              <button
                onClick={() => changeTab("quiz")}

                className={`tab-trigger ${activeTab === 'quiz' ? 'data-[state=active]' : ''}`}
                data-state={activeTab === 'quiz' ? 'active' : 'inactive'}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Quiz</span>
              </button>
              <button
                 onClick={() => changeTab("course")}
                className={`tab-trigger ${activeTab === 'course' ? 'data-[state=active]' : ''}`}
                data-state={activeTab === 'course' ? 'active' : 'inactive'}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Courses</span>
              </button>
              <button
               onClick={() => changeTab("consultation")}
                className={`tab-trigger ${activeTab === 'consultation' ? 'data-[state=active]' : ''}`}
                data-state={activeTab === 'consultation' ? 'active' : 'inactive'}
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Consult</span>
              </button>
            </div>

            <div className="px-2 sm:px-4 lg:px-6">
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Health Assessments</h2>
                    <p className="text-gray-600">Take our expert-designed quizzes to understand your health better</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz, index) => {
                      const Icon = quiz.icon;
                      return (
                        <div key={index} className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <div className={`w-14 h-14 bg-gradient-to-r ${quiz.color} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {quiz.duration}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              requirePaywallOrAction('quiz', () => {
                                setOpen(true);
                                loadQuiz();
                              });
                            }}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Start Quiz
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'course' && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Expert Courses</h2>
                    <p className="text-gray-600">Learn from certified health professionals and transform your wellness</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => {
                      const buttonConfig = getButtonContent();
                      return (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={() => requirePaywallOrAction('course', buttonConfig.onClick)}
                              >
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 h-40 flex items-center justify-center text-8xl">
                            {course.image}
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-current" />
                                {course.rating}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                            
                            {/* Progress Section */}
                            {courseProgress.isEnrolled && (
                              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center justify-between text-xs text-emerald-700 mb-2">
                                  <span className="font-semibold">Your Progress</span>
                                  <span className="font-bold">{courseProgress.progressPercentage}%</span>
                                </div>
                                <Progress 
                                  value={courseProgress.progressPercentage} 
                                  className="h-2 bg-emerald-100"
                                />
                                <p className="text-xs text-emerald-600 mt-2">
                                  {courseProgress.completedModules} of {courseProgress.totalModules} modules completed
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-emerald-600">{course.price}</span>
                              <button 
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${buttonConfig.className}`}
                                onClick={() => requirePaywallOrAction('course',buttonConfig.onClick)}
                              >
                                {buttonConfig.icon}
                                {buttonConfig.text}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'consultation' && (
                 <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Consultation 
                </h2>
                <p className="text-gray-600">
                   Consultation  By Health Experts
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {isLoading
    ? Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))
    : products.filter(product => product.name === "Expert Consultation").slice(0, 4).map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-2xl overflow-hidden border border-gray-200
                     hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => requirePaywallOrAction('consultation', () => router.push(`/product/${product.id}`))}
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
            <img
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {product.avgRating && (
              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  {product.avgRating}
                </span>
                {product.noOfReviews && (
                  <span className="text-xs text-gray-500">
                    ({product.noOfReviews})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                                onClick={() => requirePaywallOrAction('consultation', () => router.push(`/product/${product.id}`))}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg
                           font-semibold hover:bg-emerald-700 transition-all
                           flex items-center gap-2"
              >
                Take Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}



</div>




        </div>
              )}

              
            </div>
            
          </div>
          

        


          
        </div>
            <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Recommended Products
                </h2>
                <p className="text-gray-600">
                  Premium supplements curated by health experts
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {isLoading
    ? Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))
    : products.filter(product => product.name != "Expert Consultation").slice(0, 4).map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-2xl overflow-hidden border border-gray-200
                     hover:shadow-xl transition-all duration-300 hover:scale-105"
                     
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
            <img
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {product.avgRating && (
              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  {product.avgRating}
                </span>
                {product.noOfReviews && (
                  <span className="text-xs text-gray-500">
                    ({product.noOfReviews})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => router.push(`/product/${product.id}`)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg
                           font-semibold hover:bg-emerald-700 transition-all
                           flex items-center gap-2"
              >
                Add
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
</div>
        </div>

       
      </div>
    </>
  );
}
