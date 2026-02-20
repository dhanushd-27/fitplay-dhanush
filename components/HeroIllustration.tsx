import { Dumbbell, Apple, Heart, Sparkles, TrendingUp, Star } from 'lucide-react';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-80 h-80">
          {/* Main glowing circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>

          {/* Center wellness credits card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-emerald-400/80 to-teal-500/80 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <p className="text-sm text-emerald-100 font-medium">Wellness Credits</p>
              <p className="text-4xl font-bold text-white">2,450</p>
              <div className="flex items-center justify-center gap-1 text-emerald-200">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">+12% this week</span>
              </div>
            </div>
          </div>

          {/* Healthcare card - top */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center">
            <div className="text-center">
              <Heart className="w-8 h-8 text-white mx-auto mb-1" />
              <p className="text-xs text-white font-semibold">Healthcare</p>
            </div>
          </div>

          {/* Nutrition card - right */}
          <div className="absolute top-16 -right-12 w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center">
            <div className="text-center p-3">
              <Apple className="w-10 h-10 text-white mx-auto mb-2" />
              <p className="text-xs text-white font-semibold">Nutrition</p>
              <p className="text-lg font-bold text-white">350 pts</p>
            </div>
          </div>

          {/* Fitness card - left */}
          <div className="absolute bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center">
            <div className="text-center p-3">
              <Dumbbell className="w-10 h-10 text-white mx-auto mb-2" />
              <p className="text-xs text-white font-semibold">Fitness</p>
              <p className="text-lg font-bold text-white">820 pts</p>
            </div>
          </div>

          {/* Floating star */}
          <div className="absolute top-32 -left-16 w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>

          {/* Floating sparkle */}
          <div className="absolute bottom-20 -right-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          {/* Bonus points */}
          <div className="absolute top-48 right-20 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">+50</p>
            </div>
          </div>

          {/* Animated dots */}
          <div className="absolute -bottom-4 left-20 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute top-0 right-12 w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
}