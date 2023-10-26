import { useRef, useState } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

function App() {
  const [localDes, setLocalDes] = useState<RTCSessionDescription | null>();
  const [isSendOffer, setIsSendOffer] = useState(false);
  const [chat, setChat] = useState("");
  const textRef = useRef<HTMLInputElement>(null);
  const setRemoteRef = useRef<HTMLInputElement>(null);

  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  let dc = peer.createDataChannel("channel");

  const handleSDPBtnClick = async () => {
    dc.onmessage = (e) => console.log("Just got a message " + e.data);
    dc.onopen = () => console.log("Connection opened!");

    peer.onicecandidate = () => {
      console.log("ice후보자를 찾고있어요");
      setLocalDes(peer.localDescription);
      console.log("peer.localDescription", peer.localDescription);
    };

    peer
      .createOffer()
      .then((o) =>
        peer.setLocalDescription(o).then(() => {
          toast.success("성공적으로 localDescription을 설정했어요.");
          if (peer.localDescription?.sdp) {
            setIsSendOffer(true);
          }
        })
      )
      .catch((err) => toast.error(err));
  };

  const handleSetRemoteBtnClick = () => {
    const ref = setRemoteRef.current;
    const sdp = ref?.value;

    console.log("isSendOffer", isSendOffer);
    if (!isSendOffer) {
      peer.onicecandidate = () => {
        console.log("ice후보자를 찾고있어요");
        setLocalDes(peer.localDescription);
        console.log("peer.localDescription", peer.localDescription);
      };

      peer.ondatachannel = (e) => {
        toast.success("handleSetRemoteBtnClick 채널을 생성할게요.");
        console.log("dc", dc, "peer", peer);
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
        .then(() => {
          toast.success("RemoteDescription을 설정했어요!");
        });
      peer.ondatachannel = (e) => {
        toast.success("RemoteDescription설정 후, 채널을 생성할게요.");
        console.log("dc", dc, "peer", peer);

        dc = e.channel;
        dc.onmessage = (e) => console.log("new message from client! " + e.data);
        dc.onopen = () => console.log("Connection OPENED!!!!");
      };

      if (!isSendOffer) {
        peer.createAnswer().then((a) =>
          peer.setLocalDescription(a).then(() => {
            toast.success("answer를 생성했어요");
            peer.ondatachannel = (e) => {
              toast.success("answer 생성 후, 채널을 생성할게요.");
              console.log("dc", dc, "peer", peer);

              dc = e.channel;
              dc.onmessage = (e) =>
                console.log("new message from client! " + e.data);
              dc.onopen = () => console.log("Connection OPENED!!!!");
            };

            if (peer.remoteDescription) setLocalDes(peer.remoteDescription);
          })
        );
      }
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
