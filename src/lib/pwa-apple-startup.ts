import appleSplashSpec from "./apple-splash-spec.json";

export const appleStartupImages = appleSplashSpec.map((entry) => ({
  url: `/splash/${entry.filename}`,
  media: entry.media,
}));
