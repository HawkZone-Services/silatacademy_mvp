import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import heroSilat from "@/assets/hero-silat.jpg";
import { Globe, Users, Swords, Map } from "lucide-react";

const SilatHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroSilat})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Silat – The Art of Inner and Outer Harmony
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Silat is an ancient martial art from Southeast Asia that focuses on
            self-defense, discipline, respect, and the harmony between body,
            mind, and soul. Discover a tradition that has shaped warriors and
            philosophers for centuries.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-20 container mx-auto px-4">
        <div className="space-y-24 max-w-6xl mx-auto">
          {/* Section 1: Origin */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    The Origin of Silat
                  </h2>
                  <p className="text-lg text-muted-foreground">نشأة السيلات</p>
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-4">
                  Silat began in the Malay Archipelago, encompassing Indonesia,
                  Malaysia, and Brunei. Its historical and cultural roots trace
                  back centuries, evolving from the need for self-defense in
                  dense jungles and coastal communities.
                </p>
                <p className="leading-relaxed">
                  More than just a combat system, Silat developed as a
                  comprehensive way of life. It emphasizes moral values, inner
                  peace, and the harmonious development of the warrior's spirit.
                  Traditional masters taught that true strength comes from
                  balance between physical prowess and spiritual wisdom.
                </p>
              </div>
            </div>
            <Card className="border-primary/20 shadow-glow">
              <CardContent className="p-8">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <Map className="w-24 h-24 text-primary/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Countries */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="border-primary/20 shadow-glow order-2 md:order-1">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Malaysia",
                    "Indonesia",
                    "Brunei",
                    "Singapore",
                    "Philippines",
                    "Thailand",
                    "Egypt",
                    "Global",
                  ].map((country) => (
                    <div
                      key={country}
                      className="p-4 rounded-lg bg-accent/10 text-center font-semibold text-foreground"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Countries Practicing Silat
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    الدول المشاركة في السيلات
                  </p>
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-4">
                  Silat is actively practiced and officially recognized in
                  numerous countries, with Malaysia, Indonesia, and Brunei being
                  the primary custodians of this ancient art. Singapore, the
                  Philippines, and Thailand have also embraced Silat as part of
                  their martial arts heritage.
                </p>
                <p className="leading-relaxed">
                  Remarkably, Silat has found a home in Egypt and other Middle
                  Eastern nations, where international federations and
                  competitions unite practitioners from around the world in
                  celebrating this rich tradition.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Global Spread */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Global Spread of Silat
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    انتشار السيلات
                  </p>
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-4">
                  From its origins in Southeast Asia, Silat has expanded across
                  continents. The establishment of global federations has
                  standardized training and competition, allowing practitioners
                  worldwide to connect and share knowledge.
                </p>
                <p className="leading-relaxed">
                  International tournaments now showcase Silat's beauty and
                  effectiveness, with academies teaching this art in Europe, the
                  Middle East, and Africa. The growing community ensures that
                  Silat's traditions and values continue to inspire new
                  generations of martial artists.
                </p>
              </div>
            </div>
            <Card className="border-primary/20 shadow-glow">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">🌍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Europe</h4>
                      <p className="text-sm text-muted-foreground">
                        Growing academies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">🌏</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Middle East
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Active federations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">🌍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Africa</h4>
                      <p className="text-sm text-muted-foreground">
                        Emerging presence
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Techniques */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="border-primary/20 shadow-glow order-2 md:order-1">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {[
                    {
                      name: "Silat Seni Gayong",
                      desc: "Traditional Malaysian style",
                    },
                    { name: "Cimande", desc: "Powerful striking techniques" },
                    { name: "Harimau", desc: "Tiger-style ground fighting" },
                    {
                      name: "Setia Hati",
                      desc: "Indonesian spiritual approach",
                    },
                  ].map((style) => (
                    <div
                      key={style.name}
                      className="p-4 bg-accent/10 rounded-lg"
                    >
                      <h4 className="font-bold text-foreground mb-1">
                        {style.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {style.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Silat Techniques and Styles
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    الأساليب المنفذة داخلها
                  </p>
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-4">
                  Silat encompasses diverse combat systems including striking,
                  locking, throwing, and weapon techniques. Each style offers
                  unique approaches to self-defense and spiritual development.
                </p>
                <p className="leading-relaxed">
                  Traditional styles like Silat Seni Gayong emphasize fluidity
                  and grace, while Cimande focuses on powerful strikes. Harimau
                  mimics the tiger's movements for ground combat, and Setia Hati
                  integrates deep spiritual principles into every technique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Begin Your Journey
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the strength, discipline, and philosophy of Silat — join
            our academy today and become part of a centuries-old tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="text-lg px-8"
            >
              Join Our Academy
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/programs")}
              className="text-lg px-8"
            >
              View Programs
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SilatHistory;
