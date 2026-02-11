import { Menu, LogOut, User, Bell } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { LanguageToggle } from "@/shared/ui/LanguageToggle";

import { useQuery } from "@tanstack/react-query";
import { getMyNotifications } from "@/features/support/api/notificationService";

import { motion, AnimatePresence } from "framer-motion";
import { NotificationCenter } from "@/features/support/components/notifications/NotificationCenter";

const navLinks = [
  { name: "Home", href: "/", isRoute: true },
  { name: "Players", href: "#players", isRoute: false },
  { name: "Rankings", href: "/rankings", isRoute: true },
  { name: "Programs", href: "/programs", isRoute: true },
  { name: "Coaches", href: "/coaches", isRoute: true },
  { name: "Library", href: "/library", isRoute: true },
  { name: "Events", href: "/events", isRoute: true },
  { name: "About", href: "#about", isRoute: false },
  { name: "Contact", href: "#contact", isRoute: false },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);

  /* =========================
     Load user + token
  ========================= */
  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
    );

    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      setIsAuthenticated(true);
      setUser(storedUser);
      setToken(storedToken);
      setUserName(storedUser.name || "");
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setUserName("");
    }
  }, []);

  /* =========================
     Notifications
  ========================= */
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    enabled: isAuthenticated,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* =========================
     Role-based navigation
  ========================= */
  const handleNavigate = () => {
    if (!token || !user) return;

    switch (user.role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "instructor":
        navigate("/instructor-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      default:
        navigate("/");
    }
  };

  /* =========================
     Logout
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
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
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition"
                >
                  {link.name}
                </a>
              )
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />

            {isAuthenticated ? (
              <>
                {/* 🔔 Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((v) => !v)}
                    className="relative p-2 rounded-md hover:bg-accent"
                  >
                    <Bell className="h-5 w-5" />

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 rounded-md border bg-background shadow-lg z-50"
                      >
                        <NotificationCenter />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User */}
                <div
                  onClick={handleNavigate}
                  role="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-secondary/20 cursor-pointer"
                >
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
                <LanguageToggle />

                {navLinks.map((link) =>
                  link.isRoute ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="px-4 py-3 text-base font-medium hover:bg-accent rounded-md"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      className="px-4 py-3 text-base font-medium hover:bg-accent rounded-md"
                    >
                      {link.name}
                    </a>
                  )
                )}

                {isAuthenticated && (
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
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
