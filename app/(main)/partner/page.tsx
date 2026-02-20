"use client";

import React, { useState } from 'react';
import { ArrowRight, Building2, Users, Target, TrendingUp, CheckCircle, Star, Award, Shield, Zap, Clock, HeartHandshake, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ImageWithFallback';

export default function PartnerWithUs() {
  const [contactForm, setContactForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    employeeCount: '',
    industry: '',
    currentProgram: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form
    setContactForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      employeeCount: '',
      industry: '',
      currentProgram: '',
      message: ''
    });
    alert('Thank you for your interest! Our team will contact you within 24 hours.');
  };

  const aboutStats = [
    { icon: Building2, number: '50+', label: 'Corporate Partners' },
    { icon: Users, number: '10,000+', label: 'Active Employees' },
    { icon: Target, number: '95%', label: 'Employee Engagement' },
    { icon: TrendingUp, number: '1000+', label: 'Wellness Products' }
  ];

  const services = [
    {
      icon: Shield,
      title: 'Curated Wellness Marketplace',
      description: 'Access to premium health products, diagnostics, and wellness services from verified vendors.',
      features: ['Health screenings', 'Fitness equipment', 'Nutrition supplements', 'Mental wellness programs']
    },
    {
      icon: Zap,
      title: 'Smart Points System',
      description: 'Flexible credit allocation system that allows employees to redeem company points for wellness products.',
      features: ['Customizable credit limits', 'Real-time tracking', 'Automated allocation', 'Usage analytics']
    },
    {
      icon: Clock,
      title: 'Comprehensive Analytics',
      description: 'Detailed insights into employee wellness engagement and program effectiveness.',
      features: ['Engagement metrics', 'Health outcomes tracking', 'ROI measurement', 'Custom reports']
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: 'Full-service support including implementation, training, and ongoing customer success.',
      features: ['24/7 customer support', 'Training sessions', 'Account management', 'Technical assistance']
    }
  ];

  const benefits = [
    'Improve employee health and wellness outcomes',
    'Increase employee satisfaction and retention',
    'Reduce healthcare costs and absenteeism',
    'Easy implementation with existing HR systems',
    'Comprehensive analytics and reporting',
    'Scalable solution for companies of all sizes',
    'Expert customer support and account management',
    'Flexible pricing models to fit your budget'
  ];

  const testimonials = [
    {
      company: 'TechCorp India',
      industry: 'Technology',
      employees: '500+',
      quote: 'FitPlay has transformed our employee wellness program. The engagement rates have increased by 300% since implementation.',
      name: 'Priya Sharma',
      role: 'HR Director',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=10b981&color=fff'
    },
    {
      company: 'Manufacturing Plus',
      industry: 'Manufacturing',
      employees: '1200+',
      quote: 'The analytics and reporting features help us track ROI effectively. Our employees love the variety of wellness options.',
      name: 'Rajesh Kumar',
      role: 'Chief People Officer',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=fff'
    },
    {
      company: 'Finance Solutions',
      industry: 'Financial Services',
      employees: '800+',
      quote: 'Implementation was seamless and the support team is exceptional. Highly recommend for any corporate wellness program.',
      name: 'Anitha Reddy',
      role: 'VP Human Resources',
      image: 'https://ui-avatars.com/api/?name=Anitha+Reddy&background=10b981&color=fff'
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">Partner with FitPlay</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Employee Wellness
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Join India&apos;s leading corporate wellness marketplace and provide your employees with 
                access to premium health products, diagnostics, and wellness services.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                className="group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center justify-center gap-2">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
              
              <button className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border-2 border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                Download Brochure
              </button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {aboutStats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <stat.icon className="w-5 h-5 text-emerald-400" />
                    <p className="text-2xl font-bold text-white">{stat.number}</p>
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" fillOpacity="1"/>
          </svg>
        </div>
      </section>

      {/* About FitPlay */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-green-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-teal-500 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-primary mb-8 leading-tight">
                  About <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">FitPlay</span>
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  FitPlay is India&apos;s premier B2B wellness marketplace, designed exclusively for corporate employee 
                  wellness programs. We bridge the gap between companies wanting to invest in employee health and 
                  employees seeking convenient access to premium wellness products and services.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Our platform enables companies to allocate wellness credits to employees, who can then redeem 
                  these credits for curated health products, diagnostic tests, fitness equipment, nutrition supplements, 
                  and preventive care services from verified vendors.
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-100">
                <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                  <Target className="w-8 h-8 text-emerald-600" />
                  Our Mission
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To make corporate wellness programs more engaging, effective, and accessible by providing 
                  employees with the freedom to choose wellness solutions that best fit their individual needs.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 blur-3xl rounded-3xl transform rotate-3"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Corporate wellness team"
                className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              What We <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive wellness solutions designed to maximize employee engagement and health outcomes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-2xl transition-all duration-500 border-2 border-emerald-100/50 hover:border-emerald-200 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-8 relative">
                    <div className="space-y-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.icon === Shield ? 'from-emerald-500 to-green-500' : service.icon === Zap ? 'from-green-500 to-teal-500' : service.icon === Clock ? 'from-teal-500 to-cyan-500' : 'from-cyan-500 to-blue-500'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-emerald-700 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                          {service.description}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center text-gray-700"
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Why Choose <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">FitPlay</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the benefits of a comprehensive, easy-to-implement corporate wellness solution
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                    {benefit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              What Our <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Partners</span> Say
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Hear from HR leaders who have transformed their wellness programs with FitPlay
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-emerald-400/30 transition-all duration-300 group"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-lg italic leading-relaxed group-hover:text-white transition-colors">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-emerald-300 font-semibold">{testimonial.company}</div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.industry} • {testimonial.employees} employees
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-24 bg-gradient-to-br from-emerald-50 to-green-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Ready to Transform Your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Wellness Program</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our team to schedule a demo and learn how FitPlay can benefit your organization
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100/50"
          >
            <div className="p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={contactForm.companyName}
                      onChange={(e) => setContactForm({...contactForm, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Name *</label>
                    <Input
                      value={contactForm.contactName}
                      onChange={(e) => setContactForm({...contactForm, contactName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Employees</label>
                    <Select value={contactForm.employeeCount} onValueChange={(value) => setContactForm({...contactForm, employeeCount: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Select value={contactForm.industry} onValueChange={(value) => setContactForm({...contactForm, industry: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Current Wellness Program</label>
                  <Select value={contactForm.currentProgram} onValueChange={(value) => setContactForm({...contactForm, currentProgram: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Do you have an existing wellness program?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No existing program</SelectItem>
                      <SelectItem value="basic">Basic wellness initiatives</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive wellness program</SelectItem>
                      <SelectItem value="looking-to-replace">Looking to replace current program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Tell us about your wellness goals and any specific requirements..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Schedule Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-3 gap-8"
          >
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-primary text-lg mb-2">Email Us</div>
              <div className="text-gray-600">partnerships@fitplay.life</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-primary text-lg mb-2">Call Us</div>
              <div className="text-gray-600">+91 98765 43210</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-primary text-lg mb-2">Visit Us</div>
              <div className="text-gray-600">Gurugram, India</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
