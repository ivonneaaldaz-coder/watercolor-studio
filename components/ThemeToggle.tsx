"use client";
import {useEffect,useState} from "react";
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem("paint-theme");const next=saved?saved==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;setDark(next);document.documentElement.dataset.theme=next?"dark":"light"},[]);
 const toggle=()=>{const next=!dark;setDark(next);document.documentElement.dataset.theme=next?"dark":"light";localStorage.setItem("paint-theme",next?"dark":"light")};
 return <button className="paint-theme-toggle" type="button" onClick={toggle} aria-label={dark?"Switch to light mode":"Switch to dark mode"} title={dark?"Light mode":"Dark mode"}>{dark?"☼":"☾"}</button>
}
