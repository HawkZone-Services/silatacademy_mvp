import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { name: "Home", href: "/", isRoute: true },
  { name: "Players", href: "#players", isRoute: false },
  { name: "Rankings", href: "/rankings", isRoute: true },
  { name: "Programs", href: "/programs", isRoute: true },
  { name: "Coaches", href: "/coaches", isRoute: true },
  { name: "Library", href: "/library", isRoute: true },
  { name: "About", href: "#about", isRoute: false },
  { name: "Contact", href: "#contact", isRoute: false },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const name = localStorage.getItem("userName") || "";
    setIsAuthenticated(authStatus);
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberMe");

    setIsAuthenticated(false);
    setUserName("");

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
              <span className="font-display text-xl font-bold text-secondary-foreground">
                PS
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold tracking-tight">
                Pencak Silat <span className="text-primary">Academy</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth rounded-md hover:bg-accent"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth rounded-md hover:bg-accent"
                >
                  {link.name}
                </a>
              )
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-secondary/20">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary hover:bg-primary-glow shadow-glow"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) =>
                  link.isRoute ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="px-4 py-3 text-base font-medium text-foreground hover:text-primary transition-smooth rounded-md hover:bg-accent"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      className="px-4 py-3 text-base font-medium text-foreground hover:text-primary transition-smooth rounded-md hover:bg-accent"
                    >
                      {link.name}
                    </a>
                  )
                )}
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-secondary/20 mt-4">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{userName}</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-4 border-t border-border/40 pt-4">
                    <Button variant="ghost" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-primary hover:bg-primary-glow shadow-glow"
                    >
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
