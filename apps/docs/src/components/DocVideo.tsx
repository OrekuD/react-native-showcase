'use client';

import { Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';

type DocVideoProps = {
  label: string;
  src: string;
};

export function DocVideo({ label, src }: DocVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  };

  return (
    <div className="showcase-doc-video">
      <video
        ref={videoRef}
        aria-label={label}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        src={src}
        onClick={togglePlayback}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className="showcase-doc-video-toggle"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        aria-pressed={isPlaying}
        onClick={(event) => {
          event.stopPropagation();
          togglePlayback();
        }}
      >
        {isPlaying ? <Pause aria-hidden size={16} /> : <Play aria-hidden size={16} />}
      </button>
    </div>
  );
}
