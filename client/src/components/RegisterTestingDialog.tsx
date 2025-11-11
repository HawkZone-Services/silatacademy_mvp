import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Upload, LogIn } from "lucide-react";
import { players } from "@/data/players";

interface RegisterTestingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterTestingDialog = ({
  open,
  onOpenChange,
}: RegisterTestingDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState<
    "login" | "id" | "form" | "success" | "notfound"
  >("login");
  const [nationalId, setNationalId] = useState("");
  const [foundPlayer, setFoundPlayer] = useState<any>(null);
  const [formData, setFormData] = useState({
    contactNumber: "",
    email: "",
    testLocation: "",
    file: null as File | null,
  });

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const userEmail = localStorage.getItem("userEmail") || "";

    setIsAuthenticated(authStatus);

    if (authStatus) {
      setStep("id");
      setFormData((prev) => ({ ...prev, email: userEmail }));
    } else {
      setStep("login");
    }
  }, [open]);

  const handleIdCheck = () => {
    // Mock ID verification - checking against player IDs
    const player = players.find((p) => p.id === nationalId);

    if (player) {
      setFoundPlayer(player);
      setFormData((prev) => ({
        ...prev,
        email: player.email,
        contactNumber: player.phone,
      }));
      setStep("form");
    } else {
      setStep("notfound");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock submission
    toast({
      title: "✅ Registration Successful",
      description:
        "Your registration for the next testing has been received successfully.",
    });

    setStep("success");
    setTimeout(() => {
      onOpenChange(false);
      resetForm();
    }, 2500);
  };

  const resetForm = () => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const userEmail = localStorage.getItem("userEmail") || "";

    setStep(authStatus ? "id" : "login");
    setNationalId("");
    setFoundPlayer(null);
    setFormData({
      contactNumber: "",
      email: authStatus ? userEmail : "",
      testLocation: "",
      file: null,
    });
  };

  const handleLoginRedirect = () => {
    onOpenChange(false);
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    onOpenChange(false);
    navigate("/signup");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-background border-border/40">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Register for Next Testing
          </DialogTitle>
          <DialogDescription>
            {step === "login"
              ? "Please sign in to continue with registration"
              : "Complete the form to register for the upcoming belt testing"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 0: Login Required */}
        {step === "login" && (
          <div className="space-y-6 py-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center border-2 border-secondary/20">
                <LogIn className="h-10 w-10 text-secondary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Authentication Required
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Please sign in to your account or create a new account to
                  register for testing. This helps us automatically fill your
                  details and track your registration.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleLoginRedirect} size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  onClick={handleSignupRedirect}
                  variant="outline"
                  size="lg"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: National ID Entry */}
        {step === "id" && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                placeholder="Enter your National ID"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                We'll verify your identity against our player database
              </p>
            </div>
            <Button
              onClick={handleIdCheck}
              className="w-full"
              disabled={!nationalId.trim()}
            >
              Verify Identity
            </Button>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === "form" && foundPlayer && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Auto-populated fields */}
            <div className="rounded-lg bg-accent/20 p-4 space-y-2 border border-secondary/20">
              <p className="text-sm font-medium text-secondary">
                Verified Player Information
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{foundPlayer.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Belt:</span>
                  <p className="font-medium">{foundPlayer.belt}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <p className="font-medium">{foundPlayer.age}</p>
                </div>
              </div>
            </div>

            {/* Additional fields */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+60 12-345 6789"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactNumber: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testLocation">Preferred Test Location</Label>
              <Select
                value={formData.testLocation}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, testLocation: value }))
                }
                required
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="kuala-lumpur">
                    Kuala Lumpur Main Dojo
                  </SelectItem>
                  <SelectItem value="penang">Penang Training Center</SelectItem>
                  <SelectItem value="johor">Johor Branch</SelectItem>
                  <SelectItem value="sabah">Sabah Academy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                Training Report / Medical Clearance (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {formData.file ? formData.file.name : "Upload Document"}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              Submit Registration
            </Button>
          </form>
        )}

        {/* Step 3: Not Found */}
        {step === "notfound" && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                National ID Not Found
              </h3>
              <p className="text-sm text-muted-foreground">
                ⚠️ National ID not found in our records. <br />
                Please contact your coach or academy administrator.
              </p>
            </div>
            <Button onClick={() => setStep("id")} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Registration Successful!
              </h3>
              <p className="text-sm text-muted-foreground">
                ✅ Thank you! Your registration for the next testing has been
                received successfully.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
