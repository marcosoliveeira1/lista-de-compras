import { WebHaptics } from "web-haptics";
import { useEffect, useRef } from "react";

export function useHaptics() {
    const hapticsRef = useRef<WebHaptics | null>(null);

    useEffect(() => {
        if (!hapticsRef.current) {
            hapticsRef.current = new WebHaptics();
        }
        return () => hapticsRef.current?.destroy();
    }, []);

    const trigger = (type: "success" | "error" | "nudge" | "buzz") => {
        hapticsRef.current?.trigger(type);
    };

    return { trigger };
}