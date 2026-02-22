"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
    words: string;
    className?: string;
    highlightWords?: string[];
    highlightClass?: string;
}

export function TextGenerateEffect({
    words,
    className,
    highlightWords = [],
    highlightClass = "text-[#00FF87]",
}: TextGenerateEffectProps) {
    const wordArray = words.split(" ");

    return (
        <motion.div
            className={cn("inline", className)}
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } },
            }}
        >
            {wordArray.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    className={cn(
                        "inline-block mr-[0.3em]",
                        highlightWords.includes(word) && highlightClass
                    )}
                    variants={{
                        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
                        visible: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: { duration: 0.4, ease: "easeOut" },
                        },
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
