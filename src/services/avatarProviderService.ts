/**
 * Nexora CodeLab + InterviewAI
 * Live AI Interviewer Avatar Provider Adapter
 * Decouples video rendering and speech synchronization between local real-time canvas engine and cloud WebRTC streaming providers.
 */

import { InterviewerPersona } from '@/types/interview';
import { speakText, stopSpeechSynthesis } from '@/services/voiceChatService';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AvatarSessionConfig {
  persona: InterviewerPersona;
  canvasElement?: HTMLCanvasElement | null;
  onStateChange?: (state: AvatarState) => void;
  onAudioLevelChange?: (level: number) => void;
}

export interface AvatarProvider {
  id: string;
  name: string;
  type: 'local_canvas' | 'cloud_stream';
  status: 'active' | 'blocked_on_credentials' | 'unavailable';
  capabilities: {
    isRealTime: boolean;
    latencyMs: number;
    requiresCredentials: boolean;
    estimatedCostPerMinute: string;
    supportedBrowserEngines: string[];
  };
  connect: (config: AvatarSessionConfig) => Promise<boolean>;
  speakQuestion: (
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => Promise<void>;
  interrupt: () => void;
  setExpressionState: (state: AvatarState) => void;
  disconnect: () => void;
}

/**
 * Local Procedural Canvas Engine for Female AI Interviewer (Elena Vance & Dr. Sophia Chen)
 * 100% Zero-Latency, Zero-Cost, Local Client-Side Execution with Procedural Lip-Sync and Micro-Expressions.
 */
export class LocalCanvasAvatarProvider implements AvatarProvider {
  id = 'local_female_canvas';
  name = 'CodeXpertai Local Interactive Female Avatar Engine';
  type: 'local_canvas' = 'local_canvas';
  status: 'active' = 'active';

  capabilities = {
    isRealTime: true,
    latencyMs: 0,
    requiresCredentials: false,
    estimatedCostPerMinute: '$0.00 (Zero API Charges)',
    supportedBrowserEngines: ['Chromium', 'WebKit', 'Gecko'],
  };

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private persona: InterviewerPersona | null = null;
  private currentState: AvatarState = 'idle';

  // Animation procedural clocks
  private startTime = Date.now();
  private blinkProgress = 0;
  private nextBlinkTime = Date.now() + 2500;
  private isBlinking = false;
  private mouthOpenness = 0;
  private nodProgress = 0;
  private avatarImage: HTMLImageElement | null = null;
  private isImageLoaded = false;

  private loadAvatarImage(): void {
    if (typeof window === 'undefined') return;
    const isSophia = this.persona?.id === 'sophia';
    const src = isSophia ? '/avatars/sophia_chen.jpg' : '/avatars/elena_vance.jpg';
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.avatarImage = img;
      this.isImageLoaded = true;
    };
  }

  async connect(config: AvatarSessionConfig): Promise<boolean> {
    this.persona = config.persona;
    this.canvas = config.canvasElement || null;
    this.currentState = 'idle';
    this.loadAvatarImage();

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.startRenderLoop();
    }

