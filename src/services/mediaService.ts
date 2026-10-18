/**
 * Nexora CodeLab + InterviewAI
 * Hardware Media Diagnostic & Permission Service (WebRTC Camera & Microphone)
 */

export interface DeviceReadiness {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraLabel?: string;
  microphoneLabel?: string;
  cameraActive: boolean;
  microphoneActive: boolean;
  error?: string;
  errorType?: 'permission_denied' | 'device_not_found' | 'device_busy' | 'unsupported';
}

/**
 * Checks if browser supports getUserMedia and mediaDevices
 */
export function isMediaSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Request real camera and microphone media stream from browser
 */
export async function requestMediaStream(
  videoConstraints: boolean | MediaTrackConstraints = { width: { ideal: 1280 }, height: { ideal: 720 } },
  audioConstraints: boolean | MediaTrackConstraints = true
): Promise<{ stream: MediaStream | null; readiness: DeviceReadiness }> {
  if (!isMediaSupported()) {
    return {
      stream: null,
      readiness: {
        hasCamera: false,
        hasMicrophone: false,
        cameraActive: false,
        microphoneActive: false,
        error: 'Your current browser does not support WebRTC media capture. Please use a modern browser (Chrome, Edge, Safari, Firefox).',
        errorType: 'unsupported',
      },
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: audioConstraints,
    });

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    const hasCamera = videoTracks.length > 0;
    const hasMicrophone = audioTracks.length > 0;

    const cameraLabel = hasCamera ? videoTracks[0].label || 'Standard Camera' : undefined;
    const microphoneLabel = hasMicrophone ? audioTracks[0].label || 'Standard Microphone' : undefined;

    return {
      stream,
      readiness: {
        hasCamera,
        hasMicrophone,
        cameraLabel,
        microphoneLabel,
        cameraActive: hasCamera && videoTracks[0].readyState === 'live',
        microphoneActive: hasMicrophone && audioTracks[0].readyState === 'live',
      },
    };
  } catch (err: any) {
    console.warn('[MediaService] getUserMedia failure:', err);

    let error = 'Unable to access your camera and microphone.';
    let errorType: DeviceReadiness['errorType'] = 'permission_denied';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      error =
        'Camera or microphone permission was denied. Please allow access in your browser address bar and click Retry.';
      errorType = 'permission_denied';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      error =
        'No working camera or microphone was found on this device. Please connect a webcam or headset and try again.';
      errorType = 'device_not_found';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      error =
        'Camera or microphone is currently in use by another application (e.g. Zoom, Meet, Teams). Please close other video apps and retry.';
      errorType = 'device_busy';
    }

    return {
      stream: null,
      readiness: {
        hasCamera: false,
        hasMicrophone: false,
        cameraActive: false,
        microphoneActive: false,
        error,
        errorType,
      },
    };
  }
}

/**
 * Creates an audio level monitor calculating real-time RMS input volume (0–100)
 * Returns cleanup function to disconnect analyzer and close AudioContext.
 */
export function monitorAudioVolume(
  stream: MediaStream,
  onLevel: (level: number) => void
): () => void {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0 || typeof window === 'undefined') {
    return () => {};
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    return () => {};
  }

  try {
    const audioContext = new AudioCtx();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      // Scale 0-255 to roughly 0-100 percentage
      const level = Math.min(100, Math.round((average / 128) * 100));
      onLevel(level);

      animationFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();

    return () => {
      cancelAnimationFrame(animationFrameId);
      try {
        source.disconnect();
        analyser.disconnect();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch {
        // Ignore cleanup errors
      }
    };
  } catch (err) {
    console.warn('[MediaService] monitorAudioVolume error:', err);
    return () => {};
  }
}

/**
 * Release all media hardware tracks safely
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
  } catch (err) {
    console.warn('[MediaService] Failed to stop stream tracks:', err);
  }
}
