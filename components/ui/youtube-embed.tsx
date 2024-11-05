const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch (e) {
    console.error('Invalid YouTube URL:', e);
  }
  return null;
};

interface YouTubeEmbedProps {
  url: string;
}

export const YouTubeEmbed = ({ url }: YouTubeEmbedProps) => {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) return null;

  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}; 