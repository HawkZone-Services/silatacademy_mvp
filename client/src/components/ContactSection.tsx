import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Location",
    value: "Jakarta, Indonesia",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+62 812-3456-7890",
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@pencaksilatacademy.com",
  },
  {
    icon: Clock,
    title: "Training Hours",
    value: "Mon-Sat: 6AM - 9PM",
  },
];

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.jpg')] bg-repeat"></div>
      </div>

      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info Side */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
                <span className="text-sm font-medium text-secondary">
                  Get in Touch
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Begin Your <span className="text-secondary">Journey</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join our community of warriors and start your transformation
                today. Fill out the form to schedule your first training
                session.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info) => (
                <Card
                  key={info.title}
                  className="gradient-card shadow-card border-border/40 p-4 hover:shadow-gold transition-smooth"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center border border-secondary/20">
                      <info.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {info.title}
                      </p>
                      <p className="font-semibold">{info.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <Card className="gradient-card shadow-card border-border/40 p-8 animate-slide-up">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Ahmad Rizki"
                    className="bg-background border-border/40 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="age">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="18"
                    className="bg-background border-border/40 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="bg-background border-border/40 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+62 812-3456-7890"
                  className="bg-background border-border/40 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="experience">
                  Experience Level
                </label>
                <Input
                  id="experience"
                  placeholder="Beginner / Intermediate / Advanced"
                  className="bg-background border-border/40 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your goals and why you want to join..."
                  className="bg-background border-border/40 min-h-[120px] resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-glow shadow-glow h-12 text-base font-semibold"
              >
                Submit Registration
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
