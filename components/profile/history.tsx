"use client";

import React, { useState,useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Order {
  id: string;
  date: string;
  item: string;
  amount: number;
  isCashPayment?: boolean | null;
  credits: number;
  status: string;
  phNumber?: string | null;
  address?: string | null;
  deliveryInstructions?: string | null;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
    variant: {
      id: string;
      variantValue: string;
    } | null;
  }>;
}

/* ================= MAIN COMPONENT ================= */

export default function History({ orderHistory }: { orderHistory: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const router = useRouter();
 
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orderHistory.filter((order) => {
      const orderDate = new Date(order.createdAt);

      // STATUS
      const statusMatch =
        statusFilter === "ALL" ||
        order.status.toUpperCase() === statusFilter;

      // PAYMENT
      const paymentMatch =
        paymentFilter === "ALL" ||
        (paymentFilter === "CASH" && order.isCashPayment) ||
        (paymentFilter === "CREDITS" && !order.isCashPayment);

      // DATE RANGE
      let dateMatch = true;
      if (dateFilter === "7_DAYS") {
        const d = new Date();
        d.setDate(now.getDate() - 7);
        dateMatch = orderDate >= d;
      }
      if (dateFilter === "6_MONTHS") {
        const d = new Date();
        d.setMonth(now.getMonth() - 6);
        dateMatch = orderDate >= d;
      }
      if (dateFilter === "1_YEAR") {
        const d = new Date();
        d.setFullYear(now.getFullYear() - 1);
        dateMatch = orderDate >= d;
      }

      return statusMatch && paymentMatch && dateMatch;
    });
  }, [orderHistory, statusFilter, paymentFilter, dateFilter]);

  /* ================= STATUS COLOR ================= */

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /* ================= PAYMENT LABEL ================= */

  const paymentLabel = (order: Order) =>
    order.isCashPayment ? "INR" : "Credits";

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Orders & Redemptions
        </CardTitle>
      </CardHeader>

      <CardContent>


        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="6_MONTHS">Last 6 Months</option>
            <option value="1_YEAR">Last 1 Year</option>
          </select>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="CREDITS">Credits</option>
          </select>
        </div>
        <div className="border rounded-xl overflow-hidden">

          {/* ================= DESKTOP TABLE ================= */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((order) => {
                const open = expandedId === order.id;

                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      onClick={() =>
                        setExpandedId(open ? null : order.id)
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>{order.item}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {paymentLabel(order)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.amount}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {open ? <ChevronUp /> : <ChevronDown />}
                      </TableCell>
                    </TableRow>

                    {open && (
                      <ExpandedView order={order} router={router} />
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>

          {/* ================= MOBILE VIEW ================= */}
          <div className="md:hidden space-y-4 p-4">
            {filteredOrders.map((order) => {
              const open = expandedId === order.id;

              return (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 bg-white"
                >
                  <div
                    onClick={() =>
                      setExpandedId(open ? null : order.id)
                    }
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">#{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    {open ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  <div className="flex justify-between mt-3">
                    <Badge className={statusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="font-semibold">
                      {order.amount}
                    </span>
                  </div>

                  {open && (
                    <div className="mt-6">
                      <ExpandedContent order={order} router={router} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

/* ================= EXPANDED DESKTOP WRAPPER ================= */

function ExpandedView({
  order,
  router,
}: {
  order: Order;
  router: any;
}) {
  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-gray-50 p-6">
        <ExpandedContent order={order} router={router} />
      </TableCell>
    </TableRow>
  );
}

/* ================= EXPANDED CONTENT ================= */

function ExpandedContent({
  order,
  router,
}: {
  order: Order;
  router: any;
}) {
  return (
    <div className="space-y-8">

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border rounded-xl p-4">
        <Summary label="Order ID" value={order.id} />
        <Summary label="Transaction ID" value={order.transactionId || "N/A"} />
        <Summary label="Created" value={new Date(order.createdAt).toLocaleString()} />
        <Summary label="Updated" value={new Date(order.updatedAt).toLocaleString()} />
      </div>

      {/* PRODUCTS */}
      <div className="bg-white border rounded-xl p-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" /> Products
        </h4>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 border rounded-lg p-3">
              <div className="w-16 h-16 border rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={item.product.images?.[0] || "/placeholder.png"}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.product.name}</p>
                {item.variant && (
                  <p className="text-sm text-gray-500">
                    {item.variant.variantValue}
                  </p>
                )}
                <p className="text-sm">
                  Qty {item.quantity} × {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DELIVERY + PAYMENT */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Delivery
          </h4>
          {order.address && <p className="text-sm flex gap-2"><MapPin className="w-4 h-4" />{order.address}</p>}
          {order.phNumber && <p className="text-sm flex gap-2 mt-2"><Phone className="w-4 h-4" />{order.phNumber}</p>}
        </div>

        <div className="bg-white border rounded-xl p-4">
  <h4 className="font-semibold mb-3 flex items-center gap-2">
    <CreditCard className="w-4 h-4" /> Payment
  </h4>

  {/* Credits payment */}
  {!order.isCashPayment && (
    <p className="text-lg">Credits Used: {order.credits}</p>
  )}

  {/* Cash payment */}
  {order.isCashPayment && (
    <p className="text-lg">Cash Paid: ₹{order.amount}</p>
  )}
</div>

      </div>

      {/* TIMELINE */}
      <div className="bg-white border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Timeline label="Pending" active={order.status === "PENDING"} />
        <Timeline label="Approved" active={order.status === "APPROVED"} />
        <Timeline label="Dispatched" active={order.status === "DISPATCHED"} />
        <Timeline label="Delivered" active={order.status === "DELIVERED"} />
      </div>

      {/* SUPPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl gap-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <p className="font-medium">Need help with this order?</p>
        </div>
        <Button onClick={() => router.push("/profile?tab=wishlist")}>
          Contact Support
        </Button>
      </div>

    </div>
  );
}

/* ================= HELPERS ================= */

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium break-all">{value}</p>
    </div>
  );
}

function Timeline({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {active ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Clock className="w-4 h-4 text-gray-400" />
      )}
      {label}
    </div>
  );
}




// "use client";

// import React, { useState, useMemo } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import {
//   Package,
//   MapPin,
//   Phone,
//   CreditCard,
//   Truck,
//   HelpCircle,
//   ChevronDown,
//   ChevronUp,
//   Clock,
//   CheckCircle,
// } from "lucide-react";
// import { ImageWithFallback } from "@/components/ImageWithFallback";
// import { useRouter } from "next/navigation";

// /* ================= TYPES ================= */

// interface Order {
//   id: string;
//   date: string;
//   item: string;
//   amount: number;
//   isCashPayment?: boolean | null;
//   credits: number;
//   status: string;
//   phNumber?: string | null;
//   address?: string | null;
//   deliveryInstructions?: string | null;
//   transactionId?: string | null;
//   createdAt: string;
//   updatedAt: string;
//   items: Array<{
//     id: string;
//     quantity: number;
//     price: number;
//     product: {
//       id: string;
//       name: string;
//       images: string[];
//     };
//     variant: {
//       id: string;
//       variantValue: string;
//     } | null;
//   }>;
// }

// /* ================= MAIN ================= */

// export default function History({ orderHistory }: { orderHistory: Order[] }) {
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [paymentFilter, setPaymentFilter] = useState("ALL");
//   const router = useRouter();

//   /* ================= FILTER LOGIC ================= */

//   const filteredOrders = useMemo(() => {
//     return orderHistory.filter((order) => {
//       const statusMatch =
//         statusFilter === "ALL" ||
//         order.status.toUpperCase() === statusFilter;

//       const paymentMatch =
//         paymentFilter === "ALL" ||
//         (paymentFilter === "CASH" && order.isCashPayment) ||
//         (paymentFilter === "CREDITS" && !order.isCashPayment);

//       return statusMatch && paymentMatch;
//     });
//   }, [orderHistory, statusFilter, paymentFilter]);

//   /* ================= HELPERS ================= */

//   const statusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       case "dispatched":
//         return "bg-blue-100 text-blue-800";
//       case "approved":
//         return "bg-emerald-100 text-emerald-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const paymentLabel = (order: Order) =>
//     order.isCashPayment ? "INR" : "Credits";

//   return (
//     <Card className="rounded-2xl">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">
//           Orders & Redemptions
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         {/* ================= FILTER BAR ================= */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <select
//             className="border rounded-lg px-3 py-2 text-sm"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="ALL">All Status</option>
//             <option value="PENDING">Pending</option>
//             <option value="APPROVED">Approved</option>
//             <option value="DISPATCHED">Dispatched</option>
//             <option value="DELIVERED">Delivered</option>
//           </select>

//           <select
//             className="border rounded-lg px-3 py-2 text-sm"
//             value={paymentFilter}
//             onChange={(e) => setPaymentFilter(e.target.value)}
//           >
//             <option value="ALL">All Payments</option>
//             <option value="CASH">Cash</option>
//             <option value="CREDITS">Credits</option>
//           </select>
//         </div>

//         <div className="border rounded-xl overflow-hidden">
//           {/* ================= DESKTOP ================= */}
//           <Table className="hidden md:table">
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Order ID</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Item</TableHead>
//                 <TableHead>Payment</TableHead>
//                 <TableHead>Total</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead />
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredOrders.map((order) => {
//                 const open = expandedId === order.id;

//                 return (
//                   <React.Fragment key={order.id}>
//                     <TableRow
//                       onClick={() =>
//                         setExpandedId(open ? null : order.id)
//                       }
//                       className="cursor-pointer hover:bg-gray-50"
//                     >
//                       <TableCell className="font-medium">
//                         #{order.id}
//                       </TableCell>
//                       <TableCell>
//                         {new Date(order.createdAt).toLocaleDateString("en-IN")}
//                       </TableCell>
//                       <TableCell>{order.item}</TableCell>
//                       <TableCell>
//                         <Badge variant="secondary">
//                           {paymentLabel(order)}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="font-semibold">
//                         {order.amount}
//                       </TableCell>
//                       <TableCell>
//                         <Badge className={statusColor(order.status)}>
//                           {order.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {open ? <ChevronUp /> : <ChevronDown />}
//                       </TableCell>
//                     </TableRow>

//                     {open && (
//                       <TableRow>
//                         <TableCell colSpan={7} className="bg-gray-50 p-6">
//                           <ExpandedContent order={order} router={router} />
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </TableBody>
//           </Table>

//           {/* ================= MOBILE ================= */}
//           <div className="md:hidden space-y-4 p-4">
//             {filteredOrders.map((order) => {
//               const open = expandedId === order.id;

//               return (
//                 <div key={order.id} className="border rounded-xl p-4 bg-white">
//                   <div
//                     onClick={() =>
//                       setExpandedId(open ? null : order.id)
//                     }
//                     className="flex justify-between items-center"
//                   >
//                     <div>
//                       <p className="font-semibold">#{order.id}</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(order.createdAt).toLocaleDateString("en-IN")}
//                       </p>
//                     </div>
//                     {open ? <ChevronUp /> : <ChevronDown />}
//                   </div>

//                   <div className="flex justify-between mt-3">
//                     <Badge className={statusColor(order.status)}>
//                       {order.status}
//                     </Badge>
//                     <span className="font-semibold">
//                       {order.amount}
//                     </span>
//                   </div>

//                   {open && (
//                     <div className="mt-6">
//                       <ExpandedContent order={order} router={router} />
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// /* ================= EXPANDED ================= */

// function ExpandedContent({ order, router }: { order: Order; router: any }) {
//   return (
//     <div className="space-y-8">
//       {/* SUMMARY */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border rounded-xl p-4">
//         <Summary label="Order ID" value={order.id} />
//         <Summary label="Transaction ID" value={order.transactionId || "N/A"} />
//         <Summary label="Created" value={new Date(order.createdAt).toLocaleString()} />
//         <Summary label="Updated" value={new Date(order.updatedAt).toLocaleString()} />
//       </div>

//       {/* PAYMENT */}
//       <div className="bg-white border rounded-xl p-4">
//         <h4 className="font-semibold mb-3 flex items-center gap-2">
//           <CreditCard className="w-4 h-4" /> Payment
//         </h4>
//         {!order.isCashPayment && (
//           <p className="text-lg">Credits Used: {order.credits}</p>
//         )}
//         {order.isCashPayment && (
//           <p className="text-lg">Cash Paid: ₹{order.amount}</p>
//         )}
//       </div>

//       {/* SUPPORT */}
//       <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
//         <p className="font-medium flex items-center gap-2">
//           <HelpCircle className="w-5 h-5" /> Need help with this order?
//         </p>
//         <Button onClick={() => router.push("/profile?tab=wishlist")}>
//           Contact Support
//         </Button>
//       </div>
//     </div>
//   );
// }

// /* ================= SMALL HELPERS ================= */

// function Summary({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-xs text-gray-500">{label}</p>
//       <p className="font-medium break-all">{value}</p>
//     </div>
//   );
// }
