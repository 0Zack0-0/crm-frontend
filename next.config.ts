import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de /public son locales: no necesitan dominios externos.
    // unoptimized solo si se despliega en modo static export; quitarlo en Vercel.
    localPatterns: [
      { pathname: "/**", search: "" },
    ],
  },
};

export default nextConfig;
