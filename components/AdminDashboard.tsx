"use client";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";

export default function AdminDashboard() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const status = useQuery(api.admin.status, isAuthenticated ? {} : "skip");
  const paintings = useQuery(api.paintings.list, status?.authorized ? {} : "skip");
  const remove = useMutation(api.admin.remove);
  if (isLoading) return <main className="paint-admin"><p>Checking your session…</p></main>;
  if (!isAuthenticated) return <main className="paint-admin"><span className="paint-eyebrow">Private studio</span><h1>Gallery administration.</h1><p>Sign in with the authorized GitHub account to manage published artwork.</p><button onClick={()=>void signIn("github")}>Sign in with GitHub →</button></main>;
  if (status === undefined) return <main className="paint-admin"><p>Verifying permissions…</p></main>;
  if (!status.authorized) return <main className="paint-admin"><h1>Access restricted.</h1><p>This GitHub account is not authorized to moderate Paint.</p><button onClick={()=>void signOut()}>Sign out</button></main>;
  return <main className="paint-admin"><span className="paint-eyebrow">Private studio</span><h1>Gallery administration.</h1><div className="paint-admin-top"><p>{paintings?.length ?? "…"} recent paintings</p><button onClick={()=>void signOut()}>Sign out</button></div><div className="paint-admin-grid">{paintings?.map(p=><article key={p._id}><div className="paint-gallery-image">{p.imageUrl&&<img src={p.imageUrl} alt={p.title}/>}</div><h2>{p.title}</h2><p>{p.artist||"Anonymous"}</p><button onClick={async()=>{if(window.confirm("Permanently remove this painting from the public gallery?"))await remove({id:p._id})}}>Remove painting</button></article>)}</div></main>;
}
