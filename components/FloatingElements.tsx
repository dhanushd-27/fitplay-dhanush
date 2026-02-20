import { Leaf, Heart, Activity, Zap, Award, Sparkles } from 'lucide-react';

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 text-emerald-400/20 animate-pulse">
        <Leaf className="w-12 h-12" />
      </div>

      <div className="absolute top-40 right-20 text-teal-400/20 animate-pulse">
        <Heart className="w-10 h-10" />
      </div>

      <div className="absolute bottom-40 left-1/4 text-cyan-400/20 animate-pulse">
        <Activity className="w-14 h-14" />
      </div>

      <div className="absolute top-1/3 left-1/3 text-emerald-300/20 animate-pulse">
        <Zap className="w-8 h-8" />
      </div>

      <div className="absolute bottom-1/4 right-1/4 text-teal-300/20 animate-pulse">
        <Award className="w-16 h-16" />
      </div>

      <div className="absolute top-60 left-1/2 text-cyan-400/20 animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="absolute bottom-60 left-20 text-emerald-400/20 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="absolute top-1/2 right-10 text-teal-400/20 animate-pulse">
        <Leaf className="w-10 h-10" />
      </div>

      <div className="absolute top-32 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
}