import { commonTranslations } from "./common";
import { authTranslations } from "./auth";
import { navTranslations } from "./nav";
import { adminTranslations } from "./admin";
import { settingsTranslations } from "./settings";
import { userTranslations } from "./user";

export const translations: { [key: string]: { ar: string; en: string } } = {
  ...commonTranslations,
  ...authTranslations,
  ...navTranslations,
  ...adminTranslations,
  ...settingsTranslations,
  ...userTranslations,
};
