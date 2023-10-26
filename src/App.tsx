import { useRef, useState, useEffect } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

function App() {
  const [localDes, setLocalDes] = useState({
    type: "answer",
    sdp: "",
  });
  const [isSendOffer, setIsSendOffer] = useState(false);
  const [chat, setChat] = useState("");
  const textRef = useRef<HTMLInputElement>(null);
  const setRemoteRef = useRef<HTMLInputElement>(null);

  const peer = new RTCPeerConnection();
  let dc = peer.createDataChannel("channel");
  peer.onicecandidate = () => {};

  const handleSDPBtnClick = async () => {
    peer
      .createOffer()
      .then((o) =>
        peer.setLocalDescription(o).then(() => {
          toast.success("성공적으로 localDescription을 설정했어요.");
          if (peer.localDescription?.sdp) {
            setLocalDes({
              ...localDes,
              sdp: peer.localDescription?.sdp,
            });
            setIsSendOffer(true);
          }
        })
      )
      .catch((err) => toast.error(err));
  };

  const handleSetRemoteBtnClick = () => {
    const ref = setRemoteRef.current;
    const sdp = ref?.value;

    if (!isSendOffer) {
      toast.success("채널을 생성할게요.");
      peer.ondatachannel = (e) => {
        dc = e.channel;
        dc.onmessage = (e) => {
          toast.success("새로운 메시지가 도착했어요!");
          setChat(e.data);
        };
        dc.onopen = () => {
          toast.success("상대방과 연결되었습니다. 채팅을 시작할 수 있습니다.");
        };
      };
    }

    if (ref && sdp) {
      peer
        .setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)))
        .then(() => toast.success("RemoteDescription을 설정했어요!"));
      if (localDes.sdp !== "" && !isSendOffer)
        peer.createAnswer().then((a) =>
          peer.setLocalDescription(a).then(() => {
            toast.success("answer를 생성했어요");
            if (peer.localDescription?.sdp) {
              setLocalDes({ ...localDes, sdp: peer.localDescription?.sdp });
            }
          })
        );
    }
  };

  const handleChatArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChat((prev) => prev + e.target.value);
  };

  const handleSendText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ref = textRef.current;
    const text = ref?.value;
    if (text) dc.send(text);
  };

  useEffect(() => {}, []);

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
      <form className="inputWrap" onSubmit={handleSendText}>
        <label htmlFor="enteredText">텍스트 입력</label>
        <input type="text" id="enteredText" ref={textRef} />
      </form>
      <div className="inputWrap">
        <label htmlFor="chat">chat</label>
        <textarea value={chat} onChange={handleChatArea} />
      </div>
      <Toaster
        containerStyle={{
          top: 20,
        }}
        toastOptions={{
          duration: 2000,
        }}
      />
    </div>
  );
}

export default App;
