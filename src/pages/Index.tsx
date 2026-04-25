import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getMenu } from "@/lib/store";
import { MenuItem } from "@/lib/types";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-food.jpg";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const { add, count } = useCart();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    getMenu().then(setMenu);
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map((m) => m.category || "Other")))], [menu]);
  const filtered = activeCat === "All" ? menu : menu.filter((m) => (m.category || "Other") === activeCat);

  const handleAdd = (m: MenuItem) => {
    if (!user) return toast.error("Please sign in to order", { action: { label: "Sign in", onClick: () => (window.location.href = "/login") } });
    if (user.role === "admin") return toast.info("Admins can manage menu but not order");
    add(m);
    toast.success(`${m.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Authentic Indian feast" className="h-full w-full object-cover" width={1536} height={1024} />
          <div className="absolute inset-0 gradient-hero" />
        </div>
        <div className="container relative py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Fresh, hand-crafted, delivered to your table
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl text-balance">
              Flavours that feel like <span className="text-accent">home.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Order ahead, skip the wait. A modern menu rooted in tradition — straight from our kitchen to your token.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#menu"><Button variant="hero" size="lg">View menu <ArrowRight className="h-4 w-4" /></Button></a>
              {!user && <Link to="/signup"><Button variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">Sign up free</Button></Link>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="container py-16 sm:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">The menu</p>
            <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Pick your plate</h2>
          </div>
          {count > 0 && (
            <Link to="/cart"><Button variant="accent">View cart ({count}) <ArrowRight className="h-4 w-4" /></Button></Link>
          )}
        </div>

        {/* category chips */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                activeCat === c
                  ? "bg-foreground text-background shadow-soft"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-3xl">
                  {m.image || "🍽️"}
                </div>
                {m.category && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.category}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">{m.name}</h3>
              {m.description && <p className="mt-1.5 text-sm text-muted-foreground">{m.description}</p>}
              <div className="mt-6 flex items-center justify-between">
                <span className="font-display text-2xl font-bold">₹{m.price}</span>
                <Button size="sm" variant="accent" onClick={() => handleAdd(m)}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No items in this category yet.</p>
        )}
      </section>

      <footer className="border-t border-border bg-secondary/30 py-10">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Outdoor Delivery · Crafted with care
        </div>
      </footer>
    </div>
  );
};

export default Index;
