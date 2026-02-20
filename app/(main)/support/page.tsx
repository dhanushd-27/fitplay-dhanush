"use client";

import React, { useState } from 'react';
import { Search, MessageCircle, Phone, Mail, FileText, Send, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FloatingElements from '@/components/FloatingElements';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const faqCategories = [
    { id: 'all', name: 'All Topics' },
    { id: 'credits', name: 'Credits & Payments' },
    { id: 'orders', name: 'Orders & Shipping' },
    { id: 'products', name: 'Products & Services' },
    { id: 'account', name: 'Account & Profile' },
    { id: 'wellness', name: 'Wellness Program' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'credits',
      question: 'How do I check my credit balance?',
      answer: 'You can view your credit balance on the My Benefits page. It shows your total credits, used credits, and remaining balance. You can also see your credit history and expiry dates.',
      helpful: 15,
      tags: ['credits', 'balance']
    },
    {
      id: 2,
      category: 'credits',
      question: 'When do my wellness credits expire?',
      answer: 'Wellness credits typically expire at the end of each calendar year (December 31st). Any unused credits will be forfeited, so make sure to use them before the expiry date.',
      helpful: 23,
      tags: ['credits', 'expiry']
    },
    {
      id: 3,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'After placing an order, you will receive a confirmation email with tracking information. You can also track your orders in the Profile section under Order History.',
      helpful: 18,
      tags: ['orders', 'tracking']
    },
    {
      id: 4,
      category: 'orders',
      question: 'What is the return policy?',
      answer: 'Most products can be returned within 30 days of delivery in their original condition. Digital services and health screenings are typically non-refundable. Check the specific product page for return eligibility.',
      helpful: 12,
      tags: ['returns', 'policy']
    },
    {
      id: 5,
      category: 'products',
      question: 'How do I know if a product is covered by my company benefits?',
      answer: 'All products in our Wellness Store are pre-approved by your company. You can purchase any item using your wellness credits. The credit cost is clearly displayed on each product page.',
      helpful: 27,
      tags: ['benefits', 'coverage']
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page and click the Edit button in the Personal Information section. You can update your name and email address. Department and Employee ID cannot be changed.',
      helpful: 8,
      tags: ['profile', 'settings']
    },
    {
      id: 7,
      category: 'wellness',
      question: 'How is my wellness score calculated?',
      answer: 'Your wellness score is based on your activity level, completed health screenings, product purchases, and participation in wellness challenges. It is updated monthly and helps track your wellness journey.',
      helpful: 31,
      tags: ['wellness', 'score']
    },
    {
      id: 8,
      category: 'wellness',
      question: 'Can I earn bonus credits?',
      answer: 'Yes! You can earn bonus credits by completing wellness challenges, referring colleagues, writing product reviews, and participating in company wellness events.',
      helpful: 22,
      tags: ['bonus', 'credits', 'challenges']
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our wellness support team',
      availability: 'Mon-Fri, 9 AM - 6 PM IST',
      action: 'Start Chat',
      primary: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      primary: false
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      availability: 'Mon-Fri, 9 AM - 5 PM IST',
      action: 'Call Now',
      primary: false
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // Reset form
    setContactForm({
      name: '',
      email: '',
      category: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950">
        <FloatingElements />

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
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">We&apos;re Here to Help</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                  Help & Support
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Find answers to common questions or get in touch with our wellness support team for personalized assistance.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" fillOpacity="1"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Search and Filter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for help topics, keywords, or questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-emerald-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48 h-12 border-2 border-gray-200 focus:border-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 to-green-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-400 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-green-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-teal-400 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Support Your Way
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Choose the support method that works best for you
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {contactOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center space-y-6 h-full flex flex-col justify-between">
                    <div>
                      <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-all duration-300 ${
                        option.primary 
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:scale-110' 
                          : 'bg-white/20 group-hover:bg-emerald-500'
                      }`}>
                        <option.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">{option.title}</h3>
                      <p className="text-emerald-100 mb-4">{option.description}</p>
                      <p className="text-sm text-emerald-200">{option.availability}</p>
                    </div>
                    <Button 
                      size="lg"
                      className={`w-full transition-all duration-300 ${
                        option.primary 
                          ? 'bg-white text-emerald-900 hover:bg-emerald-50 hover:scale-105' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105'
                      }`}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ and Contact Form */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-12"
          >
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-8"
              >
                <h2 className="text-4xl font-bold text-primary">Frequently Asked Questions</h2>
                <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 text-lg">
                  {filteredFaqs.length} results
                </Badge>
              </motion.div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`faq-${faq.id}`} className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="text-left">
                            <h3 className="font-medium text-primary">{faq.question}</h3>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                                {faqCategories.find(cat => cat.id === faq.category)?.name}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap gap-1">
                              {faq.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all categories
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={contactForm.category} onValueChange={(value) => setContactForm({...contactForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credits">Credits & Payments</SelectItem>
                      <SelectItem value="orders">Orders & Shipping</SelectItem>
                      <SelectItem value="products">Products & Services</SelectItem>
                      <SelectItem value="account">Account & Profile</SelectItem>
                      <SelectItem value="wellness">Wellness Program</SelectItem>
                      <SelectItem value="technical">Technical Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Describe your issue or question in detail..."
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-600" asChild>
                <a href="#track-order">Track My Order</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-600" asChild>
                <a href="#return-policy">Return Policy</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-600" asChild>
                <a href="#wellness-guide">Wellness Program Guide</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-600" asChild>
                <a href="#credit-guide">Credit Usage Guide</a>
              </Button>
            </CardContent>
          </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}