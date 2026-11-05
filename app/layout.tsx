import "./globals.css";
import PaintHeader from "../components/PaintHeader";
import ConvexClientProvider from "./ConvexClientProvider";
export const metadata={title:"Paint — Ivonne Aldaz",description:"An interactive watercolor playground."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ConvexClientProvider><PaintHeader/>{children}</ConvexClientProvider></body></html>}
