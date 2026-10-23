"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  Music,
  ChevronDown,
  ChevronUp,
  Radio,
  Sparkles,
  Loader2,
  ExternalLink,
  Disc3,
  Sliders,
} from "lucide-react";

interface YouTubeTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<YouTubeTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // 1. Load initial slow typing tracks
  useEffect(() => {
    async function loadInitial() {
      setIsSearching(true);
      try {
        const res = await fetch("/api/music/search");
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
          if (!currentTrack) {
            setCurrentTrack(data.tracks[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load initial tracks:", err);
      } finally {
        setIsSearching(false);
      }
    }
    loadInitial();
  }, []);

  // 2. Initialize YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    function initPlayer() {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player("youtube-hidden-player", {
          height: "0",
          width: "0",
          videoId: currentTrack ? currentTrack.id : "jfKfPfyJRdk",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(volume);
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
                setIsLoading(false);
                setTotalDuration(playerRef.current.getDuration() || 0);
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsLoading(false);
              } else if (event.data === 3) {
                setIsLoading(true);
              } else if (event.data === 0) {
                // Song ended -> loop or play next
                playNextTrack();
              }
            },
          },
        });
      }
    }

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  // 3. Track progress updater timer
  useEffect(() => {
    if (isPlaying) {
      timeUpdateInterval.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          setCurrentTime(Math.floor(playerRef.current.getCurrentTime() || 0));
        }
      }, 1000);
    } else if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
    };
  }, [isPlaying]);

  // Handle Play / Pause Toggle
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  // Play Specific Track
  const handleSelectTrack = (track: YouTubeTrack) => {
    setCurrentTrack(track);
    setIsLoading(true);
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(track.id);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const playNextTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handleSelectTrack(tracks[nextIndex]);
  };

  // Search YouTube Handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
      }
    } catch (err) {
      console.warn("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* Hidden container for YouTube IFrame audio element */}
      <div id="youtube-hidden-player" className="hidden pointer-events-none" />

      {/* Floating Ambient Music Dock - Offset from sidebar to prevent any UI obstruction */}
      <div className="fixed bottom-6 left-4 md:left-72 lg:left-80 z-40 transition-all duration-300">
        {!isOpen ? (
          /* Mini Floating Pill View */
          <div className="flex items-center gap-3 p-2 pr-4 rounded-full bg-zinc-950/90 text-white border border-emerald-500/30 backdrop-blur-md shadow-2xl shadow-emerald-500/10 hover:border-emerald-500/60 transition-all group">
            {/* Album Art with spinning disc when playing */}
            <div
              onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 cursor-pointer flex items-center justify-center flex-shrink-0"
            >
              {currentTrack?.thumbnail ? (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${
                    isPlaying ? "animate-spin" : ""
                  }`}
                  style={{ animationDuration: "12s" }}
                />
              ) : (
                <Disc3 className="w-5 h-5 text-emerald-400" />
              )}
              {/* Center disc spindle */}
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/50" />
            </div>

            {/* Song Meta & Animated EQ */}
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer max-w-[150px] sm:max-w-[190px]"
            >
              <div className="text-xs font-bold truncate text-zinc-100 flex items-center gap-1.5">
                <span>{currentTrack?.title || "Slow Typing Music"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 truncate">
                <span>{currentTrack?.channel || "Ambient Flow"}</span>
                {isPlaying && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-0.5 h-2.5 bg-emerald-400 animate-pulse" />
                    <span className="w-0.5 h-4 bg-emerald-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse delay-150" />
                  </span>
                )}
              </div>
            </div>

            {/* Quick Play/Pause Control */}
            <button
              type="button"
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all cursor-pointer shadow-md hover:scale-105"
              title={isPlaying ? "Pause music" : "Play music"}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Expand Drawer Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Open search and sound presets"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Expanded Full Music & Search Station */
          <div className="w-[92vw] sm:w-[440px] rounded-3xl bg-zinc-950/95 text-white border border-zinc-800 backdrop-blur-xl shadow-2xl p-5 space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span>Typing Soundtrack</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      YouTube Audio
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Background focus rhythms while you type
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Playing Hero Card */}
            {currentTrack && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-emerald-400 animate-pulse" />
                        <span className="w-1 h-5 bg-emerald-400 animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150" />
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-white">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {currentTrack.channel}
                  </p>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-2">
                    <span>{formatSeconds(currentTime)}</span>
                    {totalDuration > 0 && (
                      <span className="text-zinc-500">/ {formatSeconds(totalDuration)}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            )}

            {/* Volume & Controls Slider */}
            <div className="flex items-center gap-3 px-1 text-zinc-400">
              <button
                type="button"
                onClick={toggleMute}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] font-mono w-8 text-right">
                {isMuted ? "0%" : `${volume}%`}
              </span>
            </div>

            {/* Search Any Song on YouTube Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any song, artist, lofi or classical..."
                className="w-full pl-9 pr-16 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-medium"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
              </button>
            </form>

            {/* Quick Slow / Focus Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                "☕ Lofi Hip Hop",
                "🌧️ Peaceful Piano",
                "🌌 Ambient Space",
                "🌙 Synthwave Chill",
                "🎹 Chopin Nocturne",
              ].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setSearchQuery(genre.replace(/^[^\s]+\s/, ""));
                    fetch(
                      `/api/music/search?q=${encodeURIComponent(
                        genre.replace(/^[^\s]+\s/, "")
                      )}`
                    )
                      .then((r) => r.json())
                      .then((d) => d.tracks && setTracks(d.tracks));
                  }}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Tracks List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {tracks.map((track) => {
                const isSelected = currentTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold"
                        : "hover:bg-zinc-900 border border-transparent text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="truncate font-semibold">{track.title}</div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {track.channel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected && isPlaying ? (
                        <span className="text-[10px] text-emerald-400 font-mono">Playing</span>
                      ) : (
                        <Play className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
