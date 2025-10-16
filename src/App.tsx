import { useState, useEffect, useRef } from "react";

import { ArrowLeftToLine } from "lucide-react";

const AcceleratingMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [startSpeed, setStartSpeed] = useState(1.0);
  const [maxSpeed, setMaxSpeed] = useState(2.0);
  const [acceleration, setAcceleration] = useState(0.5);

  const audioRef = useRef<audio>(null);
  const speedIntervalRef = useRef(0.0);

  // Start speed acceleration interval
  useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval first
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }

      speedIntervalRef.current = setInterval(() => {
        if (!audioRef.current || !audioRef.current.duration) return;

        const currentProgress =
          audioRef.current.currentTime / audioRef.current.duration;
        const speedRange = maxSpeed - startSpeed;
        const accelerationCurve = Math.pow(currentProgress, 1 / acceleration);
        const newSpeed = startSpeed + speedRange * accelerationCurve;
        const clampedSpeed = Math.min(maxSpeed, Math.max(startSpeed, newSpeed));

        audioRef.current.playbackRate = clampedSpeed;
        setPlaybackSpeed(clampedSpeed);
      }, 500);
    } else {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    }

    return () => {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    };
  }, [isPlaying, startSpeed, maxSpeed, acceleration]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    // Seems like a weird way to do it.
    setCurrentTrack({
      name: file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      url: url,
    });

    if (audioRef.current) {
      audioRef.current.src = url;
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!currentTrack) {
      alert("Please select an audio file first!");
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Seek backward/forward
  const seekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const seekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  // Format time display
  const formatTime = (seconds: GLfloat) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Audio event handlers
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
    <div className="">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 max-w-xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          🚀 Accelerating Player
        </h1>

        {/* File Input */}
        <div className="mb-8 text-center">
          <label
            htmlFor="audioFile"
            className="inline-block px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 rounded-full cursor-pointer hover:translate-y-[-2px] hover:shadow-lg transition-all font-bold uppercase tracking-wider text-white"
          >
            Choose Music File
          </label>
          <input
            type="file"
            id="audioFile"
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Track Info */}
        <div className="mb-8 min-h-[60px] text-center">
          <div className="text-xl font-bold text-white mb-1">
            {currentTrack ? currentTrack.name : "No track selected"}
          </div>
          <div className="text-sm text-white/80">
            {currentTrack
              ? `File: ${currentTrack.fileName}`
              : "Select an audio file to begin"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-5 mb-8">
          <button
            onClick={seekBackward}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-xl hover:scale-110 transition-transform shadow-lg"
          >
            <ArrowLeftToLine />
          </button>
          <button
            onClick={togglePlay}
            className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-2xl hover:scale-110 transition-transform shadow-lg ${
              isPlaying ? "animate-pulse" : ""
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={seekForward}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-xl hover:scale-110 transition-transform shadow-lg"
          >
            ⏭
          </button>
        </div>

        {/* Speed Info */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <div className="text-3xl font-bold text-teal-300 mb-2 text-center">
            {playbackSpeed.toFixed(2)}x
          </div>
          <div className="text-sm text-white/50 text-center leading-relaxed">
            <p>Speed increases as the song progresses.</p>
            <p>The longer you listen, the faster it gets!</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <SettingRow
            label="Start Speed:"
            value={startSpeed}
            onChange={(e) => setStartSpeed(parseFloat(e.target.value))}
            min="0.5"
            max="2.0"
            step="0.1"
          />
          <SettingRow
            label="Max Speed:"
            value={maxSpeed}
            onChange={(e) => setMaxSpeed(parseFloat(e.target.value))}
            min="1.0"
            max="4.0"
            step="0.1"
          />
          <SettingRow
            label="Acceleration:"
            value={acceleration}
            onChange={(e) => setAcceleration(parseFloat(e.target.value))}
            min="0.1"
            max="2.0"
            step="0.1"
          />
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="auto"
        />
      </div>
    </div>
  </>);
};

// Making this a new file will help with the "any" type errors.
const SettingRow = ({ label, value, onChange, min, max, step }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-white">{label}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-24 px-3 py-2 rounded-lg bg-white/20 text-white text-center border-none focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
    </div>
  );
};

export default AcceleratingMusicPlayer;
