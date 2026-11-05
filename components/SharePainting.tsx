"use client";
import { useState, type RefObject } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SharePainting({canvasRef,disabled}:{canvasRef:RefObject<HTMLCanvasElement|null>,disabled:boolean}){
 const uploadUrl=useMutation(api.paintings.uploadUrl);
 const publish=useMutation(api.paintings.publish);
 const [open,setOpen]=useState(false),[title,setTitle]=useState(""),[artist,setArtist]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(busy||!canvasRef.current)return;
  setBusy(true);setError("");
  try{
   const source=canvasRef.current;
   const preview=document.createElement("canvas");
   const ratio=Math.min(1,1000/source.width);
   preview.width=Math.round(source.width*ratio);preview.height=Math.round(source.height*ratio);
   const ctx=preview.getContext("2d");if(!ctx)throw new Error("Cannot export painting");
   ctx.fillStyle="#fbf9f5";ctx.fillRect(0,0,preview.width,preview.height);ctx.drawImage(source,0,0,preview.width,preview.height);
   const blob=await new Promise<Blob>((resolve,reject)=>preview.toBlob(b=>b?resolve(b):reject(new Error("Cannot export painting")),"image/webp",.8));
   if(blob.size>1_000_000)throw new Error("Painting is too large. Please try again.");
   const url=await uploadUrl();
   const response=await fetch(url,{method:"POST",headers:{"Content-Type":"image/webp"},body:blob});
   if(!response.ok)throw new Error("Upload failed");
   const {storageId}=await response.json();
   await publish({title:title.trim(),artist:artist.trim()||undefined,storageId});
   setDone(true);
  }catch(err){setError(err instanceof Error?err.message:"Something went wrong. Please try again.")}finally{setBusy(false)}
 };
 return <>
 <button disabled={disabled} onClick={()=>{setOpen(true);setDone(false)}}>share to gallery ↗</button>
 {open&&<div className="paint-share-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><div className="paint-share-dialog" role="dialog" aria-modal="true" aria-labelledby="paint-share-title">
 <button className="paint-share-close" onClick={()=>setOpen(false)} aria-label="Close">×</button>
 {done?<><span className="paint-eyebrow">Published</span><h2 id="paint-share-title">Your painting is in the gallery.</h2><p>Thank you for sharing a little piece of your imagination.</p><a href="/gallery">Explore the gallery →</a></>:
 <form onSubmit={submit}><span className="paint-eyebrow">For everyone to see</span><h2 id="paint-share-title">Share your painting.</h2><p>Your work will appear publicly right away. Please only share artwork you're comfortable making public.</p>
 <label>Title <input required maxLength={80} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Untitled, perhaps?" /></label>
 <label>Artist name <span>(optional)</span><input maxLength={60} value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Anonymous is fine" /></label>
 {error&&<p role="alert" className="paint-share-error">{error}</p>}
 <button type="submit" disabled={busy||!title.trim()}>{busy?"Publishing…":"Publish painting →"}</button>
 </form>}
 </div></div>}
 </>;
}
