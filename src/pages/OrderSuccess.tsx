import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

const OrderSuccess = () => {
  const { tokenId } = useParams();
  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
          >
            <CheckCircle2 className="h-12 w-12 text-success" />
          </motion.div>

          <h1 className="mt-6 font-display text-4xl font-bold">Your order is processing</h1>
          <p className="mt-3 text-muted-foreground">Please wait while we prepare your meal. Show this token at the counter.</p>

          <div className="mt-8 rounded-2xl bg-foreground p-8 text-background">
            <p className="text-xs font-semibold uppercase tracking-widest text-background/60">Token number</p>
            <p className="mt-2 font-display text-6xl font-bold tracking-tight">{tokenId}</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Estimated wait: 15–25 minutes
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/orders"><Button variant="outline">View my orders</Button></Link>
            <Link to="/"><Button variant="accent">Order more</Button></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