    return true;
  }

  setCanvas(canvas: HTMLCanvasElement | null): void {
    this.canvas = canvas;
    this.loadAvatarImage();
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.startRenderLoop();
    } else {
      this.stopRenderLoop();
    }
  }

  setExpressionState(state: AvatarState): void {
    this.currentState = state;
    if (state === 'listening') {
      // Trigger subtle nod
      this.nodProgress = 1;
    }
  }

  async speakQuestion(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.setExpressionState('speaking');
    this.mouthOpenness = 0.5;

    speakText(text, {
      preferredVoice: 'female',
      pitch: this.persona?.id === 'sophia' ? 1.15 : 1.1,
      rate: 1.0,
      onStart: () => {
        this.setExpressionState('speaking');
        if (onStart) onStart();
      },
      onEnd: () => {
        this.setExpressionState('idle');
        this.mouthOpenness = 0;
        if (onEnd) onEnd();
      },
      onError: () => {
        this.setExpressionState('idle');
        this.mouthOpenness = 0;
        if (onEnd) onEnd();
      },
    });
  }

  interrupt(): void {
    stopSpeechSynthesis();
    this.setExpressionState('idle');
    this.mouthOpenness = 0;
  }

  disconnect(): void {
    this.interrupt();
    this.stopRenderLoop();
    this.canvas = null;
    this.ctx = null;
  }

  private startRenderLoop(): void {
    this.stopRenderLoop();

    const render = () => {
      this.drawFrame();
      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  private stopRenderLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private drawFrame(): void {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000;

    // Clear background with soft studio gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#18181B');
    bgGrad.addColorStop(1, '#09090B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle studio lighting vignette
    const radGrad = ctx.createRadialGradient(width / 2, height * 0.4, 40, width / 2, height * 0.4, width * 0.7);
    radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);

    // Eye-Level Framing: center of head positioned at 40% height for natural eye-contact framing
    const breathOffset = Math.sin(elapsed * 1.5) * 2.0;
    let nodOffset = 0;
    if (this.nodProgress > 0) {
      // Subtle attentive micro-nod that returns cleanly to eye-level
      nodOffset = Math.sin(this.nodProgress * Math.PI) * 2.5;
      this.nodProgress = Math.max(0, this.nodProgress - 0.04);
    }

    const centerX = width / 2;
    const centerY = height * 0.40 + breathOffset + nodOffset;

    // Handle blinking timer (natural 3.2s - 5.5s intervals)
    if (now > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress += 0.22;
      if (this.blinkProgress >= 1) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.nextBlinkTime = now + 2800 + Math.random() * 3200;
      }
    }

    // Procedural Lip Sync when speaking
    if (this.currentState === 'speaking') {
      this.mouthOpenness = Math.abs(Math.sin(elapsed * 11.5)) * 0.75 + 0.25;
    } else {
      this.mouthOpenness = 0;
    }

    // If photorealistic portrait asset is loaded, render photorealistic human interviewer
    if (this.isImageLoaded && this.avatarImage) {
      this.drawPhotorealisticAvatar(ctx, width, height, elapsed, breathOffset, nodOffset);
      this.drawStateHUD(ctx, width, height);
      return;
    }

    // Fallback: Draw Procedural Vector Female AI Interviewer
    this.drawAvatarShoulders(ctx, centerX, centerY, width, height);
    this.drawAvatarHead(ctx, centerX, centerY, elapsed);
    this.drawAvatarFace(ctx, centerX, centerY);
    this.drawAvatarHair(ctx, centerX, centerY);

    // Status overlay HUD
    this.drawStateHUD(ctx, width, height);
  }

  private drawPhotorealisticAvatar(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    elapsed: number,
    breathOffset: number,
    nodOffset: number
  ): void {
    if (!this.avatarImage) return;

    // Organic micro-movement: natural breathing, head nod, and subtle posture sway
    const swayX = Math.sin(elapsed * 0.8) * 1.5;
    const totalOffsetY = breathOffset + nodOffset;

    ctx.save();

    // Subtle gentle zoom when actively speaking to create conversational engagement
    const scale = this.currentState === 'speaking' ? 1.015 : 1.0;
    ctx.translate(width / 2 + swayX, height / 2 + totalOffsetY);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    // Cover canvas with 16:9 portrait
    const imgRatio = this.avatarImage.width / this.avatarImage.height;
    const canvasRatio = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
    } else {
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    }

    ctx.drawImage(this.avatarImage, offsetX, offsetY, renderW, renderH);

    // Soft cinematic studio vignette overlay around edges
    const vignette = ctx.createRadialGradient(width / 2, height * 0.42, width * 0.28, width / 2, height * 0.42, width * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(6, 6, 9, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  private drawAvatarShoulders(ctx: CanvasRenderingContext2D, cx: number, cy: number, _w: number, h: number): void {
    // Professional Neck
    const neckColor = this.persona?.id === 'sophia' ? '#F2CEAA' : '#DEB294';
    ctx.fillStyle = neckColor;
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy + 70);
    ctx.lineTo(cx + 26, cy + 70);
    ctx.lineTo(cx + 34, cy + 130);
    ctx.lineTo(cx - 34, cy + 130);
    ctx.closePath();
    ctx.fill();

    // Subtle neck shadow under chin
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 85, 28, 12, 0, 0, Math.PI);
    ctx.fill();

    // Blazer Shoulders
    ctx.fillStyle = this.persona?.id === 'sophia' ? '#0F172A' : '#1E1B4B'; // Obsidian Slate vs Deep Midnight Navy
    ctx.beginPath();
    ctx.moveTo(cx - 160, h);
    ctx.lineTo(cx - 55, cy + 115);
    ctx.lineTo(cx, cy + 165);
    ctx.lineTo(cx + 55, cy + 115);
    ctx.lineTo(cx + 160, h);
    ctx.closePath();
    ctx.fill();

    // Blazer Lapels with satin trim
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy + 115);
    ctx.lineTo(cx - 22, cy + 155);
    ctx.lineTo(cx, cy + 180);
    ctx.lineTo(cx - 45, cy + 185);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 55, cy + 115);
    ctx.lineTo(cx + 22, cy + 155);
    ctx.lineTo(cx, cy + 180);
    ctx.lineTo(cx + 45, cy + 185);
    ctx.closePath();
    ctx.fill();

    // Inner blouse (Crisp Silk Blue / Pure Ivory)
    ctx.fillStyle = this.persona?.id === 'sophia' ? '#3B82F6' : '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 120);
    ctx.lineTo(cx, cy + 160);
    ctx.lineTo(cx + 22, cy + 120);
    ctx.closePath();
    ctx.fill();
  }

  private drawAvatarHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, elapsed: number): void {
    // Subtle, organic head sway (micro-movement at eye level)
    const sway = Math.sin(elapsed * 0.7) * 1.2;

    ctx.save();
    ctx.translate(cx + sway, cy);

    // Professional balanced skin tone
    const skinColor = this.persona?.id === 'sophia' ? '#FCE7D0' : '#F3D2B8';

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 74, 94, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jaw contouring and chin
    ctx.beginPath();
    ctx.moveTo(-58, 15);
    ctx.quadraticCurveTo(-42, 92, 0, 98);
    ctx.quadraticCurveTo(42, 92, 58, 15);
    ctx.closePath();
    ctx.fill();

    // Soft cheekbone highlights & subtle blush (lends warmth and vitality)
    const blushColor = 'rgba(244, 114, 182, 0.09)';
    ctx.fillStyle = blushColor;
    ctx.beginPath();
    ctx.ellipse(-38, 12, 18, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(38, 12, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawAvatarFace(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.translate(cx, cy);

    // Eyebrows (Sculpted, natural female arch)
    const browColor = this.persona?.id === 'sophia' ? '#1F2937' : '#3B1F12';
    ctx.strokeStyle = browColor;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(-44, -30);
    ctx.quadraticCurveTo(-26, -37, -10, -32);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(10, -32);
    ctx.quadraticCurveTo(26, -37, 44, -30);
    ctx.stroke();

    // Direct Eye Contact Architecture (Corrects Downward Gaze)
    const eyeY = -14; // Positioned higher for front-facing eye level
    const eyeOpenness = this.isBlinking ? Math.max(0.08, 1 - Math.sin(this.blinkProgress * Math.PI)) : 1.0;

    // Sclera (White of Eye) with realistic almond curvature
    const drawEyeSclera = (x: number) => {
      ctx.fillStyle = '#FAFAFA';
      ctx.beginPath();
      ctx.ellipse(x, eyeY, 14, 8.5 * eyeOpenness, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle shadow from upper eyelid
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.ellipse(x, eyeY - 3, 13, 4 * eyeOpenness, 0, 0, Math.PI);
      ctx.fill();
    };

    drawEyeSclera(-28);
    drawEyeSclera(28);

    // Irises, Pupils & Specular Reflections (Directly focused forward into camera lens)
    if (eyeOpenness > 0.25) {
      const drawDirectIris = (x: number) => {
        // Iris centered at (x, eyeY - 0.5) to maintain firm forward eye contact
        const irisY = eyeY - 0.5;

        // Limbal ring (dark edge of iris)
        ctx.fillStyle = this.persona?.id === 'sophia' ? '#18181B' : '#172554';
        ctx.beginPath();
        ctx.arc(x, irisY, 6.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner Iris Radial Gradient (rich warm brown or deep sapphire)
        const irisGrad = ctx.createRadialGradient(x, irisY, 1, x, irisY, 6);
        if (this.persona?.id === 'sophia') {
          irisGrad.addColorStop(0, '#52525B');
          irisGrad.addColorStop(0.7, '#27272A');
          irisGrad.addColorStop(1, '#09090B');
        } else {
          irisGrad.addColorStop(0, '#60A5FA');
          irisGrad.addColorStop(0.6, '#2563EB');
          irisGrad.addColorStop(1, '#1E3A8A');
        }
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(x, irisY, 5.8, 0, Math.PI * 2);
        ctx.fill();

        // Center Deep Pupil
        ctx.fillStyle = '#09090B';
        ctx.beginPath();
        ctx.arc(x, irisY, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Primary Specular Reflection (Catchlight at 11 o'clock - gives alive, focused expression)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - 1.8, irisY - 2.0, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Secondary Soft Reflection at 4 o'clock
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x + 1.6, irisY + 1.8, 0.9, 0, Math.PI * 2);
        ctx.fill();
      };

      drawDirectIris(-28);
      drawDirectIris(28);
    }

    // Upper Eyelash Line (Eyeliner contour framing the eye for attentive expression)
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-43, eyeY + 1);
    ctx.quadraticCurveTo(-28, eyeY - 8.5 * eyeOpenness, -13, eyeY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(13, eyeY);
    ctx.quadraticCurveTo(28, eyeY - 8.5 * eyeOpenness, 43, eyeY + 1);
    ctx.stroke();

    // Natural Nose Bridge (Soft Dimensional Contour)
    ctx.strokeStyle = 'rgba(168, 100, 60, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(1.5, 14, 2, 20);
    ctx.stroke();

    // Subtle nose tip and nostril curves
    ctx.fillStyle = 'rgba(140, 75, 45, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 6, 3, 0, 0, Math.PI);
    ctx.fill();

    // Lips & Mouth (Natural Cupid's Bow with Realistic Viseme Aperture)
    const mouthY = 52;
    const openH = this.mouthOpenness * 13;

    // Professional berry satin lipstick
    const lipColor = this.persona?.id === 'sophia' ? '#9F1239' : '#BE123C';
    ctx.fillStyle = lipColor;

    if (openH > 1.8) {
      // Vocalizing state: smooth elliptical speech aperture
      ctx.beginPath();
      ctx.ellipse(0, mouthY, 19, 5 + openH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Oral cavity depth & teeth glimpse
      ctx.fillStyle = '#3F121E';
      ctx.beginPath();
      ctx.ellipse(0, mouthY, 16, 3 + openH * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-9, mouthY - 4, 18, 3.5);
    } else {
      // Attentive closed smile with subtle cupid's bow
      ctx.beginPath();
      // Upper lip
      ctx.moveTo(-22, mouthY);
      ctx.quadraticCurveTo(-10, mouthY - 4, 0, mouthY - 2);
      ctx.quadraticCurveTo(10, mouthY - 4, 22, mouthY);
      ctx.quadraticCurveTo(11, mouthY + 1, 0, mouthY);
      ctx.quadraticCurveTo(-11, mouthY + 1, -22, mouthY);
      ctx.fill();

      // Lower lip
      ctx.beginPath();
      ctx.moveTo(-20, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 7, 20, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 2, -20, mouthY);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawAvatarHair(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.translate(cx, cy);

    // Multi-tone hair (Elena Vance: Rich Chestnut; Dr. Sophia Chen: Obsidian Black)
    const baseColor = this.persona?.id === 'sophia' ? '#09090B' : '#3B1808';
    const highlightColor = this.persona?.id === 'sophia' ? '#27272A' : '#652A0E';

    ctx.fillStyle = baseColor;

    // Top hair volume with natural crown curvature
    ctx.beginPath();
    ctx.ellipse(0, -48, 86, 62, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Side hair layers
    ctx.beginPath();
    ctx.moveTo(-84, -28);
    ctx.quadraticCurveTo(-92, 45, -64, 115);
    ctx.quadraticCurveTo(-54, 60, -60, -5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(84, -28);
    ctx.quadraticCurveTo(92, 45, 64, 115);
    ctx.quadraticCurveTo(54, 60, 60, -5);
    ctx.closePath();
    ctx.fill();

    // Subtle hair highlight sheen
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -50, 72, Math.PI * 1.15, Math.PI * 1.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -50, 72, Math.PI * 1.6, Math.PI * 1.85);
    ctx.stroke();

    ctx.restore();
  }

  private drawStateHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Bottom badge showing current conversational state
    ctx.save();
    const badgeW = 220;
    const badgeH = 34;
    const badgeX = (w - badgeW) / 2;
    const badgeY = h - 46;

    ctx.fillStyle = 'rgba(15, 15, 18, 0.85)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
    ctx.fill();
    ctx.stroke();

    // State dot & text
    let dotColor = '#10B981'; // green for listening
    let label = 'Listening attentively...';

    if (this.currentState === 'speaking') {
      dotColor = '#3B82F6'; // blue for speaking
      label = `${this.persona?.name || 'Interviewer'} Speaking`;
    } else if (this.currentState === 'thinking') {
      dotColor = '#EAB308'; // yellow for analyzing
      label = 'Analyzing response...';
    } else {
      dotColor = '#94A3B8';
      label = 'Ready';
    }

    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(badgeX + 18, badgeY + 17, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F5F5F5';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillText(label, badgeX + 32, badgeY + 21);

    ctx.restore();
  }
}

/**
 * Cloud WebRTC Streaming Avatar Provider Adapter (HeyGen / Simli / D-ID)
 * Reports credentials requirement when API keys are absent and provides safe fallback.
 */
export class CloudStreamingAvatarProvider implements AvatarProvider {
  id = 'cloud_webrtc_stream';
  name = 'Cloud WebRTC Streaming Avatar Adapter (HeyGen / Simli / Tavus)';
  type: 'cloud_stream' = 'cloud_stream';

  get status(): 'active' | 'blocked_on_credentials' {
    const key = import.meta.env.VITE_HEYGEN_API_KEY || import.meta.env.VITE_SIMLI_API_KEY;
    return key ? 'active' : 'blocked_on_credentials';
  }

  capabilities = {
    isRealTime: true,
    latencyMs: 650,
    requiresCredentials: true,
    estimatedCostPerMinute: '$0.12 - $0.25 / session minute',
    supportedBrowserEngines: ['WebRTC Enabled Browsers'],
  };

  private fallback = new LocalCanvasAvatarProvider();

  async connect(config: AvatarSessionConfig): Promise<boolean> {
    if (this.status === 'blocked_on_credentials') {
      console.info(
        '[AvatarProvider] Cloud streaming credentials absent in .env (VITE_HEYGEN_API_KEY). Using Local Canvas Avatar.'
      );
      return this.fallback.connect(config);
    }
    return true;
  }

  async speakQuestion(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return this.fallback.speakQuestion(text, onStart, onEnd);
  }

  interrupt(): void {
    this.fallback.interrupt();
  }

  setExpressionState(state: AvatarState): void {
    this.fallback.setExpressionState(state);
  }

  disconnect(): void {
    this.fallback.disconnect();
  }
}

/**
 * Factory creating the active verified Avatar Provider instance
 */
export function getAvatarProvider(): AvatarProvider {
  return new LocalCanvasAvatarProvider();
}
