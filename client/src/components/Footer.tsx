import { Facebook, Instagram, Youtube, Mail } from "lucide-react";

const footerLinks = {
  academy: [
    { name: "About Us", href: "#about" },
    { name: "Our Athletes", href: "#players" },
    { name: "Rankings", href: "#rankings" },
    { name: "Programs", href: "#programs" },
  ],
  resources: [
    { name: "Training Videos", href: "#" },
    { name: "Belt Requirements", href: "#rankings" },
    { name: "Events Calendar", href: "#" },
    { name: "News & Updates", href: "#" },
  ],
  contact: [
    { name: "Contact Us", href: "#contact" },
    { name: "Join Academy", href: "#contact" },
    { name: "Instructor Portal", href: "#" },
    { name: "FAQs", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Mail, href: "#", label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/40 bg-card/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.jpg')] bg-repeat"></div>
      </div>

      <div className="container relative z-10 px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <span className="font-display text-xl font-bold text-secondary-foreground">
                  PS
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Pencak Silat <span className="text-primary">Academy</span>
                </h3>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Empowering athletes through traditional Silat wisdom and modern
              sports science. Discipline. Heritage. Power.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-lg bg-accent border border-border/40 flex items-center justify-center hover:bg-secondary/10 hover:border-secondary transition-smooth"
                >
                  <social.icon className="h-5 w-5 text-muted-foreground hover:text-secondary transition-smooth" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground">Academy</h4>
            <ul className="space-y-2">
              {footerLinks.academy.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-smooth text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-smooth text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground">Support</h4>
            <ul className="space-y-2">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-smooth text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pencak Silat Academy. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-secondary transition-smooth"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-secondary transition-smooth"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
