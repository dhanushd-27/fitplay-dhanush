"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Heart, Users, TrendingUp, Award, Shield, Zap, 
  Lightbulb, Globe, Rocket, CheckCircle, ArrowRight, 
  Sparkles, Building2, Trophy, Star, Clock, Leaf, Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Link from 'next/link';

export function AboutUs() {
  // Company Stats

  const stats = [
    { icon: Users, number: '50,000+', label: 'Employees Empowered', color: 'from-emerald-500 to-green-500' },
    { icon: Building2, number: '200+', label: 'Corporate Partners', color: 'from-green-500 to-teal-500' },
    { icon: Trophy, number: '5,000+', label: 'Wellness Products', color: 'from-teal-500 to-cyan-500' },
    { icon: TrendingUp, number: '95%', label: 'Client Satisfaction', color: 'from-cyan-500 to-blue-500' }
  ];

  // Core Values
  const coreValues = [
    {
      icon: Heart,
      title: 'Employee-Centric',
      description: 'We put employee wellbeing at the heart of everything we do, designing solutions that truly make a difference in their lives.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Building lasting relationships through honest communication, verified vendors, and transparent pricing.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Continuously evolving our platform with cutting-edge technology to deliver the best wellness experience.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Leaf,
      title: 'Holistic Wellness',
      description: 'Embracing a comprehensive approach to health that encompasses physical, mental, and emotional wellbeing.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Results Driven',
      description: 'Focused on measurable outcomes and real impact on employee health and organizational productivity.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Collaborative Spirit',
      description: 'Working together with companies, vendors, and employees to create a thriving wellness ecosystem.',
      color: 'from-teal-500 to-green-500'
    }
  ];

  // Timeline/Journey
  const journey = [
    {
      year: '2020',
      title: 'The Beginning',
      description: 'FitPlay was founded with a vision to revolutionize corporate wellness in India.',
      icon: Rocket
    },
    {
      year: '2021',
      title: 'First 50 Partners',
      description: 'Onboarded our first 50 corporate partners and 10,000 active employees.',
      icon: Building2
    },
    {
      year: '2022',
      title: 'Platform Evolution',
      description: 'Launched advanced analytics dashboard and mobile app for seamless credit management.',
      icon: Zap
    },
    {
      year: '2023',
      title: 'Expansion',
      description: 'Expanded to 100+ cities across India with 200+ verified wellness vendors.',
      icon: Globe
    },
    {
      year: '2024',
      title: 'Recognition',
      description: 'Awarded "Best Corporate Wellness Platform" and achieved 95% client satisfaction.',
      icon: Trophy
    },
    {
      year: '2026',
      title: 'Future Forward',
      description: 'Continuing to innovate with AI-powered wellness recommendations and personalized health journeys.',
      icon: Sparkles
    }
  ];

  // Leadership Team (Placeholder)
  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=fff&size=200',
      bio: 'Serial entrepreneur with 15+ years in healthcare technology'
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Product Officer',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=059669&color=fff&size=200',
      bio: 'Former product lead at leading wellness tech companies'
    },
    {
      name: 'Amit Patel',
      role: 'Chief Technology Officer',
      image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=047857&color=fff&size=200',
      bio: 'Tech veteran with expertise in scalable platform architecture'
    },
    {
      name: 'Meera Singh',
      role: 'VP of Partnerships',
      image: 'https://ui-avatars.com/api/?name=Meera+Singh&background=065f46&color=fff&size=200',
      bio: 'Built strategic partnerships across healthcare and wellness sectors'
    }
  ];

  const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // each card reveals 0.2s after the previous
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};


  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Static Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 left-16 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-2xl transform rotate-12" />
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-white/5 rounded-2xl transform -rotate-12" />
        </div>
        <div className="absolute top-10 right-1/4 w-2 h-2 bg-white/40 rounded-full" />
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-white/40 rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white/40 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white/40 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 border-0 inline-flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4" />
                About FitPlay
              </Badge>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              variants={itemVariants}
            >
              Transforming Corporate Wellness
              <br />
              <span className="text-emerald-100">One Employee at a Time</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              We're on a mission to make employee wellness accessible, engaging, and impactful 
              through innovative technology and curated wellness solutions.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16"
              variants={containerVariants}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-base text-emerald-100">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-emerald-100 text-emerald-700 px-4 py-2">Our Story</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Building India's Leading Wellness Marketplace
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                FitPlay was born from a simple observation: traditional corporate wellness programs 
                weren't working. Employees had limited choices, companies lacked visibility, and 
                the process was cumbersome for everyone involved.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We set out to change that. By creating a digital marketplace that connects companies, 
                employees, and verified wellness vendors, we've built a platform that makes wellness 
                benefits truly accessible and engaging.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve over 200 companies and 50,000+ employees across India, 
                helping them discover and redeem wellness products and services that genuinely improve 
                their health and happiness.
              </p>

              <div className="flex gap-4 pt-4">
                <Link href="/partner">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl px-8 shadow-lg group">
                    Partner With Us
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691736975-9f7f643d178e?w=800&q=80"
                  alt="FitPlay Team"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driving purpose and direction for the future of corporate wellness
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white hover:shadow-2xl transition-all duration-300 border-0 h-full">
                <CardContent className="p-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    To democratize corporate wellness by providing employees with the freedom to 
                    choose wellness solutions that best fit their individual needs, while giving 
                    companies powerful tools to manage and measure their wellness investments.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Empower employees with choice and flexibility',
                      'Simplify wellness benefit management for HR',
                      'Partner with verified, quality wellness vendors',
                      'Deliver measurable health and business outcomes'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white hover:shadow-2xl transition-all duration-300 border-0 h-full">
                <CardContent className="p-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    To become the most trusted and comprehensive corporate wellness platform in 
                    India, setting the standard for how companies invest in employee health and 
                    how employees experience wellness benefits.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Be the #1 corporate wellness platform in India',
                      'Serve 1 million+ employees by 2026',
                      'Build the largest wellness vendor network',
                      'Pioneer AI-powered personalized wellness'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-100 text-emerald-700 px-4 py-2 mb-6">Core Values</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our values guide every decision we make and shape our culture
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {coreValues.map((value, index) => (
              <motion.div
  key={index}
  variants={itemVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }} // triggers when 20% of card is visible
  whileHover={{ y: -10, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300 }}
>

                <Card className="bg-gradient-to-br from-gray-50 to-emerald-50/30 hover:shadow-2xl transition-all duration-300 border-0 h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 text-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-emerald-100">
              Milestones that shaped FitPlay's growth and success
            </p>
          </motion.div>

          <motion.div 
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-emerald-500/20 hidden lg:block" />

            <div className="space-y-12">
              {journey.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex flex-col lg:flex-row gap-8 items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <motion.div
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                      <div className="text-emerald-400 font-bold text-xl mb-2">{milestone.year}</div>
                      <h3 className="text-2xl font-bold mb-3">{milestone.title}</h3>
                      <p className="text-emerald-100">{milestone.description}</p>
                    </motion.div>
                  </div>

                  {/* Icon */}
                  <div className="lg:w-2/12 flex justify-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-900 relative z-10"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <milestone.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Spacer */}
                  <div className="lg:w-5/12" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-100 text-emerald-700 px-4 py-2 mb-6">Our Team</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet the Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals driving FitPlay's vision forward
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-white hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <div className="text-emerald-600 font-medium mb-3">{member.role}</div>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Join the Wellness Revolution
            </h2>
            <p className="text-emerald-50 text-xl max-w-2xl mx-auto leading-relaxed">
              Whether you're a company looking to transform employee wellness or a vendor wanting to reach more customers, we'd love to connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/partner">
                <Button 
                  size="lg" 
                  className="bg-white text-emerald-600 hover:bg-gray-50 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  For Companies
                </Button>
              </Link>
              <Link href="/support">
                <Button 
                  size="lg" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}