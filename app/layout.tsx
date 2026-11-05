import "./globals.css";
import PaintHeader from "../components/PaintHeader";
export const metadata={title:"Paint — Ivonne Aldaz",description:"An interactive watercolor playground."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PaintHeader/>{children}</body></html>}
