"use client";
import transcript from "@/actions/transcript";
import Messages from "@/components/Messages";
import Recorder, { mimeType } from "@/components/Recorder";
import VoiceSynthesizer from "@/components/VoiceSynthesizer";
import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

export type Message = {
  sender: string;
  response: string;
  id: string;
};

const initialState = {
  sender: "",
  response: "",
  id: "",
};

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitBtnRef = useRef<HTMLButtonElement | null>(null);

  const [state, formAction] = useFormState(transcript, initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [displaySettings, setDisplaySettings] = useState(false);

  // Responsible for updating the messages when the server action completes
  useEffect(() => {
    if (state.response && state.sender) {
      setMessages((messages) => [
        {
          sender: state.sender || "",
          response: state.response || "",
          id: state.id || "",
        },
        ...messages,
      ]);
    }
  }, [state]);

  const uploadAudio = (blob: Blob) => {
    const file = new File([blob], "audio.webm", { type: mimeType });

    // set the file as the value of the hidden input field
    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      // simulate a click and submit the form
      if (submitBtnRef.current) {
        submitBtnRef.current.click();
      }
    }
  };

  return (
    <main className="bg-black h-screen overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between fixed top-0 w-full p-5 text-white">
        <Image
          src="https://i.imgur.com/MCHWJZS.png"
          alt="Logo"
          width={50}
          height={50}
          className="object-contain"
        />
        <SettingsIcon
          size={40}
          className="p-2 rounded-full cursor-pointer bg-purple-600 text-black hover:text-white hover:bg-purple-700 transition-all ease-in-out duration-150"
          onClick={() => setDisplaySettings(!displaySettings)}
        />
      </header>
      {/* Form */}
      <form action={formAction} className="flex flex-col bg-black">
        <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
          <Messages messages={messages} />
        </div>

        {/* Hidden Fields */}
        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" hidden ref={submitBtnRef}>
          Submit Audio
        </button>

        <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-3xl">
          <Recorder uploadAudio={uploadAudio} />
          <div>
            <VoiceSynthesizer state={state} displaySettings={displaySettings} />
          </div>
        </div>
      </form>
    </main>
  );
}
