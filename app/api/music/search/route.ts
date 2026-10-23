import { NextResponse } from "next/server";

export interface YouTubeTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

// Curated slow focus & lofi typing presets
const CURATED_TRACKS: YouTubeTrack[] = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    channel: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=80",
    duration: "24/7 Live",
  },
  {
    id: "4xDzrJKXOOY",
    title: "Synthwave Radio - Chill Chillwave Beats",
    channel: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80",
    duration: "24/7 Live",
  },
  {
    id: "5qap5aO4i9A",
    title: "Lofi Hip Hop - Beats to Sleep/Chill to",
    channel: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    duration: "24/7 Live",
  },
  {
    id: "DWcJFNfaw9c",
    title: "Peaceful Piano Music - Relaxing Music for Studying",
    channel: "Soothing Relaxation",
    thumbnail: "https://images.unsplash.com/photo-1520523839898-50712140dc88?w=300&auto=format&fit=crop&q=80",
    duration: "3:00:00",
  },
  {
    id: "WPni755-Krg",
    title: "Ambient Space Music for Deep Focus & Concentration",
    channel: "Space Ambient",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80",
    duration: "2:30:00",
  },
  {
    id: "lTRiuFIWV54",
    title: "1 A.M. Study Session - [lofi hip hop/chill beats]",
    channel: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    duration: "1:01:42",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ tracks: CURATED_TRACKS });
  }

  // 1. Check if user configured an official YouTube Data API key
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  if (youtubeApiKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&q=${encodeURIComponent(
          query
        )}&key=${youtubeApiKey}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        const tracks: YouTubeTrack[] = (data.items || []).map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
        }));
        if (tracks.length > 0) {
          return NextResponse.json({ tracks });
        }
      }
    } catch (e) {
      console.warn("YouTube API search failed, attempting fallback parser:", e);
    }
  }

  // 2. Direct YouTube HTML search parser (Zero-API Key fallback)
  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        const contents =
          parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents
            ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

        if (Array.isArray(contents)) {
          const results: YouTubeTrack[] = [];
          for (const item of contents) {
            const v = item.videoRenderer;
            if (v && v.videoId && v.title?.runs?.[0]?.text) {
              results.push({
                id: v.videoId,
                title: v.title.runs[0].text,
                channel: v.ownerText?.runs?.[0]?.text || "YouTube Music",
                thumbnail:
                  v.thumbnail?.thumbnails?.[0]?.url ||
                  `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
                duration: v.lengthText?.simpleText || "Music",
              });
            }
            if (results.length >= 8) break;
          }

          if (results.length > 0) {
            return NextResponse.json({ tracks: results });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Direct search parsing failed:", err);
  }

  // 3. Fallback to matching curated tracks or dynamic search
  const filtered = CURATED_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.channel.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({
    tracks: filtered.length > 0 ? filtered : CURATED_TRACKS,
  });
}
