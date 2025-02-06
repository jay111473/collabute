"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRef, useState } from "react";

export function WizardVideoPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-[580px] mx-auto flex flex-col items-start h-full justify-center">
      <p className="text-center mt-3 text-xs text-gray-400">
        Watch this intro video to learn about who we are.
      </p>
      <div className="relative w-full mt-4">
        <div className="aspect-video bg-[#141414] rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src="/intro.mp4"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-primary2/90 hover:bg-primary2 hover:scale-105 transition-all duration-200"
              >
                <Play className="h-8 w-8 text-white" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
