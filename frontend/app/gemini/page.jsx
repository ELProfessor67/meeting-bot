
'use client'
import { useRef, useState } from "react"
import "./App.scss"
import { LiveAPIProvider, useLiveAPIContext } from "@/contexts/LiveAPIContext";
import SidePanel from "@/components/side-panel/SidePanel";
import { Altair } from "@/components/altair/Altair";
import ControlTray from "@/components/control-tray/ControlTray";
import cn from "classnames";
import MeetingView from "@/components/meeting-view/MeetingView";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_APIK_KEY in .env")
}

const host = "generativelanguage.googleapis.com"
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef(null)
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState(null);
  const [shareScreen, setShareScreen] = useState(true);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair />
              <MeetingView ref={videoRef} videoStream={videoStream} videoRef={videoRef}/>
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>

          <SidePanel />
        </div>
      </LiveAPIProvider>
    </div>
  )
}

export default App
