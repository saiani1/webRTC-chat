import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [localDes, setLocalDes] = useState({
    type: "answer",
    sdp: "",
  });

  const setRemoteRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const RTCPeerConnctionObject = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const handleSDPBtnClick = async () => {
    const offer = await RTCPeerConnctionObject.createOffer({
      iceRestart: true,
    });
    await RTCPeerConnctionObject.setLocalDescription(offer);
    if (offer.sdp) setLocalDes({ ...localDes, sdp: offer.sdp });
  };

  const handleSetRemoteBtnClick = async () => {
    const ref = setRemoteRef.current;
    const sdp = ref?.value;
    if (ref && RTCPeerConnctionObject && sdp) {
      await RTCPeerConnctionObject.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(sdp))
      );
      console.log(RTCPeerConnctionObject);
    }
  };

  return (
    <div className="wrap">
      <div className="inputWrap">
        <label htmlFor="sdp">SDP</label>
        <p>{JSON.stringify(localDes)}</p>
        <button type="button" onClick={handleSDPBtnClick}>
          생성
        </button>
      </div>
      <div className="inputWrap">
        <label htmlFor="setRemote">setRemote</label>
        <input type="text" id="setRemote" ref={setRemoteRef} />
        <button type="button" onClick={handleSetRemoteBtnClick}>
          설정
        </button>
      </div>
      <div className="inputWrap">
        <label htmlFor="chat">chat</label>
        <textarea ref={textRef} />
      </div>
    </div>
  );
}

export default App;
