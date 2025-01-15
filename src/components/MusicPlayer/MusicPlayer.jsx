import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, loadTracksRequest } from '../../redux/slices/musicPlayerSlice';
import { toggleMusic } from "../../redux/slices/quickSettingsSlice";

const MusicPlayer = () => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  
  const { currentTrack, tracks } = useSelector((state) => state.musicPlayer);
  const { musicOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);

  // Load tracks on mount
  useEffect(() => {
    dispatch(loadTracksRequest());
  }, [dispatch]);

  // Automatically pick the first track if none is playing
  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      dispatch(playTrack(tracks[0]));
    }
  }, [dispatch, tracks, currentTrack]);

  // Update audio source when the current track changes, but do not auto-play
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load(); // Just load, don't play yet
      }
    }
  }, [currentTrack]);

  // Control playback based on musicOn
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = musicVolume / 100;

    if (musicOn && audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
    } else if (!musicOn && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [musicOn, musicVolume]);

  const handleToggleMusic = () => {
    dispatch(toggleMusic());
  };

  const handleTrackEnd = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    dispatch(playTrack(tracks[nextIndex]));
  };

  return (
    <div style={{ display: 'none' }}>
      {/* Removed autoPlay */}
      <audio ref={audioRef} onEnded={handleTrackEnd} />
      <button onClick={handleToggleMusic}>Toggle Music</button>
    </div>
  );
};

export default MusicPlayer;