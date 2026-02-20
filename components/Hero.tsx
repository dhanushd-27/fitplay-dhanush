import { Activity, Sparkles, Award, Heart, Leaf, Zap } from 'lucide-react';
import FloatingElements from './FloatingElements';
import HeroIllustration from './HeroIllustration';

export default function Hero() {
  return (
    <div className="relative min-h-[70vh] lg:min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950">

      <FloatingElements />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Your Wellness Journey Starts Here</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                Track Your Wellness
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-xl">
              Redeem your wellness credits for fitness, nutrition, and healthcare rewards — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
                <span className="flex items-center justify-center gap-2">
                  Start Tracking Now
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>

              <button className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border-2 border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                Explore Wellness Store
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <p className="text-2xl font-bold text-white">50,000+</p>
                </div>
                <p className="text-sm text-gray-400">Active Users</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-400" />
                  <p className="text-2xl font-bold text-white">200+</p>
                </div>
                <p className="text-sm text-gray-400">Corporate Partners</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-cyan-400" />
                  <p className="text-2xl font-bold text-white">95%</p>
                </div>
                <p className="text-sm text-gray-400">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-12 hidden lg:block">
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-3xl rounded-full"></div>
  <HeroIllustration />
</div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="transparent" fillOpacity="0"/>
        </svg>
      </div>
    </div>
  );
}
