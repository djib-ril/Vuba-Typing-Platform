"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Car,
  Play,
  Copy,
  Check,
  Flame,
  Zap,
  ArrowRight,
  Shield,
  Sparkles,
  Trophy,
  RefreshCw,
  AlertCircle,
  LogOut,
  Flag,
} from "lucide-react";
import { supabase, type RaceParticipant, type RaceLobby } from "@/src/lib/supabase";
import { getRandomPassage } from "@/src/lib/textGenerator";
import { soundEngine } from "@/src/lib/soundEngine";

interface RaceArenaProps {
  userId?: string;
  userName?: string;
  userAvatar?: string | null;
}

const CARS = [
  { name: "🏎️ Cyber Roadster", topSpeed: "155 WPM", color: "from-emerald-500 to-teal-600" },
  { name: "🚀 Apex Phantom", topSpeed: "160 WPM", color: "from-amber-500 to-yellow-600" },
  { name: "⚡ Neon Interceptor", topSpeed: "150 WPM", color: "from-orange-500 to-red-600" },
  { name: "🏎️ Formula Velocity", topSpeed: "170 WPM", color: "from-blue-500 to-indigo-600" },
  { name: "🛸 Quantum Speeder", topSpeed: "180 WPM", color: "from-purple-500 to-pink-600" },
];

