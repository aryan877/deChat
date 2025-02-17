import "./globals.css";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { NotificationContainer } from "@/components/notifications/NotificationContainer";
import { PrivyProvider } from "./providers/PrivyProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./providers/AuthProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
export const metadata = {
  title: "DeChat",
  description:
    "An AI-powered blockchain agent that can interact with the Sonic blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          defer
          data-domain="brainpower.sh"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body className={`${montserrat.variable} ${jakarta.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ReactQueryProvider>
              <PrivyProvider>
                <AuthProvider>{children}</AuthProvider>
              </PrivyProvider>
            </ReactQueryProvider>
          </TooltipProvider>
          <NotificationContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
