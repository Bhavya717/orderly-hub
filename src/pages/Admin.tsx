import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { deleteMenuItem, getMenu, getOrders, getQR, setQR, updateOrder, upsertMenuItem } from "@/lib/store";
import { MenuItem, Order } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Pencil, Plus, Trash2, Image as ImageIcon, Search, IndianRupee, ShoppingBag, Clock } from "lucide-react";
import { toast } from "sonner";
import qrFallback from "@/assets/qr-placeholder.jpg";

const empty: MenuItem = { id: "", name: "", price: 0, description: "", category: "", image: "" };

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [qr, setQrImg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "completed">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [previewShot, setPreviewShot] = useState<string | null>(null);

  const refresh = async () => {
    setOrders(await getOrders());
    setMenu(await getMenu());
    setQrImg(await getQR());
  };
  useEffect(() => {
    refresh();
  }, []);

  const filteredOrders = useMemo(() => orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (dateFilter && !o.createdAt.startsWith(dateFilter)) return false;
    if (phoneFilter && !o.phone.includes(phoneFilter)) return false;
    return true;
  }), [orders, statusFilter, dateFilter, phoneFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
  }), [orders]);

  const markComplete = async (id: string) => { await updateOrder(id, { status: "completed" }); toast.success(`${id} marked complete`); refresh(); };

  const handleQR = (f: File | null) => {
    if (!f) return;
    if (f.size > 1_500_000) return toast.error("Image too large (max 1.5 MB)");
    const r = new FileReader();
    r.onload = async () => { await setQR(r.result as string); toast.success("QR updated"); refresh(); };
    r.readAsDataURL(f);
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container py-10 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Dashboard</h1>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Total orders" value={stats.total.toString()} />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Processing" value={stats.processing.toString()} accent />
          <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={`₹${stats.revenue}`} />
        </div>

        <Tabs defaultValue="orders" className="mt-10">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="qr">Payment QR</TabsTrigger>
          </TabsList>

          {/* ORDERS */}
          <TabsContent value="orders" className="mt-6">
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex flex-wrap gap-1.5">
                {(["all", "processing", "completed"] as const).map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-smooth ${
                      statusFilter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search phone…" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} className="h-9 w-44" />
              </div>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 w-44" />
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Token</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Items</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Proof</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredOrders.map((o) => (
                        <motion.tr key={o.tokenId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="border-t border-border align-top">
                          <td className="px-4 py-4 font-display font-bold">{o.tokenId}</td>
                          <td className="px-4 py-4">{o.customerName}<div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div></td>
                          <td className="px-4 py-4 text-muted-foreground">{o.phone}</td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {o.items.map((i) => `${i.name}×${i.quantity}`).join(", ")}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold">₹{o.totalAmount}</td>
                          <td className="px-4 py-4 text-center">
                            {o.paymentScreenshot ? (
                              <button onClick={() => setPreviewShot(o.paymentScreenshot!)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-accent/20 transition-smooth">
                                <ImageIcon className="h-4 w-4" />
                              </button>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              o.status === "completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                            }`}>{o.status}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {o.status === "processing" && (
                              <Button size="sm" variant="accent" onClick={() => markComplete(o.tokenId)}>
                                <CheckCircle className="h-4 w-4" /> Complete
                              </Button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No orders match these filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* MENU */}
          <TabsContent value="menu" className="mt-6">
            <div className="flex justify-end">
              <MenuDialog onSave={async (it) => { await upsertMenuItem(it); toast.success("Menu updated"); refresh(); }} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">{m.image || "🍽️"}</div>
                    <div className="flex gap-1">
                      <MenuDialog item={m} onSave={async (it) => { await upsertMenuItem(it); toast.success("Updated"); refresh(); }} />
                      <Button size="icon" variant="ghost" onClick={async () => { await deleteMenuItem(m.id); toast.success("Deleted"); refresh(); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{m.name}</h3>
                  {m.description && <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{m.category || "—"}</span>
                    <span className="font-display text-xl font-bold">₹{m.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* QR */}
          <TabsContent value="qr" className="mt-6">
            <div className="grid max-w-2xl gap-6 rounded-2xl border border-border bg-card p-8 shadow-soft sm:grid-cols-[auto_1fr] sm:items-center">
              <img src={qr || qrFallback} alt="Current QR" className="h-48 w-48 rounded-xl bg-white object-contain p-3 shadow-soft" />
              <div>
                <h3 className="font-display text-xl font-semibold">Payment QR code</h3>
                <p className="mt-1 text-sm text-muted-foreground">This image is shown to customers on the checkout page.</p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg gradient-warm px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft transition-smooth hover:shadow-glow">
                  <ImageIcon className="h-4 w-4" /> Upload new QR
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQR(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Screenshot preview */}
      <Dialog open={!!previewShot} onOpenChange={(o) => !o && setPreviewShot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Payment screenshot</DialogTitle></DialogHeader>
          {previewShot && <img src={previewShot} alt="Payment proof" className="mx-auto max-h-[70vh] rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft ${accent ? "ring-1 ring-accent/40" : ""}`}>
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent ? "gradient-warm text-accent-foreground" : "bg-secondary text-foreground"}`}>{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const MenuDialog = ({ item, onSave }: { item?: MenuItem; onSave: (i: MenuItem) => void }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MenuItem>(item || { ...empty, id: crypto.randomUUID() });

  const submit = () => {
    if (!draft.name.trim()) return toast.error("Name required");
    if (draft.price <= 0) return toast.error("Price must be > 0");
    onSave(draft);
    setOpen(false);
    if (!item) setDraft({ ...empty, id: crypto.randomUUID() });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && item) setDraft(item); }}>
      <DialogTrigger asChild>
        {item ? (
          <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button variant="accent"><Plus className="h-4 w-4" /> Add item</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? "Edit item" : "Add menu item"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Name</Label><Input className="mt-1.5" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea className="mt-1.5" rows={2} value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price (₹)</Label><Input type="number" min={0} className="mt-1.5" value={draft.price || ""} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
            <div><Label>Category</Label><Input className="mt-1.5" value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="e.g. Mains" /></div>
          </div>
          <div><Label>Emoji / icon</Label><Input className="mt-1.5" value={draft.image || ""} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="🍛" /></div>
        </div>
        <DialogFooter><Button variant="hero" onClick={submit}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
