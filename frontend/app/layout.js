import Script from "next/script";
import "./globals.css";


export const metadata = {
  title: "AI Chatting Bot",
  description: "AI Chatting Bot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"/>
        <Script src="/main.js"/>
      </body>
    </html>
  );
}
