import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

const appConfigBuild = Platform.select({
  ios: Constants.expoConfig?.ios?.buildNumber,
  android: Constants.expoConfig?.android?.versionCode?.toString(),
});

export const APP_VERSION =
  Application.nativeApplicationVersion ??
  Constants.expoConfig?.version ??
  "Unknown";
export const APP_BUILD =
  Application.nativeBuildVersion ?? appConfigBuild ?? "Unknown";

export const APP_LINKS = {
  github: "https://github.com/MehrshadFb/SplitMate-Mobile",
  privacy: "https://split-mate-mobile-landing.vercel.app/privacy-policy",
  support: "mehrshad.farahbakhsh@gmail.com",
} as const;
