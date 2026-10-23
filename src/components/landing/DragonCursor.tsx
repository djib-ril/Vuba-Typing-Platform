"use client";

import React, { useEffect, useRef, useState } from "react";

interface WaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export default function DragonCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Only on pointer-capable desktop devices
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      setIsEnabled(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let lastRippleTime = 0;

    const ripples: WaveRipple[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const now = performance.now();
      const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);

      // Create a wave ripple if moved enough or after a short delay
      if (dist > 18 && now - lastRippleTime > 45) {
        lastRippleTime = now;
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        // Alternate colors between emerald neon, golden yellow, and amber orange
        const colors = [
          "rgba(16, 185, 129, ", // emerald green
          "rgba(52, 211, 153, ", // bright mint
          "rgba(234, 179, 8, ",  // golden yellow
          "rgba(249, 115, 22, ", // warm orange
        ];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];

        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 6,
          maxRadius: 48 + Math.random() * 20,
          opacity: 0.7,
          color: chosenColor,
        });

        // Cap maximum simultaneous ripples
        if (ripples.length > 25) {
          ripples.shift();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing wave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.6; // expand outward in wave motion
        r.opacity *= 0.94; // fade gently

        if (r.opacity < 0.02 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.opacity})`;
        ctx.lineWidth = 2.2 * (r.opacity / 0.7);
        ctx.shadowColor = `${r.color}0.8)`;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw small active cursor core glow
      if (mouseX > 0 && mouseY > 0) {
        ctx.save();
        const coreGradient = ctx.createRadialGradient(
          mouseX,
          mouseY,
          2,
          mouseX,
          mouseY,
          28
        );
        coreGradient.addColorStop(0, "rgba(16, 185, 129, 0.65)");
        coreGradient.addColorStop(0.35, "rgba(52, 211, 153, 0.25)");
        coreGradient.addColorStop(0.7, "rgba(234, 179, 8, 0.1)");
        coreGradient.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 28, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        // Inner bright pinpoint
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
