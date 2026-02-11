import { Button } from "@/shared/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === "en" ? "العربية" : "English"}
    </Button>
  );
}
