import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';

const VoiceMessagePlayer = ({ fileUrl, duration, isFromUser = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [waveformBars, setWaveformBars] = useState([]);

  // Generate random waveform bars for visual effect
  useEffect(() => {
    const bars = Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
    setWaveformBars(bars);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !fileUrl) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Set playback rate
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [fileUrl, playbackRate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Audio play error:', err);
      setError(true);
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * audioDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `voice-message-${Date.now()}.webm`;
    link.click();
  };

  if (error) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-2xl max-w-xs ${
        isFromUser ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <span className="text-sm">Audio unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl max-w-xs shadow-sm ${
      isFromUser 
        ? 'bg-blue-500 text-white ml-auto' 
        : 'bg-gray-100 text-gray-800 border border-gray-200'
    }`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={fileUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isFromUser
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 min-w-0">
        {/* Waveform Visualization */}
        <div 
          className="flex items-center gap-px h-8 cursor-pointer"
          onClick={handleProgressClick}
        >
          {waveformBars.map((height, index) => {
            const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
            const isActive = index < progress * waveformBars.length;
            
            return (
              <div
                key={index}
                className={`w-1 rounded-full transition-all ${
                  isFromUser
                    ? isActive
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isActive
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                }`}
                style={{
                  height: `${height * 100}%`,
                  minHeight: '2px'
                }}
              />
            );
          })}
        </div>

        {/* Time Display */}
        <div className={`text-xs mt-1 ${
          isFromUser ? 'text-white/80' : 'text-gray-500'
        }`}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Playback Speed */}
        <button
          onClick={togglePlaybackRate}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            isFromUser
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {playbackRate}x
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className={`p-1 rounded transition-colors ${
            isFromUser
              ? 'hover:bg-white/20 text-white'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Restart"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className={`p-1 rounded transition-colors ${
            isFromUser
              ? 'hover:bg-white/20 text-white'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Download"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;