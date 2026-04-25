import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, LogOut, User as UserIcon, UtensilsCrossed } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-warm shadow-glow group-hover:scale-105 transition-smooth">
            <UtensilsCrossed className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Saffron</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Link to="/orders">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">My Orders</Button>
                  </Link>
                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="icon" aria-label="Cart">
                      <ShoppingCart className="h-5 w-5" />
                      {count > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                          {count}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup"><Button variant="accent" size="sm">Get started</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
