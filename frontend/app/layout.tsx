"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.ALCHEMY_API_KEY, // or infuraId
    walletConnectProjectId: "709b868768299cf075eb120164a46225",

    // configured chain
    chains: [sepolia],

    // Required
    appName: "Betting DApp",

    // Optional
    appDescription:
      "The LICK Betting Platform allows $LICK holders to use their tokens to place bets on future price movements.",
    appUrl: "https://play.petlfg.com", // your app's url
    appIcon:
      "http://petlfg.com/wp-content/uploads/2023/05/cropped-cropped-petlfg_logo_official_round_@256-1.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <title>PetLFG Apps</title>
      <meta
        name="description"
        content="The LICK Betting Platform allows $LICK holders to use their tokens to place bets on future price movements."
        key="desc"
      />

      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:creator" content="PetLFG" key="twhandle" />

      <meta property="og:title" content="LICK Betting Platform" key="ogtitle" />
      <meta property="og:site_name" content="PetLFG Apps" key="ogsitename" />
      <meta
        property="og:description"
        content="The LICK Betting Platform allows $LICK holders to use their tokens to place bets on future price movements."
        key="ogdesc"
      />
      <meta property="og:url" content="https://play.petlfg.com" key="ogurl" />
      <meta
        property="og:image"
        content="http://petlfg.com/wp-content/uploads/2023/08/petlfg_betting_wide.png"
        key="ogimage"
      />
      <meta
        property="og:image:url"
        content="http://petlfg.com/wp-content/uploads/2023/08/petlfg_betting_wide.png"
      />
      <meta property="og:image:type" content="image/png" />
      <WagmiConfig config={config}>
        <ConnectKitProvider mode="dark">
          <body>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "105vh",
                backgroundImage: "url(petlfg_betting_bg_2.jpg)",
                backgroundSize: "cover",
                backgroundPositionX: "center",
              }}
            >
              <Navbar />
              <div style={{ flexGrow: 1 }}>{children}</div>
              <Footer />
            </div>
          </body>
        </ConnectKitProvider>
      </WagmiConfig>
    </html>
  );
}
