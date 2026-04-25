import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { deleteOrder, getOrders } from "@/lib/store";
import { Order } from "@/lib/types";
import { Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "completed">("all");
  const [dateFilter, setDateFilter] = useState("");

  const refresh = () => setOrders(getOrders().filter((o) => o.userId === user?.id));
  useEffect(() => { refresh(); }, [user?.id]);

  const filtered = useMemo(() => orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (dateFilter && !o.createdAt.startsWith(dateFilter)) return false;
    return true;
  }), [orders, statusFilter, dateFilter]);

  const handleDelete = (id: string) => {
    deleteOrder(id);
    toast.success("Order removed");
    refresh();
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container py-10 sm:py-16">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">My orders</h1>
        <p className="mt-2 text-muted-foreground">Your order history at a glance.</p>

        <div className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "processing", "completed"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-smooth ${
                  statusFilter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>{s}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 w-44" />
            {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>Clear</Button>}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Token</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((o) => (
                    <motion.tr key={o.tokenId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-t border-border">
                      <td className="px-4 py-4 font-display font-bold">{o.tokenId}</td>
                      <td className="px-4 py-4 text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {o.items.map((i) => `${i.name}×${i.quantity}`).join(", ")}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold">₹{o.totalAmount}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          o.status === "completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(o.tokenId)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
