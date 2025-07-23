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
  const [recognition, setRecognition] = useState(null);
  const [volume, setVolume] = useState(0);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
    useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Check browser compatibility for speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Create UAParser instance only once
        const parser = new UAParser();
        const result = parser.getResult();
        const isFirefoxOrOpera =
          result.browser.name?.includes("Firefox") ||
          result.browser.name?.includes("Opera");

        setIsSpeechRecognitionSupported(
          (window.webkitSpeechRecognition || window.SpeechRecognition) &&
            !isFirefoxOrOpera
        );
      } catch (e) {
        // Fallback if UAParser fails
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isFirefoxOrOpera =
          userAgent.indexOf("firefox") > -1 || userAgent.indexOf("opera") > -1;

        setIsSpeechRecognitionSupported(
          (window.webkitSpeechRecognition || window.SpeechRecognition) &&
            !isFirefoxOrOpera
        );
      }
    }
  }, []);

  // Check if device is Android
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsAndroid(/android/.test(userAgent));
    }
  }, []);

  // Initialize audio context and analyzer
  const setupAudioAnalyzer = async () => {
    // Skip audio analysis on Android devices
    if (isAndroid) return;

    try {
      // Clean up previous audio resources before creating new ones
      cleanupAudio();

      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Get microphone stream
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
      // Don't show error message here, just fail silently for the animation
      // The speech recognition will still work even if the animation doesn't
    }
  };

  // Clean up audio resources
  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }

    setVolume(0);
  };

  // Analyze volume levels
  const startVolumeAnalysis = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const analyzeVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;

      // Normalize to 0-100 range
      const normalizedVolume = Math.min(100, Math.max(0, avg * 1.5));
      setVolume(normalizedVolume);

      animationFrameRef.current = requestAnimationFrame(analyzeVolume);
    };

    analyzeVolume();
  };

  useEffect(() => {
    // Initialize speech recognition if available in the browser
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language; // Use language from props

        // Increase max alternatives for Android devices
        if (isAndroid) {
          recognitionInstance.maxAlternatives = 3; // Get multiple alternatives on Android
        }

        recognitionInstance.onresult = (event) => {
          try {
            if (event.results && event.results[0]) {
              // Get the most confident result
              const transcript = event.results[0][0].transcript;
              handleSearch(transcript);
            } else {
              Error("No speech was detected. Please try again.");
            }
          } catch (error) {
            console.error("Error processing speech result:", error);
            Error("Failed to process speech. Please try again.");
          } finally {
            setIsListening(false);
            cleanupAudio();
          }
        };

        recognitionInstance.onerror = (event) => {
          setIsListening(false);
          cleanupAudio();
          console.error("Speech recognition error:", event.error);

          // Handle specific error types
          switch (event.error) {
            case "no-speech":
              Error("No speech was detected. Please try again.");
              break;
            case "audio-capture":
              Error("Microphone not found or not working properly.");
              break;
            case "not-allowed":
              Error(
                "Microphone access denied. Please allow microphone access."
              );
              break;
            case "network":
              Error("Network error occurred. Please check your connection.");
              break;
            case "aborted":
              // User aborted, don't show error
              // Error("");
              break;
            default:
              // On Android, don't show generic errors as they're common and confusing
              if (!isAndroid) {
                Error("Speech recognition error. Please try again.");
              }
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          cleanupAudio();
        };

        recognitionInstance.onnomatch = () => {
          // On Android, don't show this error as it happens frequently
          if (!isAndroid) {
            Error("Could not recognize what you said. Please try again.");
          }
          setIsListening(false);
          cleanupAudio();
        };

        setRecognition(recognitionInstance);
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        Error("Failed to initialize speech recognition.");
      }
    } else {
      console.warn("Speech recognition not supported in this browser");
      Error("Speech recognition not supported in your browser.");
    }

    // Cleanup on component unmount
    return () => {
      cleanupAudio();
    };
  }, [handleSearch, isAndroid, language]);

  // For Android pulse animation
  const [androidPulseState, setAndroidPulseState] = useState(false);

  // Set up Android pulse animation
  useEffect(() => {
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
    // Clear any previous error messages
    if (!recognition) {
      Error(
        "Speech recognition not available. Please try a different browser."
      );
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        cleanupAudio();
      } else {
        // Start speech recognition first
        recognition.start();
        setIsListening(true);

        // Then setup audio analyzer separately (skip on Android)
        if (!isAndroid) {
          try {
            await setupAudioAnalyzer();
          } catch (analyzerError) {
            // If analyzer setup fails, speech recognition can still work
            console.warn(
              "Audio analyzer setup failed, but speech recognition will continue:",
              analyzerError
            );
          }
        }
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
      Error("Failed to start speech recognition. Please try again.");
      setIsListening(false);
      cleanupAudio();
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
