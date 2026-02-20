"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FilePlus } from "lucide-react";

export default function SupportModule() {
  const [activeTab, setActiveTab] = useState<"faq" | "raise" | "history">("faq");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    message: "",
    orderRef: "",
    file: null as File | null,
  });

  const faqCategories = ["Orders", "Wallet & Payments", "Refunds", "Delivery"];
  const faqs = [
    {
      id: 1,
      category: "Orders",
      question: "How do I track my order?",
      answer: "Check your profile → Orders section.",
    },
    {
      id: 2,
      category: "Wallet & Payments",
      question: "How do I add credits?",
      answer: "Go to Wallet page and click Add Credits.",
    },
    {
      id: 3,
      category: "Refunds",
      question: "How long for a refund?",
      answer: "Refunds are processed in 5–7 business days.",
    },
    {
      id: 4,
      category: "Delivery",
      question: "Can I change delivery address?",
      answer: "Yes, before shipment in Orders page.",
    },
  ];
  
  const ticketHistory = [
   
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketForm({
      subject: "",
      category: "",
      message: "",
      orderRef: "",
      file: null,
    });
  };

  const tabClass = (tab: string) =>
    activeTab === tab
      ? "bg-emerald-500 text-white hover:bg-emerald-600"
      : "text-gray-600 hover:bg-emerald-50";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Button
          variant="ghost"
          className={`rounded-xl px-6 transition-all ${tabClass("faq")}`}
          onClick={() => setActiveTab("faq")}
        >
          FAQs
        </Button>

        <Button
          variant="ghost"
          className={`rounded-xl px-6 transition-all ${tabClass("raise")}`}
          onClick={() => setActiveTab("raise")}
        >
          Raise a Ticket
        </Button>

        <Button
          variant="ghost"
          className={`rounded-xl px-6 transition-all ${tabClass("history")}`}
          onClick={() => setActiveTab("history")}
        >
          Ticket History
        </Button>
      </div>

      {/* FAQs */}
 {activeTab === "faq" && (
  <div className="space-y-10">
    {faqCategories.map((cat) => (
      <div key={cat} className="space-y-4">
        {/* Category Heading */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {cat}
          </h3>
        </div>

        {/* FAQ Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <Accordion type="single" collapsible className="divide-y">
            {faqs
              .filter((f) => f.category === cat)
              .map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${faq.id}`}
                  className="border-none"
                >
                  <AccordionTrigger
                    className="
                      px-6 py-4 text-left text-gray-800
                      hover:no-underline
                      hover:bg-gray-50
                      data-[state=open]:bg-emerald-50
                      data-[state=open]:text-emerald-700
                      transition-colors
                    "
                  >
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </div>
    ))}
  </div>
)}


      {/* Raise Ticket */}
      {activeTab === "raise" && (
        <Card>
          <CardHeader>
            <CardTitle>Raise a Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="font-medium block mb-1">Subject</label>
                <Input
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      subject: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="font-medium block mb-1">Category</label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) =>
                    setTicketForm({ ...ticketForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {faqCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="Profile">Profile</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium block mb-1">Message</label>
                <Textarea
                  rows={4}
                  value={ticketForm.message}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      message: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="font-medium block mb-1">
                  Order Reference (optional)
                </label>
                <Input
                  value={ticketForm.orderRef}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      orderRef: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
  <label className="font-medium text-gray-900">
    File Upload <span className="text-gray-400">(optional)</span>
  </label>

  <label
    htmlFor="file-upload"
    className="
      flex flex-col items-center justify-center
      gap-2 cursor-pointer
      rounded-2xl border-2 border-dashed border-gray-300
      bg-gray-50 px-6 py-8
      text-center
      hover:border-emerald-400 hover:bg-emerald-50
      transition-colors
    "
  >
    <svg
      className="h-8 w-8 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 16v-8m0 0l-3 3m3-3l3 3m5 5H4"
      />
    </svg>

    <p className="text-sm text-gray-600">
      <span className="font-medium text-emerald-600">
        Click to upload
      </span>{" "}
      
    </p>

    <p className="text-xs text-gray-400">
      PNG, JPG, PDF up to 5MB
    </p>

    {ticketForm.file && (
      <p className="text-sm text-emerald-700 font-medium mt-2">
        Selected: {ticketForm.file.name}
      </p>
    )}
  </label>

  <input
    id="file-upload"
    type="file"
    className="hidden"
    onChange={(e) =>
      setTicketForm({
        ...ticketForm,
        file: e.target.files?.[0] || null,
      })
    }
  />
</div>


              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ticket History */}
      {activeTab === "history" && (
        <div className="space-y-4">
         {ticketHistory.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
      <svg
        className="h-8 w-8 text-emerald-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z"
        />
      </svg>
    </div>

    <h2 className="text-lg font-semibold text-gray-900">
      No tickets yet
    </h2>

    <p className="text-sm text-gray-500 max-w-sm">
      You haven’t raised any support tickets. If you face an issue, create a
      ticket and our team will assist you.
    </p>

    <Button
      variant="outline"
      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
      onClick={() => setActiveTab("raise")}
    >
      Raise a Ticket
    </Button>
  </div>
)}


          
          {ticketHistory.map((ticket: Ticket) => (
            <Card key={ticket.id}>
              <CardContent className="flex justify-between items-center">
          <div>
            <p className="font-medium">{ticket.id}</p>
            <Badge
              variant={
                ticket.status === "Open" ? "destructive" : "secondary"
              }
            >
              {ticket.status}
            </Badge>
            <p className="text-sm text-gray-500">
              Last updated: {ticket.lastUpdated}
            </p>
          </div>
          <Button variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}




