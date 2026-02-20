import OrderDetail from "@/components/OrderDetail";

export default function AdminOrderDetailPage() {
  return <OrderDetail isAdmin={true} backUrl="/admin/orders" />;
}
