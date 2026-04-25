import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container py-10 sm:py-16">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Your cart</h1>
        <p className="mt-2 text-muted-foreground">Review your selection before payment.</p>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse the menu to add some delicious items.</p>
            <Link to="/"><Button variant="accent" className="mt-6">Browse menu</Button></Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5"
                  >
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold">{it.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{it.price} each</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setQty(it.id, it.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setQty(it.id, it.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="hidden w-20 text-right font-semibold sm:block">₹{it.price * it.quantity}</div>
                    <Button size="icon" variant="ghost" onClick={() => remove(it.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <h3 className="font-display text-xl font-semibold">Order summary</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>₹{total}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Taxes</dt><dd className="text-muted-foreground">Included</dd></div>
                <div className="border-t border-border pt-3 flex justify-between text-base font-semibold">
                  <dt>Total</dt><dd>₹{total}</dd>
                </div>
              </dl>
              <Button variant="hero" size="lg" className="mt-6 w-full" onClick={() => navigate("/checkout")}>
                Place order
              </Button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
