import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardCheck,
  Library,
  Bell,
  Search,
  Edit,
  Check,
  X,
} from "lucide-react";
import { players } from "@/data/players";
import { useToast } from "@/hooks/use-toast";

// Mock registration data
const mockRegistrations = [
  {
    id: "REG001",
    playerId: "S001",
    playerName: "Ahmad Rashid",
    belt: "Green Belt",
    location: "Kuala Lumpur Main Dojo",
    status: "Pending",
    date: "2025-01-15",
  },
  {
    id: "REG002",
    playerId: "S002",
    playerName: "Nurul Aisyah",
    belt: "Blue Belt",
    location: "Penang Training Center",
    status: "Approved",
    date: "2025-01-14",
  },
  {
    id: "REG003",
    playerId: "S003",
    playerName: "Hassan Ibrahim",
    belt: "Yellow Belt",
    location: "Johor Branch",
    status: "Pending",
    date: "2025-01-16",
  },
];

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState(mockRegistrations);
  const { toast } = useToast();

  const handleApprove = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === regId ? { ...reg, status: "Approved" } : reg
      )
    );
    toast({
      title: "✅ Registration Approved",
      description: "Player has been marked as eligible for testing.",
    });
  };

  const handleReject = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === regId ? { ...reg, status: "Rejected" } : reg
      )
    );
    toast({
      title: "❌ Registration Rejected",
      description: "Player has been notified of the decision.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-secondary/20">
              <Users className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Admin Access
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              Admin <span className="text-secondary">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage players, testing registrations, and library resources
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container px-4">
          <Tabs defaultValue="players" className="space-y-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-2 lg:grid-cols-4 h-auto bg-accent/30">
              <TabsTrigger
                value="players"
                className="flex items-center gap-2 py-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Players</span>
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="flex items-center gap-2 py-3"
              >
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Testing</span>
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="flex items-center gap-2 py-3"
              >
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 py-3"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Player Management */}
            <TabsContent value="players" className="space-y-6">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold">
                      Player Management
                    </h2>
                    <Button>Add New Player</Button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or National ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="space-y-2">
                    {players
                      .filter(
                        (p) =>
                          p.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((player) => (
                        <Card key={player.id} className="p-4 border-border/40">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {player.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Belt
                                </p>
                                <p className="text-sm font-medium">
                                  {player.belt}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Contact
                                </p>
                                <p className="text-sm font-medium">
                                  {player.phone}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Testing Management */}
            <TabsContent value="testing" className="space-y-6">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold">
                    Test Registrations
                  </h2>

                  <div className="space-y-2">
                    {registrations.map((reg) => (
                      <Card key={reg.id} className="p-4 border-border/40">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="font-medium">{reg.playerName}</p>
                              <Badge className={getStatusColor(reg.status)}>
                                {reg.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">ID:</span>{" "}
                                {reg.playerId}
                              </div>
                              <div>
                                <span className="font-medium">Belt:</span>{" "}
                                {reg.belt}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>{" "}
                                {reg.location}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>{" "}
                                {reg.date}
                              </div>
                            </div>
                          </div>

                          {reg.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/40 hover:bg-green-500/10"
                                onClick={() => handleApprove(reg.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/40 hover:bg-red-500/10"
                                onClick={() => handleReject(reg.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Library Manager */}
            <TabsContent value="library" className="space-y-6">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold">
                      Library Resources
                    </h2>
                    <Button>Upload Resource</Button>
                  </div>

                  <p className="text-muted-foreground">
                    Manage training manuals, videos, articles, and testing
                    guidelines. Upload new resources and organize them by
                    category.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    <Card className="p-4 border-border/40 text-center">
                      <p className="text-3xl font-bold text-secondary">24</p>
                      <p className="text-sm text-muted-foreground">
                        Training Manuals
                      </p>
                    </Card>
                    <Card className="p-4 border-border/40 text-center">
                      <p className="text-3xl font-bold text-secondary">18</p>
                      <p className="text-sm text-muted-foreground">
                        Video Tutorials
                      </p>
                    </Card>
                    <Card className="p-4 border-border/40 text-center">
                      <p className="text-3xl font-bold text-secondary">12</p>
                      <p className="text-sm text-muted-foreground">
                        Philosophy Articles
                      </p>
                    </Card>
                    <Card className="p-4 border-border/40 text-center">
                      <p className="text-3xl font-bold text-secondary">8</p>
                      <p className="text-sm text-muted-foreground">
                        Testing Guides
                      </p>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="gradient-card shadow-card border-border/40 p-6">
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold">
                    Send Notifications
                  </h2>

                  <div className="space-y-4 max-w-2xl">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Recipient Group
                      </label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3">
                        <option>All Players</option>
                        <option>Belt Level - White Belt</option>
                        <option>Belt Level - Yellow Belt</option>
                        <option>Belt Level - Green Belt</option>
                        <option>Belt Level - Blue Belt</option>
                        <option>Belt Level - Brown Belt</option>
                        <option>Belt Level - Black Belt</option>
                        <option>Eligible for Testing</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="e.g., Testing Date Announcement" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="Enter your message here..."
                      />
                    </div>

                    <Button className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notification
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
