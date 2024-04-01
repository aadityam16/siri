"use client";
import Image from "next/image";
import activeAssistantIcon from "@/img/active.gif";
import notActiveAssistantIcon from "@/img/notactive.png";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const startRecording = async () => {
    if (stream === null || pending) return;
    setRecordingStatus("Recording");

    // crete a new media recorder instance using stream
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;

      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = async () => {
    if (mediaRecorder.current === null || pending) return;
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      uploadAudio(audioBlob);
      setAudioChunks([]);
    };
  };
  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser");
    }
  };
  return (
    <div className="flex items-center justify-center text-white">
      {!permission && (
        <button onClick={getMicrophonePermission} type="button">
          Get Microphone
        </button>
      )}
      {pending && (
        <Image
          src={activeAssistantIcon}
          alt="Recording"
          width={350}
          height={350}
          priority
          className="assistant grayscale"
        />
      )}
      {permission && recordingStatus === "inactive" && !pending && (
        <Image
          src={notActiveAssistantIcon}
          onClick={startRecording}
          alt="Not Recording"
          width={350}
          height={350}
          priority
          className="assistant transition-all duration-150 ease-in-out hover:scale-110 cursor-pointer"
        />
      )}
      {recordingStatus === "Recording" && (
        <Image
          src={activeAssistantIcon}
          onClick={stopRecording}
          alt="Recording"
          width={350}
          height={350}
          priority
          className="assistant transition-all duration-150 ease-in-out hover:scale-110 cursor-pointer"
        />
      )}
    </div>
  );
}

export default Recorder;
