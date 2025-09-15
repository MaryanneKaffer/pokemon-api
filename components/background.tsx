"use client"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function BackgroundImage() {
    const { theme } = useTheme();
    const [bgSrc, setBgSrc] = useState("");

    useEffect(() => (
        theme === "dark" ? setBgSrc("/bg/darkBg.jpg") : setBgSrc("/bg/lightBg.png")
    ))

    return (
        <img
            className="w-screen h-screen fixed -z-10 object-cover"
            src={bgSrc}
            alt="Background"
        />
    );
}