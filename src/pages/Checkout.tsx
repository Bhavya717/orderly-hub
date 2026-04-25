import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder, getQR } from "@/lib/store";
import { toast } from "sonner";
import qrFallback from "@/assets/qr-placeholder.jpg";
import { Upload, ImagePlus } from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [qr, setQrImg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQR().then(setQrImg);
    if (items.length === 0) navigate("/cart", { replace: true });
  }, [items.length, navigate]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 2_500_000) return toast.error("Image too large (max 2.5 MB)");
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!/^\d{10}$/.test(phone.trim())) return toast.error("Enter a valid 10-digit phone number");
    if (!screenshot) return toast.error("Please upload payment screenshot");
    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        customerName: user.name,
        phone: phone.trim(),
        items,
        totalAmount: total,
        paymentScreenshot: screenshot,
      });
      clear();
      setTimeout(() => navigate(`/order-success/${order.tokenId}`), 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container py-10 sm:py-16">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Scan, pay, and upload your payment proof to confirm.</p>

        <form onSubmit={submit} className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div>
              <h3 className="font-display text-xl font-semibold">Step 1 · Scan to pay</h3>
              <p className="mt-1 text-sm text-muted-foreground">Use any UPI app to pay ₹{total}.</p>
              <div className="mt-4 flex justify-center rounded-2xl bg-secondary/60 p-6">
                <img src={qr || qrFallback} alt="Payment QR code" className="h-56 w-56 rounded-xl bg-white object-contain p-3 shadow-soft" loading="lazy" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold">Step 2 · Your details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user?.name || ""} disabled className="mt-1.5 h-11" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input id="phone" inputMode="numeric" maxLength={10} required value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 h-11" placeholder="10-digit number" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold">Step 3 · Upload payment screenshot</h3>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-smooth hover:border-accent hover:bg-secondary/50">
                {screenshot ? (
                  <>
                    <img src={screenshot} alt="Payment proof" className="max-h-48 rounded-lg shadow-soft" />
                    <span className="text-sm font-medium text-accent">Change image</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG or JPG · max 2.5 MB</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </motion.div>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h3 className="font-display text-xl font-semibold">Order summary</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{i.name} × {i.quantity}</span>
                  <span className="font-medium">₹{i.price * i.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4 flex justify-between text-base font-bold">
              <span>Total</span><span>₹{total}</span>
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting}>
              <Upload className="h-4 w-4" /> {submitting ? "Submitting…" : "Confirm order"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">You'll receive a token number after submission.</p>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
