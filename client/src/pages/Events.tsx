import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  BookOpen,
  Dumbbell,
  Award,
  Sparkles,
} from "lucide-react";
import { events } from "@/data/events";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">(
    "upcoming"
  );
  const { toast } = useToast();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tournament":
        return Trophy;
      case "seminar":
        return BookOpen;
      case "training":
        return Dumbbell;
      case "testing":
        return Award;
      case "cultural":
        return Sparkles;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "border-secondary/40 text-secondary";
      case "ongoing":
        return "border-primary/40 text-primary";
      case "completed":
        return "border-muted/40 text-muted-foreground";
      default:
        return "border-border";
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Successful!",
      description:
        "You've been registered for the event. Check your email for confirmation.",
    });
    setRegisterDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <Calendar className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Upcoming Events
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold">
              Academy <span className="text-secondary">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join us for tournaments, workshops, cultural celebrations, and
              belt testing ceremonies throughout the year.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-b border-border/40">
        <div className="container px-4">
          <div className="flex justify-center gap-2">
            {(["all", "upcoming", "completed"] as const).map((tab) => (
              <Button
                key={tab}
                variant={filter === tab ? "default" : "outline"}
                onClick={() => setFilter(tab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const TypeIcon = getTypeIcon(event.type);
              return (
                <Card
                  key={event.id}
                  className="gradient-card shadow-card border-border/40 overflow-hidden hover:shadow-gold transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(event.status)}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-secondary" />
                        <span>{event.location}</span>
                      </div>
                      {event.instructor && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4 text-secondary" />
                          <span>{event.instructor}</span>
                        </div>
                      )}
                      {event.beltLevel && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{event.beltLevel}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-2 pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Registered
                        </span>
                        <span className="font-medium">
                          {event.registered}/{event.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-gold h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (event.registered / event.capacity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    {event.status === "upcoming" && (
                      <Dialog
                        open={registerDialogOpen && selectedEvent === event.id}
                        onOpenChange={(open) => {
                          setRegisterDialogOpen(open);
                          if (!open) setSelectedEvent("");
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="w-full mt-4"
                            onClick={() => setSelectedEvent(event.id)}
                            disabled={event.registered >= event.capacity}
                          >
                            {event.registered >= event.capacity
                              ? "Event Full"
                              : "Register Now"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Register for Event</DialogTitle>
                            <DialogDescription>
                              {event.title} -{" "}
                              {new Date(event.date).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter your full name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1234567890"
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Confirm Registration
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
