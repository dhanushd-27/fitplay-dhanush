"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Check } from 'lucide-react';
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUser } from '@/app/hooks/useUser';
import { toast } from 'sonner';


const STORAGE_KEY = "gut-course-progress-v";
const ENROLLMENT_KEY = "gut-course-enrollmen";

export default function GutHealthCourse() {
  const router = useRouter();
  const [courseProgress, setCourseProgress] = useState({
    isEnrolled: false,
    progressPercentage: 0,
    completedModules: 0,
    totalModules: 9
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
            
            // Total modules based on course structure
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
              totalModules: 9
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

  const handleButtonClick = () => {
    if (!courseProgress.isEnrolled) {
      // First time enrollment
      localStorage.setItem(ENROLLMENT_KEY, "true");
    }
    router.push("/course");
  };

  const getButtonContent = () => {
    if (!courseProgress.isEnrolled || courseProgress.progressPercentage === 0) {
      return {
        text: "Start",
        className: "bg-emerald-900 hover:bg-emerald-800"
      };
    } else if (courseProgress.progressPercentage === 100) {
      return {
        text: "Completed",
        className: "bg-green-600 hover:bg-green-700",
        icon: <Check className="w-5 h-5 mr-2" />
      };
    } else {
      return {
        text: "Resume",
        className: "bg-green-400 hover:bg-green-700"
      };
    }
  };

  const buttonConfig = getButtonContent();
  const showProgress = courseProgress.isEnrolled && courseProgress.progressPercentage > 0;

  return (
    <>
      <div className="h-20 " />
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 -mt-2 ">
        {/* Header Section */}
    
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12 p-8 max-w-[1350px] mx-auto items-start ">
          
          {/* Left Column - Course Info */}
          <div className="absolute top-28 left-15 w-3xs text-white">
  <ArrowLeft size={24} strokeWidth={2} onClick={()=>router.push("/")} />
</div>


          
          <div className="text-white space-y-10 order-2 lg:order-1">
           
             
            <h1 className="text-4xl font-bold mb-6">
                 
              Gut Health & Stress Resilience: Professionals
            </h1>
           
            
            <p className="text-green-100 leading-relaxed">
              This engaging course empowers corporate employees to harness the power of gut health for
              enhancing daily energy, focus, and resilience against stress. Through accessible videos and
              informative articles, participants will explore the connection between modern lifestyles and gut issues,
              dispel common myths, and adopt practical microhabits for better digestion and overall wellness.
              Designed for busy professionals, this evidence-informed program emphasizes awareness and
              prevention, enabling individuals to take charge of their health amidst the demands of the workplace.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                SY
              </div>
              <div>
                <p className="text-sm text-green-200">Created by</p>
                <p className="font-medium">Simran Yadav</p>
              </div>
            </div>

            <div className="bg-green-50 px-8 py-6 rounded-2xl">
  <div className="space-y-6">

    {/* Objectives */}
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-3">
        Course objectives
      </h2>

      <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-700 text-sm leading-snug">
        <li className="flex gap-2">
          <span className="text-green-600">•</span>
          Understand what gut health is and why it matters for daily performance.
        </li>
        <li className="flex gap-2">
          <span className="text-green-600">•</span>
          Recognize how modern lifestyle and workplace stress impact digestion.
        </li>
        <li className="flex gap-2">
          <span className="text-green-600">•</span>
          Identify common gut health myths versus facts.
        </li>
        <li className="flex gap-2">
          <span className="text-green-600">•</span>
          Apply simple, realistic microhabits to support gut health.
        </li>
        <li className="flex gap-2 ">
          <span className="text-green-600">•</span>
          Utilize stress management techniques to enhance overall well-being.
        </li>
      </ul>
    </div>

    {/* Divider */}
    <div className="h-px bg-green-200/70" />

    {/* Skills */}
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-3">
        Skills & Knowledge
      </h2>

      <div className="flex flex-wrap gap-2">
        {[
          "gut health",
          "stress management",
          "corporate wellness",
          "microhabits",
          "digestion",
        ].map(skill => (
          <Badge
            key={skill}
            className="bg-emerald-900 text-white px-4 py-1.5 rounded-lg text-xs"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>

  </div>
</div>

          </div>

          {/* Right Column - Course Card */}
          <div className="flex justify-end order-1 lg:order-2">
            <Card className="w-full max-w-md md:mb-2 md:py-2 bg-white shadow-2xl overflow-hidden rounded-3xl">
              {/* Course Image */}
              <div className="relative bg-gradient-to-br from-emerald-600 to-green-700 p-8 flex items-center justify-center min-h-[300px] -mt-6">
                <div className="text-center text-white">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg text-gray-900">
                  Gut Health & Stress Resilience: Professionals
                </h2>

                <p className="text-sm text-gray-600">by Simran Yadav</p>

                {/* Progress Section - Only show if progress > 0 */}
                {showProgress && (
                  <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-900">Your Progress</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {courseProgress.progressPercentage}%
                      </span>
                    </div>
                    <Progress 
                      value={courseProgress.progressPercentage} 
                      className="h-3 bg-emerald-100"
                    />
                    <p className="text-xs text-emerald-700 font-medium">
                      {courseProgress.completedModules} of {courseProgress.totalModules} modules completed
                    </p>
                    
                    {courseProgress.progressPercentage === 100 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          Course Completed! 🎉
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Static info when not started */}
                {!showProgress && (
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> Self-paced
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Modules:</span> 9
                    </p>
                  </div>
                )}

                

                <Button 
                  className={`w-full text-white py-6 flex items-center justify-center ${buttonConfig.className}`}
                  onClick={handleButtonClick}
                >
                  {buttonConfig.icon}
                  {buttonConfig.text}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}