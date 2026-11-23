import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Manrope, Newsreader, Space_Grotesk } from "next/font/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} · Estudio contable`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#4632D9",
};

const phone = siteConfig.whatsappNumber.replace(/\D/g, "");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  "@id": `${siteConfig.url}#organization`,
  name: siteConfig.legalName,
  legalName: siteConfig.legalName,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: siteConfig.logo,
  image: siteConfig.socialImage,
  inLanguage: siteConfig.language,
  areaServed: [
    {
      "@type": "City",
      name: siteConfig.city,
    },
    {
      "@type": "Country",
      name: siteConfig.country,
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: siteConfig.city,
    addressCountry: "AR",
  },
  knowsAbout: services.map((service) => service.name),
  ...(phone
    ? {
        telephone: `+${phone}`,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: `+${phone}`,
          availableLanguage: ["es"],
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.language}
      className={`${manrope.variable} ${spaceGrotesk.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
