import OrderDetail from "@/components/OrderDetail";

export default function UserOrderDetailPage() {
  return <OrderDetail isAdmin={false} backUrl="/profile" />;
}
