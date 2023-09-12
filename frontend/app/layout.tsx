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
      "A simple bettting dap",
    appUrl: "https:/localhost:3000", // your app's url
    appIcon:
      "./group4.svg", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <title> Betting Dapp</title>
      <meta
        name="description"
        content="A simple betting Dapp"
        key="desc"
      />

      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:creator" content="PetLFG" key="twhandle" />

      <meta property="og:title" content="Betting Platform" key="ogtitle" />
      <meta property="og:site_name" content="Betting Dapp" key="ogsitename" />
      <meta
        property="og:description"
        content="A simple betting Dapp"
        key="ogdesc"
      />
      <meta property="og:url" content="http://localhost:3000" key="ogurl" />
      <meta
        property="og:image"
        content="/"
        key="ogimage"
      />
      <meta
        property="og:image:url"
        content="/"
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
                backgroundColor: 'papayawhip'
              }}
              //   backgroundImage: "url(petlfg_betting_bg_2.jpg)",
              //   backgroundSize: "cover",
              //   backgroundPositionX: "center",
              // }}
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
