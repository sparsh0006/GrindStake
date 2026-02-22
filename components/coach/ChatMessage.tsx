import { cn } from "@/lib/utils";
import { Dumbbell, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser ? "bg-zinc-700" : "bg-green-500/20"
        )}
      >
        {isUser ? (
          <User size={14} className="text-zinc-300" />
        ) : (
          <Dumbbell size={14} className="text-green-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-zinc-700 text-white rounded-tr-sm"
            : "bg-zinc-800 text-zinc-200 rounded-tl-sm"
        )}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-green-400 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}
