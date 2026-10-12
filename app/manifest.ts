import type { MetadataRoute } from "next"

/**
 * Manifeste de la web app : permet d'installer Laza sur l'écran d'accueil
 * d'un téléphone, avec le poing de la marque comme icône.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Laza — Dénoncer la corruption à Madagascar",
    short_name: "Laza",
    description:
      "Signalement anonyme de corruption à Madagascar. Raconte les faits, joins une preuve, personne ne saura que c'est toi.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#006575",
    icons: [
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
