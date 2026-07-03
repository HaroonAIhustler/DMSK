import type { Metadata } from "next";
import Script from "next/script";
import { GHLPageTracker } from "@/components/GHLPageTracker";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lp.aigrowthstudio.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI Digital Marketing Career Fit Quiz | AI Growth Studio",
  description: "Find your AI digital marketing fit score, city salary range, and best next step.",
  alternates: {
    canonical: "/survey"
  },
  openGraph: {
    title: "AI Digital Marketing Career Fit Quiz | AI Growth Studio",
    description: "Find your AI digital marketing fit score, city salary range, and best next step.",
    url: "/survey",
    siteName: "AI Growth Studio",
    images: [
      {
        url: "/assets/results-career-fit-hero-v3.webp",
        width: 1200,
        height: 630,
        alt: "AI Growth Studio career fit quiz"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Digital Marketing Career Fit Quiz | AI Growth Studio",
    description: "Find your AI digital marketing fit score, city salary range, and best next step.",
    images: ["/assets/results-career-fit-hero-v3.webp"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-55H2MPM8');`}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-55H2MPM8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script id="ghl-tracking" strategy="afterInteractive">
          {`(function(){var s=document.createElement('script');s.src='https://link.desinelabs.com/js/external-tracking.js';s.setAttribute('data-tracking-id','tk_20528733b6e7433cbc38044d10dda053');s.async=true;document.head.appendChild(s);})();`}
        </Script>
        <GHLPageTracker />
        {children}
      </body>
    </html>
  );
}
