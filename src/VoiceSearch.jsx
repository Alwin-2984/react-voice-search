import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { UAParser } from "ua-parser-js";

const DefaultMicIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

// Check if code is running in browser environment
const isBrowser = typeof window !== "undefined";

// Store speech recognition constructor globally
let SpeechRecognition = null;
if (isBrowser) {
  SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const VoiceSearch = ({
  width,
  darkMode = false,
  handleSearch,
  language = "en-US",
  customMicIcon,
  customStyles = {},
  customClasses = {},
  Error = () => {},
}) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
    useState(false);

  // Use refs to track instances that need cleanup
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);
  const isAnimatingRef = useRef(false);

  // Check browser compatibility for speech recognition
  useEffect(() => {
    if (!isBrowser) return;

    try {
      // Create UAParser instance only once
      const parser = new UAParser();
      const result = parser.getResult();
      const isFirefoxOrOpera =
        result.browser.name?.includes("Firefox") ||
        result.browser.name?.includes("Opera");

      setIsSpeechRecognitionSupported(SpeechRecognition && !isFirefoxOrOpera);
    } catch (e) {
      // Fallback if UAParser fails
      if (!isBrowser) return;

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isFirefoxOrOpera =
        userAgent.indexOf("firefox") > -1 || userAgent.indexOf("opera") > -1;

      setIsSpeechRecognitionSupported(SpeechRecognition && !isFirefoxOrOpera);
    }
  }, []);

  // Check if device is Android
  useEffect(() => {
    if (!isBrowser) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
  }, []);

  // Clean up animation resources
  const cleanupAnimation = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      try {
        cancelAnimationFrame(animationFrameRef.current);
      } catch (e) {}
      animationFrameRef.current = null;
    }
    isAnimatingRef.current = false;
  };

  // Standard cleanup just for audio tracks
  const cleanupAudioTracks = () => {
    // Stop microphone tracks
    if (microphoneStreamRef.current) {
      try {
        const tracks = microphoneStreamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
          try {
            track.enabled = false;
          } catch (e) {}
        });
      } catch (e) {}
    }
  };

  // Super aggressive cleanup of all audio resources
  const aggressiveAudioCleanup = () => {
    // 1. Clean up animation
    cleanupAnimation();

    // 2. Stop microphone tracks with multiple methods
    if (microphoneStreamRef.current) {
      try {
        const tracks = microphoneStreamRef.current.getTracks();

        // Apply multiple stopping methods to each track
        tracks.forEach((track) => {
          // Method 1: Stop the track
          try {
            track.stop();
          } catch (e) {}

          // Method 2: Disable the track
          try {
            track.enabled = false;
          } catch (e) {}

          // Method 3: Remove the track from all connections
          try {
            track.onended = null;
          } catch (e) {}
          try {
            track.onmute = null;
          } catch (e) {}
          try {
            track.onunmute = null;
          } catch (e) {}
        });
      } catch (e) {}

      // Clear the reference
      microphoneStreamRef.current = null;
    }

    // 3. Close the AudioContext completely
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {}
      audioContextRef.current = null;
    }

    // 4. Reset analyzer ref
    analyserRef.current = null;

    // 5. Reset volume
    setVolume(0);

    // 6. Try to revoke media permissions
    if (navigator.mediaDevices) {
      try {
        if (typeof navigator.permissions?.revoke === "function") {
          navigator.permissions.revoke({ name: "microphone" }).catch(() => {});
        } else {
          // Alternative approach: request audio with false to trick browser
          navigator.mediaDevices.getUserMedia({ audio: false }).catch(() => {});
        }
      } catch (e) {}
    }

    // 7. Create and trigger a fake audio context to reset audio subsystem
    if (isBrowser && !audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const tempContext = new AudioContext();
          tempContext.close().catch(() => {});
        }
      } catch (e) {}
    }
  };

  // Destroy and nullify the recognition instance
  const destroyRecognition = () => {
    if (recognitionRef.current) {
      try {
        // First try to abort
        recognitionRef.current.abort();
      } catch (e) {}

      try {
        // Then try to stop
        recognitionRef.current.stop();
      } catch (e) {}

      // Remove all event handlers
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onsoundstart = null;
        recognitionRef.current.onsoundend = null;
        recognitionRef.current.onaudiostart = null;
        recognitionRef.current.onaudioend = null;
        recognitionRef.current.onnomatch = null;
      } catch (e) {}

      // Set to null
      recognitionRef.current = null;
    }
  };

  // Thorough stop and cleanup
  const stopListeningCompletely = () => {
    // 1. Update state first to prevent UI feedback loops
    setIsListening(false);

    // 2. Destroy recognition instance
    destroyRecognition();

    // 3. Cleanup immediate audio resources to stop the animation
    cleanupAnimation();
    cleanupAudioTracks();

    // 4. Schedule aggressive cleanup after a short delay (helps with some browsers)
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    cleanupTimeoutRef.current = setTimeout(() => {
      aggressiveAudioCleanup();
      cleanupTimeoutRef.current = null;
    }, 300);
  };

  // Initialize audio context and analyzer
  const setupAudioAnalyzer = async () => {
    // Skip if not in browser or on Android devices
    if (!isBrowser || isAndroid) return;

    try {
      // Clean up previous audio resources
      cleanupAnimation();

      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        } else {
          return; // No AudioContext available
        }
      } else if (audioContextRef.current.state === "suspended") {
        // Resume the context if it was suspended
        await audioContextRef.current.resume();
      }

      // Get microphone stream
      if (!navigator?.mediaDevices?.getUserMedia) {
        return; // No media devices API
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      microphoneStreamRef.current = stream;

      // Create analyzer
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;

      // Start analyzing volume
      startVolumeAnalysis();
    } catch (error) {
      console.error("Error accessing microphone for analysis:", error);
    }
  };

  // Analyze volume levels
  const startVolumeAnalysis = () => {
    if (!analyserRef.current || !isBrowser) return;

    // Clean up any existing animation frame
    cleanupAnimation();

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    isAnimatingRef.current = true;

    const analyzeVolume = () => {
      // Stop if component is unmounted or analysis should stop
      if (!analyserRef.current || !isAnimatingRef.current) {
        cleanupAnimation();
        return;
      }

      // Get audio data
      try {
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;

        // Normalize to 0-100 range
        const normalizedVolume = Math.min(100, Math.max(0, avg * 1.5));

        // Only update state if we're listening and animating
        if (isAnimatingRef.current) {
          setVolume(normalizedVolume);
          // Continue animation loop
          animationFrameRef.current = requestAnimationFrame(analyzeVolume);
        }
      } catch (e) {
        // Handle errors in animation loop
        cleanupAnimation();
      }
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(analyzeVolume);
  };

  // Effect to manage animation state when listening changes
  useEffect(() => {
    if (isListening) {
      isAnimatingRef.current = true;
      if (analyserRef.current && !animationFrameRef.current && !isAndroid) {
        startVolumeAnalysis();
      }
    } else {
      // Stop animation when not listening
      cleanupAnimation();
    }
  }, [isListening, isAndroid]);

  // Create a new recognition instance
  const createNewRecognition = () => {
    if (!isBrowser || !SpeechRecognition) return null;

    // Create fresh instance
    try {
      const recognitionInstance = new SpeechRecognition();

      // Configure the instance
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;

      // Increase max alternatives for Android devices
      if (isAndroid) {
        recognitionInstance.maxAlternatives = 3;
      }

      // Set up event handlers
      recognitionInstance.onresult = (event) => {
        try {
          if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript;
            handleSearch(transcript);
          } else {
            Error("No speech was detected. Please try again.");
          }
        } catch (error) {
          console.error("Error processing speech result:", error);
          Error("Failed to process speech. Please try again.");
        } finally {
          stopListeningCompletely();
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        switch (event.error) {
          case "no-speech":
            Error("No speech was detected. Please try again.");
            break;
          case "audio-capture":
            Error("Microphone not found or not working properly.");
            break;
          case "not-allowed":
            Error("Microphone access denied. Please allow microphone access.");
            break;
          case "network":
            Error("Network error occurred. Please check your connection.");
            break;
          case "aborted":
            // User aborted, don't show error
            break;
          default:
            if (!isAndroid) {
              Error("Speech recognition error. Please try again.");
            }
        }

        stopListeningCompletely();
      };

      recognitionInstance.onend = () => {
        stopListeningCompletely();
      };

      recognitionInstance.onnomatch = () => {
        if (!isAndroid) {
          Error("Could not recognize what you said. Please try again.");
        }
        stopListeningCompletely();
      };

      return recognitionInstance;
    } catch (error) {
      console.error("Error creating recognition instance:", error);
      return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isAnimatingRef.current = false;
      stopListeningCompletely();
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // For Android pulse animation
  const [androidPulseState, setAndroidPulseState] = useState(false);

  // Set up Android pulse animation
  useEffect(() => {
    if (!isBrowser) return;

    let pulseInterval;

    if (isAndroid && isListening) {
      // Create a pulsing effect by toggling the state
      pulseInterval = setInterval(() => {
        setAndroidPulseState((prev) => !prev);
      }, 1000); // Toggle every second
    }

    return () => {
      if (pulseInterval) {
        clearInterval(pulseInterval);
      }
    };
  }, [isAndroid, isListening]);

  const toggleListening = async () => {
    // Skip on server-side
    if (!isBrowser) return;

    if (isListening) {
      // Stop listening
      stopListeningCompletely();
    } else {
      // Start listening with a fresh recognition instance
      destroyRecognition();
      recognitionRef.current = createNewRecognition();

      if (!recognitionRef.current) {
        Error(
          "Speech recognition not available. Please try a different browser."
        );
        return;
      }

      try {
        // Start speech recognition
        recognitionRef.current.start();
        setIsListening(true);

        // Then setup audio analyzer separately (skip on Android)
        if (!isAndroid) {
          try {
            await setupAudioAnalyzer();
          } catch (analyzerError) {
            console.warn(
              "Audio analyzer setup failed, but speech recognition will continue:",
              analyzerError
            );
          }
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        Error("Failed to start speech recognition. Please try again.");
        stopListeningCompletely();
      }
    }
  };

  // Calculate animation properties based on volume
  const pulseSize = isListening ? Math.max(1, 1 + volume / 100) : 1;
  const pulseOpacity = isListening ? Math.min(0.5, volume / 200 + 0.2) : 0;
  const pulseColor = isListening
    ? `rgba(${Math.min(255, volume * 2.55)}, 0, 0, ${pulseOpacity})`
    : "transparent";

  // Determine which icons to use
  const MicIconComponent = customMicIcon || DefaultMicIcon;

  // Base styles for the component that can be extended via props
  const inputContainerStyle = {
    display: "flex",
    flexDirection: "row",
    boxSizing: "border-box",
    height: "50px",
    position: "relative",
    width: width || "50px",
    zIndex: 10,
    ...customStyles.inputContainer,
  };

  const micContainerStyle = {
    position: "absolute",
    zIndex: 10,
    top: 0,
    right: 0,
    height: "100%",
    padding: "0 0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...customStyles.micContainer,
  };

  const pulseStyle = isAndroid
    ? {
        position: "absolute",
        borderRadius: "9999px",
        transition: "all 500ms ease-in-out",
        width: "32px",
        height: "32px",
        opacity: isListening ? (androidPulseState ? 0.5 : 0.2) : 0,
        backgroundColor: isListening ? "rgba(239, 68, 68, 1)" : "transparent",
        transform: isListening
          ? androidPulseState
            ? "scale(1.5)"
            : "scale(1.2)"
          : "scale(1)",
        ...customStyles.pulse,
      }
    : {
        position: "absolute",
        borderRadius: "9999px",
        transition: "all 75ms ease-out",
        width: `${32 * pulseSize}px`,
        height: `${32 * pulseSize}px`,
        backgroundColor: pulseColor,
        transform: `scale(${pulseSize})`,
        opacity: pulseOpacity,
        ...customStyles.pulse,
      };

  const micButtonStyle = {
    position: "relative",
    zIndex: 20,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    outline: "none",
    ...customStyles.micButton,
  };

  // CSS classes to apply
  const inputContainerClass = customClasses.inputContainer || "";
  const micContainerClass = customClasses.micContainer || "";
  const pulseClass = customClasses.pulse || "";
  const micButtonClass = customClasses.micButton || "";
  const micIconClass =
    customClasses.micIcon ||
    `
    ${darkMode ? "text-white opacity-80" : "text-black"} 
    ${isListening ? "animate-pulse text-red-500" : ""}
  `;

  // Only render the component on the client-side
  if (!isBrowser) {
    return (
      <div className={inputContainerClass} style={inputContainerStyle}></div>
    );
  }

  return (
    <div className={inputContainerClass} style={inputContainerStyle}>
      {isSpeechRecognitionSupported && (
        <div className={micContainerClass} style={micContainerStyle}>
          {/* Voice level animation rings */}
          <div className={pulseClass} style={pulseStyle} />
          <button
            onClick={toggleListening}
            className={micButtonClass}
            style={micButtonStyle}
          >
            <MicIconComponent className={micIconClass} />
          </button>
        </div>
      )}
    </div>
  );
};

VoiceSearch.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
  handleSearch: PropTypes.func.isRequired,
  language: PropTypes.string,
  customMicIcon: PropTypes.elementType,
  customStyles: PropTypes.object,
  customClasses: PropTypes.object,
  Error: PropTypes.func,
};

export default VoiceSearch;
