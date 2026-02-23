import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const label =
    language === "ar" ? t("language.switchToEnglish") : t("language.switchToArabic");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      title={label}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {label}
      </span>
    </Button>
  );
}
