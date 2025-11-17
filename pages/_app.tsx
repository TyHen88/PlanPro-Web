import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "@/components/ui/layout/RootLayout";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Providers } from "@/components/shared/providers";
import RouteProgress from "@/components/shared/route-progress";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// Placeholder Header component - replace with your actual Header component
function Header() {
  return null; // Add your Header component here if needed
}

// Placeholder Analytics component - install @vercel/analytics if needed
function Analytics() {
  return null; // Add your Analytics component here if needed
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const basePathAuth = process.env.NEXT_PUBLIC_AUTH_BASE_PATH;

  if (Component.getLayout) {
    return (
      <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <Providers session={pageProps.session} basePath={basePathAuth}>
            <div className={`${GeistSans.className} font-sans antialiased`}>
              <Header />
              {Component.getLayout(<Component {...pageProps} />)}
            </div>
          </Providers>
          <RouteProgress />
          <Analytics />
        </ThemeProvider>
      </div>
    );
  }

  return (
    <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <ThemeProvider>
        <Providers session={pageProps.session} basePath={basePathAuth}>
          <div className={`${GeistSans.className} font-sans antialiased`}>
            <Header />
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </div>
        </Providers>
        <RouteProgress />
        <Analytics />
      </ThemeProvider>
    </div>
  );
}