"use client"
import { useTheme } from "next-themes";

export default function BackgroundImage() {
    const { theme } = useTheme();

    const bgSrc =
        theme === "dark" ? "/bg/darkBg.jpg" : "/bg/lightBg.png";

    return (
        <img
            className="w-screen h-screen fixed -z-10 object-cover"
            src={bgSrc}
            alt="Background"
        />
    );
}