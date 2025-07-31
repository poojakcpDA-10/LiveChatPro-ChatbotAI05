import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import axios from 'axios';

const VoiceRecorder = ({ onFinish }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const calculateDuration = (blob) => {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(blob);
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration || 0);
      });
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const duration = await calculateDuration(blob);

        const formData = new FormData();
        formData.append("file", blob);
        formData.append("duration", duration);

        try {
          const response = await axios.post("http://localhost:3001/api/chat/upload", formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data"
            },
          });

          const result = {
            fileId: response.data.fileId,
            fileName: response.data.fileName,
            url: response.data.url,
            duration,
          };

          onFinish?.(result);
        } catch (error) {
          console.error("Voice upload failed:", error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
      title={isRecording ? "Stop Recording" : "Start Recording"}
    >
      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
};

export default VoiceRecorder;