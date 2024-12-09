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
      </body>
    </html>
  );
}
