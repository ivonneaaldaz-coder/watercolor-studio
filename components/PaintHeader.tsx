import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
export default function PaintHeader(){return <header className="paint-site-header"><Link href="/" className="paint-wordmark">paint<span className="paint-dot">.</span></Link><div className="paint-header-right"><nav className="paint-nav" aria-label="Main navigation"><Link href="/">Paint</Link><Link href="/gallery">Gallery</Link></nav><span className="paint-header-label">an interactive watercolor studio</span><ThemeToggle/></div></header>}
