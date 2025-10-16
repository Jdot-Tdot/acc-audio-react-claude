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
      <div className="">
        <h1 className="">
          🚀 Accelerating Player
        </h1>

        {/* File Input */}
        <div className="">
          <label
            htmlFor="audioFile"
            className=""
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
        <div className="">
          <div className="">
            {currentTrack ? currentTrack.name : "No track selected"}
          </div>
          <div className="">
            {currentTrack
              ? `File: ${currentTrack.fileName}`
              : "Select an audio file to begin"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="">
          <div className="">
            <div
              className=""
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="">
          <button
            onClick={seekBackward}
            className=""
          >
            <ArrowLeftToLine />
          </button>
          <button
            onClick={togglePlay}
            className={`${
              isPlaying ? "animate-pulse" : ""
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={seekForward}
            className=""
          >
            ⏭
          </button>
        </div>

        {/* Speed Info */}
        <div className="">
          <div className="">
            {playbackSpeed.toFixed(2)}x
          </div>
          <div className="">
            <p>Speed increases as the song progresses.</p>
            <p>The longer you listen, the faster it gets!</p>
          </div>
        </div>

        {/* Settings */}
        <div className="">
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
        className=""
      />
    </div>
  );
};

export default AcceleratingMusicPlayer;
