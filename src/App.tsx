import { useState, useEffect, useRef } from "react";
import { ArrowLeftToLine, ArrowRightToLine, Pause, Play} from "lucide-react";
import { SettingRow } from "./SettingRow";
import blob from './assets/Confused State.mp3';
console.log(blob)

interface trackType {
  name: string;
  imageName: string;
  audioName: string;
  next: number;
}

const tracks: Array<trackType> = [
  {name: "Awesome Call",
  imageName: "src/assets/Awesome Call.jpg",
  audioName:"src/assets/Awesome Call.mp3",
  next:1},
{name: "Casa Bossa Nova",
imageName: "src/assets/Cassa Nova.jpg",
audioName:"src/assets/Casa Bossa Nova.mp3",
next:2},
  {name: "Confused State",
  imageName: "src/assets/Confused State.jpg",
  audioName:"src/assets/Confused State.mp3",
  next:0}]


const AcceleratingMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<trackType>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [startSpeed, setStartSpeed] = useState(1.0);
  const [maxSpeed, setMaxSpeed] = useState(2.0);
  const [acceleration, setAcceleration] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement>(null);
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
  }, 
  // Basically if any of these changes, then they are 
  [isPlaying, startSpeed, maxSpeed, acceleration]);

  // Handle file upload
  // https://stackoverflow.com/a/62999947 for file type on e.
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return;
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const url = URL.createObjectURL(file);
  //   // Seems like a weird way to do it.
  //   setCurrentTrack({
  //     name: file.name.replace(/\.[^/.]+$/, ""),
  //     imageName: file.name,
  //     audioName: url,
  //   });

  //   if (audioRef.current) {
  //     audioRef.current.src = url;
  //   }
  // };

  //setCurrentTrack(tracks[0])

  // Handle play/pause
  const togglePlay = () => {
    if (!currentTrack) {
      alert("Please select an audio file first!");
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
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
    setCurrentTrack(
      tracks[currentTrack.next]
    );
    audioRef.current.playbackRate = startSpeed;
    setPlaybackSpeed(startSpeed);
    setIsPlaying(true);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
    <div className="">
      <div className="">
        <h1 className="">
          Accelerating Player
        </h1>

        {/* File Input
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
        </div> */}

        {/* Track Info */}
        <div className="">
          <div className="">
            {currentTrack ? currentTrack.name : "No track selected"}
          </div>
          <img className="" src={`${currentTrack?.imageName}`}>
          </img>
        </div>

        {/* Progress Bar */}
        <div className="">
          <div className="w-8 bg-amber-50 h-2">
            <div
              className="bg-amber-900 h-full"
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
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button
            onClick={seekForward}
            className=""
          >
            <ArrowRightToLine />
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
        <div className="hidden">
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
          src={currentTrack?.audioName}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="auto"
        />
      </div>
    </div>
  </>);
};

export default AcceleratingMusicPlayer;