export default function RaceArena({
  userId,
  userName = "Typist",
  userAvatar = null,
}: RaceArenaProps) {
  const effectiveUserId = userId || `guest-${Math.random().toString(36).substring(2, 9)}`;
  const effectiveUserName = userName || "Typist";

  // Lobby connection states
  const [inLobby, setInLobby] = useState(false);
  const [lobbyCode, setLobbyCode] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [activeCar, setActiveCar] = useState(CARS[0].name);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Live participants
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [lobbyStatus, setLobbyStatus] = useState<"waiting" | "countdown" | "racing" | "finished">("waiting");

  // Racing gameplay state
  const [targetText, setTargetText] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [currWordIndex, setCurrWordIndex] = useState(0);
  const [currCharInput, setCurrCharInput] = useState("");
  const [myProgress, setMyProgress] = useState(0);
  const [myWpm, setMyWpm] = useState(0);
  const [myCorrectChars, setMyCorrectChars] = useState(0);
  const [myIncorrectChars, setMyIncorrectChars] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [finishRank, setFinishRank] = useState<number | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [winner, setWinner] = useState<RaceParticipant | null>(null);

  // Keymash-style 3-second synchronized countdown
  const [countdown, setCountdown] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const channelRef = useRef<any>(null);

  // Copy lobby code helper
  const handleCopyCode = () => {
    if (!lobbyCode) return;
    navigator.clipboard.writeText(lobbyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to load participants from Supabase
  const refreshParticipants = async (code: string) => {
    const { data } = await supabase
      .from("race_participants")
      .select("*")
      .eq("lobby_code", code);
    if (data && data.length > 0) {
      setParticipants(data);
    }
  };

  // Join or Create Realtime Channel for the current lobby
  const subscribeToLobbyChannel = (code: string) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`race:${code}`, {
      config: { broadcast: { self: false } },
    });

    // 1. Listen for player progress broadcasts (sub-15ms sync)
    channel.on("broadcast", { event: "progress_update" }, ({ payload }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.user_id === payload.user_id
            ? { ...p, progress: payload.progress, wpm: payload.wpm, is_finished: payload.is_finished, finish_rank: payload.finish_rank }
            : p
        )
      );

      if (payload.is_finished && !winner) {
        setWinner({
          lobby_code: code,
          user_id: payload.user_id,
          user_name: payload.user_name,
          car_name: payload.car_name,
          progress: 100,
          wpm: payload.wpm,
          is_ready: true,
          is_finished: true,
        });
      }
    });

    // 2. Listen for synchronized race countdown
    channel.on("broadcast", { event: "start_countdown" }, ({ payload }) => {
      if (payload.target_text) {
        setTargetText(payload.target_text);
        setWords(payload.target_text.trim().split(/\s+/));
      }
      setLobbyStatus("countdown");
      setCountdown(3);
      setHasFinished(false);
      setFinishRank(null);
      setMyProgress(0);
      setMyWpm(0);
      setCurrWordIndex(0);
      setCurrCharInput("");
      setWinner(null);
    });

    // 3. Listen for player joined broadcast
    channel.on("broadcast", { event: "player_joined" }, () => {
      refreshParticipants(code);
    });

    // 4. Listen for rematch
    channel.on("broadcast", { event: "rematch" }, ({ payload }) => {
      if (payload.target_text) {
        setTargetText(payload.target_text);
        setWords(payload.target_text.trim().split(/\s+/));
      }
      setLobbyStatus("waiting");
      setCountdown(null);
      setHasFinished(false);
      setFinishRank(null);
      setMyProgress(0);
      setMyWpm(0);
      setCurrWordIndex(0);
      setCurrCharInput("");
      setWinner(null);
      refreshParticipants(code);
    });

    channel.subscribe();
    channelRef.current = channel;
  };

  // Host: Create New Lobby
  const handleCreateLobby = async () => {
    setErrorMsg(null);
    setStatusMsg("Creating lobby on Supabase...");

    const generatedCode = `VTT-${Math.floor(1000 + Math.random() * 9000)}`;
    const passage = getRandomPassage("technology", 55);

    try {
      // 1. Insert lobby record
      const { error: lobbyErr } = await supabase.from("race_lobbies").insert({
        invite_code: generatedCode,
        host_id: effectiveUserId,
        host_name: effectiveUserName,
        status: "waiting",
        target_text: passage,
      });

      if (lobbyErr) {
        console.warn("Lobby creation error:", lobbyErr.message);
      }

      // 2. Register Host in race_participants
      const { error: partErr } = await supabase.from("race_participants").upsert(
        {
          lobby_code: generatedCode,
          user_id: effectiveUserId,
          user_name: effectiveUserName,
          user_avatar: userAvatar,
          car_name: activeCar,
          progress: 0,
          wpm: 0,
          is_ready: true,
          is_finished: false,
        },
        { onConflict: "lobby_code,user_id" }
      );

      if (partErr) {
        console.warn("Participant insert error:", partErr.message);
      }

      setLobbyCode(generatedCode);
      setIsHost(true);
      setTargetText(passage);
      setWords(passage.trim().split(/\s+/));
      setInLobby(true);
      setLobbyStatus("waiting");
      setStatusMsg(null);

      // Refresh list and connect realtime channel
      await refreshParticipants(generatedCode);
      subscribeToLobbyChannel(generatedCode);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create race lobby.");
      setStatusMsg(null);
    }
  };

  // Joinee: Join Existing Lobby by Code
  const handleJoinLobby = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;

    setErrorMsg(null);
    setStatusMsg(`Connecting to lobby ${code}...`);

    try {
      // 1. Query Supabase for the lobby
      const { data: lobbyData, error: lobbyErr } = await supabase
        .from("race_lobbies")
        .select("*")
        .eq("invite_code", code)
        .single();

      if (lobbyErr || !lobbyData) {
        setErrorMsg(`Lobby "${code}" not found. Verify the code with the host.`);
        setStatusMsg(null);
        return;
      }

      // 2. Register Joinee in race_participants
      await supabase.from("race_participants").upsert(
        {
          lobby_code: code,
          user_id: effectiveUserId,
          user_name: effectiveUserName,
          user_avatar: userAvatar,
          car_name: activeCar,
          progress: 0,
          wpm: 0,
          is_ready: true,
          is_finished: false,
        },
        { onConflict: "lobby_code,user_id" }
      );

      setLobbyCode(code);
      setIsHost(false);
      setTargetText(lobbyData.target_text || getRandomPassage("technology", 55));
      setWords((lobbyData.target_text || "").trim().split(/\s+/));
      setLobbyStatus(lobbyData.status || "waiting");
      setInLobby(true);
      setStatusMsg(null);

      // Connect realtime and broadcast joining
      await refreshParticipants(code);
      subscribeToLobbyChannel(code);

      // Inform host/others in channel
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "player_joined",
          payload: { user_id: effectiveUserId, user_name: effectiveUserName },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not join lobby.");
      setStatusMsg(null);
    }
  };

  // Start synchronized countdown (Host trigger)
  const handleStartRace = async () => {
    if (!lobbyCode) return;
    const passage = targetText || getRandomPassage("technology", 55);

    // Update lobby status in Supabase
    await supabase
      .from("race_lobbies")
      .update({ status: "countdown", target_text: passage })
      .eq("invite_code", lobbyCode);

    // Broadcast countdown trigger to all players
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "start_countdown",
        payload: { target_text: passage },
      });
    }

    setLobbyStatus("countdown");
    setCountdown(3);
    setHasFinished(false);
    setFinishRank(null);
    setMyProgress(0);
    setMyWpm(0);
    setCurrWordIndex(0);
    setCurrCharInput("");
    setWinner(null);
  };

  // Synchronized 3-second countdown effect
  useEffect(() => {
    if (countdown === null) return;

    try {
      if (typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const freq = countdown === 0 ? 920 : 460;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      }
    } catch {}

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reaches 0 ("GO!") -> Unlock racing
      const timer = setTimeout(() => {
        setCountdown(null);
        setLobbyStatus("racing");
        setRaceStartTime(Date.now());
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Periodic poll fallback every 4s while in lobby to catch any missed WebSockets
  useEffect(() => {
    if (!inLobby || !lobbyCode) return;
    const interval = setInterval(() => {
      refreshParticipants(lobbyCode);
    }, 4000);
    return () => clearInterval(interval);
  }, [inLobby, lobbyCode]);

  // Handle live racing typing input
  const handleRacingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lobbyStatus !== "racing" || hasFinished) return;

    const val = e.target.value;
    const targetWord = words[currWordIndex] || "";

    if (val.endsWith(" ")) {
      const typed = val.trim();
      const isWordCorrect = typed === targetWord;

      let correct = 0;
      let incorrect = 0;
      for (let i = 0; i < targetWord.length; i++) {
        if (i < typed.length && typed[i] === targetWord[i]) correct++;
        else incorrect++;
      }
      if (isWordCorrect) correct++;

      const newCorrect = myCorrectChars + correct;
      const newIncorrect = myIncorrectChars + incorrect;
      setMyCorrectChars(newCorrect);
      setMyIncorrectChars(newIncorrect);

      soundEngine.playKeySound(true, !isWordCorrect);

      const nextIndex = currWordIndex + 1;
      setCurrWordIndex(nextIndex);
      setCurrCharInput("");

      // Calculate progress percentage
      const totalWords = words.length || 1;
      const prog = Math.min(100, Math.round((nextIndex / totalWords) * 100));
      setMyProgress(prog);

      // Calculate live WPM
      const elapsedMinutes = raceStartTime ? (Date.now() - raceStartTime) / 60000 : 0.01;
      const currentWpm = Math.max(0, Math.round(newCorrect / 5 / (elapsedMinutes || 0.01)));
      setMyWpm(currentWpm);

      // Check if player crossed finish line!
      if (nextIndex >= words.length) {
        handleFinishRace(currentWpm);
        return;
      }

      // Broadcast progress update to all other racers
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "progress_update",
          payload: {
            user_id: effectiveUserId,
            user_name: effectiveUserName,
            car_name: activeCar,
            progress: prog,
            wpm: currentWpm,
            is_finished: false,
          },
        });
      }

      // Update local participant state
      setParticipants((prev) =>
        prev.map((p) =>
          p.user_id === effectiveUserId ? { ...p, progress: prog, wpm: currentWpm } : p
        )
      );

      // Sync debounced to Supabase
      supabase
        .from("race_participants")
        .update({ progress: prog, wpm: currentWpm })
        .eq("lobby_code", lobbyCode)
        .eq("user_id", effectiveUserId)
        .then(() => {});

      return;
    }

    const isError =
      val.length > targetWord.length || val[val.length - 1] !== targetWord[val.length - 1];
    soundEngine.playKeySound(false, isError);
    setCurrCharInput(val);
  };

  // Player finishes race
  const handleFinishRace = async (finalWpm: number) => {
    setHasFinished(true);
    setMyProgress(100);

    // Determine rank
    const finishedCount = participants.filter((p) => p.is_finished).length;
    const rank = finishedCount + 1;
    setFinishRank(rank);

    if (rank === 1) {
      setWinner({
        lobby_code: lobbyCode,
        user_id: effectiveUserId,
        user_name: effectiveUserName,
        car_name: activeCar,
        progress: 100,
        wpm: finalWpm,
        is_ready: true,
        is_finished: true,
      });

      // Update lobby winner in Supabase
      await supabase
        .from("race_lobbies")
        .update({ status: "finished", winner_id: effectiveUserId })
        .eq("invite_code", lobbyCode);
    }

    // Broadcast finish
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "progress_update",
        payload: {
          user_id: effectiveUserId,
          user_name: effectiveUserName,
          car_name: activeCar,
          progress: 100,
          wpm: finalWpm,
          is_finished: true,
          finish_rank: rank,
        },
      });
    }

    // Update in Supabase
    await supabase
      .from("race_participants")
      .update({ progress: 100, wpm: finalWpm, is_finished: true, finish_rank: rank })
      .eq("lobby_code", lobbyCode)
      .eq("user_id", effectiveUserId);

    // Save test result to Supabase
    if (userId && userId !== "guest") {
      await supabase.from("test_results").insert({
        user_id: userId,
        wpm: finalWpm,
        accuracy: 99,
        test_mode: "race",
        test_duration: 60,
      });
    }
  };

  // Host: Rematch
  const handleRematch = async () => {
    const passage = getRandomPassage("technology", 55);
    setTargetText(passage);
    setWords(passage.trim().split(/\s+/));
    setLobbyStatus("waiting");
    setCountdown(null);
    setHasFinished(false);
    setFinishRank(null);
    setMyProgress(0);
    setMyWpm(0);
    setCurrWordIndex(0);
    setCurrCharInput("");
    setWinner(null);

    await supabase
      .from("race_lobbies")
      .update({ status: "waiting", target_text: passage })
      .eq("invite_code", lobbyCode);

    await supabase
      .from("race_participants")
      .update({ progress: 0, wpm: 0, is_finished: false, finish_rank: null })
      .eq("lobby_code", lobbyCode);

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "rematch",
        payload: { target_text: passage },
      });
    }

    await refreshParticipants(lobbyCode);
  };

  // Leave Lobby
  const handleLeaveLobby = async () => {
    if (lobbyCode) {
      await supabase
        .from("race_participants")
        .delete()
        .eq("lobby_code", lobbyCode)
        .eq("user_id", effectiveUserId);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setInLobby(false);
    setLobbyCode("");
    setIsHost(false);
    setLobbyStatus("waiting");
    setParticipants([]);
    setHasFinished(false);
    setWinner(null);
  };

  // Clean up channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-[#0e161c] border border-emerald-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>Multiplayer Arena & Supabase Realtime Track</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            High-Speed Multiplayer Race Track
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            Race live with friends using custom invite codes. Track your opponent's progress bar and WPM in real-time on the digital speedway.
          </p>
        </div>

        {!inLobby ? (
          <button
            type="button"
            onClick={handleCreateLobby}
            className="px-6 py-3 rounded-2xl text-xs font-black text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/25 hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create New Lobby</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLeaveLobby}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Lobby</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 animate-fadeIn">
          <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* VIEW 1: NOT IN LOBBY (Lobby Setup & Joining) */}
      {!inLobby ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Lobby Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Host a Private Race</span>
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create a custom race room with an invite code. Share the code with a friend so they can join and race against you in real-time!
            </p>

            <div>
              <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-2">
                Select Your Racing Vehicle
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CARS.map((car) => (
                  <button
                    key={car.name}
                    type="button"
                    onClick={() => setActiveCar(car.name)}
                    className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeCar === car.name
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span>{car.name}</span>
                    <span className="text-[10px] text-zinc-400">Max: {car.topSpeed}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateLobby}
              className="w-full py-3 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Create Lobby & Get Code</span>
            </button>
          </div>

          {/* Join Existing Race Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Join Friend's Race</span>
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your opponent's lobby code below to enter their racetrack lane immediately.
            </p>

            <form onSubmit={handleJoinLobby} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. VTT-8921"
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono uppercase font-bold"
                />
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Join Lobby
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Multiplayer Quick Match
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Need someone to race against right now? Create a lobby and open a new browser tab or send the code to a colleague to start racing!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: ACTIVE LOBBY & RACETRACK */
        <div className="space-y-6">
          {/* Lobby HUD Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-black">Lobby Invite Code</div>
                <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>{lobbyCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Racers in Lobby */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold">Racers Connected:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {participants.length}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isHost && lobbyStatus === "waiting" && (
                <button
                  type="button"
                  onClick={handleStartRace}
                  className="px-5 py-2 rounded-xl text-xs font-black text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>Start Race</span>
                </button>
              )}

              {lobbyStatus === "finished" && (
                <button
                  type="button"
                  onClick={handleRematch}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rematch</span>
                </button>
              )}
            </div>
          </div>

          {/* VISUAL RACETRACK LANES */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
                <Flag className="w-4 h-4" />
                <span>Active Track: 1/4 Mile Dragway</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Status: <span className="font-bold text-amber-400 uppercase">{lobbyStatus}</span>
              </div>
            </div>

            {/* Track Lanes for each participant */}
            <div className="space-y-4">
              {participants.map((player, idx) => {
                const isMe = player.user_id === effectiveUserId;
                const prog = isMe ? myProgress : player.progress || 0;
                const speed = isMe ? myWpm : player.wpm || 0;

                return (
                  <div
                    key={player.user_id || idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMe
                        ? "bg-zinc-900/90 border-emerald-500/40"
                        : "bg-zinc-900/50 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{player.user_name}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500 text-zinc-950">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">({player.car_name || "🏎️ Cyber Roadster"})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-emerald-400 font-black">{speed} WPM</span>
                        <span className="text-zinc-400 font-bold">{prog}%</span>
                        {player.finish_rank && (
                          <span className="text-amber-400 font-black">
                            {player.finish_rank === 1 ? "🥇 1st" : "🥈 2nd"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Asphalt Lane with Moving Car */}
                    <div className="relative h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center px-2">
                      {/* Lane center dashed line */}
                      <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-zinc-800" />
                      {/* Finish line checkerboard flag line */}
                      <div className="absolute right-2 top-0 bottom-0 w-3 bg-[repeating-conic-gradient(#fff_0_90deg,#000_0_180deg)] [background-size:6px_6px] opacity-40" />

                      {/* Moving Car Container */}
                      <div
                        className="absolute transition-all duration-200 ease-out flex items-center gap-1"
                        style={{ left: `calc(${prog}% * 0.88)` }}
                      >
                        <div className="text-2xl drop-shadow-[0_0_12px_rgba(16,185,129,0.5)] transform -scale-x-100">
                          {player.car_name?.split(" ")[0] || "🏎️"}
                        </div>
                        {prog > 0 && prog < 100 && (
                          <span className="text-[10px] text-amber-400 animate-pulse font-mono font-bold">
                            💨
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Waiting for Players Notice if only 1 person in lobby */}
            {participants.length === 1 && lobbyStatus === "waiting" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                <div className="text-xs font-bold text-amber-400">Awaiting Second Racer</div>
                <p className="text-[11px] text-zinc-400">
                  Share invite code <code className="text-amber-300 font-black">{lobbyCode}</code> with your opponent or open a second browser window to race!
                </p>
              </div>
            )}
          </div>

          {/* RACING TYPING FLOOR */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Type the words below. Hit space to advance to the next word.
              </span>
              <span>
                Progress: <strong className="text-emerald-500">{currWordIndex}</strong> / {words.length} words
              </span>
            </div>

            {/* Words Container */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-[#070c10] border border-zinc-200 dark:border-zinc-800 font-mono text-xl leading-[42px] select-none cursor-text min-h-[140px] flex flex-wrap gap-x-2"
            >
              {/* Synchronized 3-second Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl animate-fadeIn">
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-4 border-amber-400/30 animate-ping absolute inset-0 m-auto" />
                    <div className="w-28 h-28 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center">
                      {countdown > 0 ? (
                        <span key={countdown} className="text-6xl font-black font-mono text-amber-400 animate-bounce">
                          {countdown}
                        </span>
                      ) : (
                        <span className="text-3xl font-black font-mono text-emerald-400 animate-pulse">
                          RACE!
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-zinc-300">
                      {countdown > 0 ? "Engines Ready..." : "Go Go Go!"}
                    </div>
                  </div>
                </div>
              )}

              {/* Text rendering */}
              {words.map((word, wIdx) => {
                const isCompleted = wIdx < currWordIndex;
                const isCurrent = wIdx === currWordIndex;

                return (
                  <span key={wIdx} className="inline-flex tracking-normal">
                    {isCompleted && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {word}
                      </span>
                    )}

                    {isCurrent && (
                      <span className="relative">
                        {word.split("").map((ch, cIdx) => {
                          const typedCh = currCharInput[cIdx];
                          const isTyped = cIdx < currCharInput.length;
                          const isCorrect = isTyped && typedCh === ch;
                          const isError = isTyped && typedCh !== ch;

                          let color = "text-zinc-400 dark:text-zinc-500";
                          if (isCorrect) color = "text-emerald-600 dark:text-emerald-400 font-bold";
                          else if (isError) color = "text-red-500 bg-red-500/20 rounded";

                          return (
                            <span key={cIdx} className={color}>
                              {cIdx === currCharInput.length && (
                                <span className="inline-block w-[2px] h-5 bg-amber-400 animate-pulse align-middle" />
                              )}
                              {ch}
                            </span>
                          );
                        })}
                        {currCharInput.length > word.length && (
                          <span className="text-red-500 bg-red-500/30 px-0.5">
                            {currCharInput.slice(word.length)}
                          </span>
                        )}
                      </span>
                    )}

                    {!isCompleted && !isCurrent && (
                      <span className="text-zinc-400/70 dark:text-zinc-600">{word}</span>
                    )}
                  </span>
                );
              })}

              <input
                ref={inputRef}
                type="text"
                value={currCharInput}
                onChange={handleRacingInputChange}
                disabled={lobbyStatus !== "racing" || hasFinished}
                autoFocus
                className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
              />
            </div>

            {/* Post-Race Winner Modal */}
            {hasFinished && (
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  {finishRank === 1 ? "🥇 Victory! You Won the Race!" : `🥈 Great Race! Finished #${finishRank}`}
                </h3>
                <p className="text-xs text-zinc-400">
                  Final Speed: <strong className="text-emerald-400 text-sm">{myWpm} WPM</strong> • Your score has been recorded in Supabase!
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRematch}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                  >
                    Play Again (Rematch)
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveLobby}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Exit Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
