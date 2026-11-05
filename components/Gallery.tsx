"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Gallery() {
  const paintings = useQuery(api.paintings.list);
  return <main className="paint-gallery-page">
    <div className="paint-gallery-intro"><span className="paint-eyebrow">A little collection of moments</span><h1>Shared on paper.</h1><p>Watercolor studies made by visitors to Paint. Every piece began with a blank canvas.</p></div>
    {paintings === undefined ? <p>Loading the gallery…</p> : paintings.length === 0 ? <div className="paint-gallery-empty"><p>The gallery is waiting for its first painting.</p><a href="/">Make something →</a></div> :
    <div className="paint-gallery-grid">{paintings.map((painting) => <article className="paint-gallery-piece" key={painting._id}><div className="paint-gallery-image">{painting.imageUrl && <img src={painting.imageUrl} alt={painting.title} loading="lazy" />}</div><h2>{painting.title}</h2><p>{painting.artist || "Anonymous"}</p></article>)}</div>}
  </main>;
}
