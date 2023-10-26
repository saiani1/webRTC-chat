import { useRef, useState, useEffect } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

function App() {
  const [peer, setPeer] = useState<RTCPeerConnection>();
  const [localDes, setLocalDes] = useState<RTCSessionDescription | null>();
  const [isSendOffer, setIsSendOffer] = useState(false);
  const [chat, setChat] = useState("");
  const textRef = useRef<HTMLInputElement>(null);
  const setRemoteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!peer) {
      const newPeer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });
      setPeer(newPeer);
    }
  }, []);

  let dc = peer?.createDataChannel("channel");

  const handleSDPBtnClick = async () => {
    if (dc) {
      dc.onmessage = (e) => {
        toast.success("새로운 메시지가 도착했습니다.");
        setChat((prev) => prev + `${e.data}\n`);
      };
      dc.onopen = () => console.log("Connection opened!");
    }

    if (peer) {
      peer.onicecandidate = () => {
        console.log("ice후보자를 찾고있어요");
        setLocalDes(peer.localDescription);
      };

      const offer = await peer.createOffer();
      await peer
        .setLocalDescription(offer)
        .then(() => {
          toast.success("성공적으로 localDescription을 설정했어요.");
          if (peer.localDescription?.sdp) {
            setIsSendOffer(true);
          }
        })
        .catch((err) => console.log(err));

      peer.onconnectionstatechange = () => {
        console.log("connectionstate", peer.connectionState);
      };

      peer.oniceconnectionstatechange = () => {
        console.log("iceconnectionstate", peer.iceConnectionState);
      };
    }
  };

  const handleSetRemoteBtnClick = async () => {
    const ref = setRemoteRef.current;
    const sdp = ref?.value;

    console.log("handleSetRemoteBtnClick눌렀을 때", peer);

    if (!isSendOffer && peer) {
      peer.onicecandidate = () => {
        console.log("ice후보자를 찾고있어요");
        setLocalDes(peer.localDescription);
      };

      peer.onconnectionstatechange = () => {
        console.log("connectionstate", peer.connectionState);
      };

      peer.oniceconnectionstatechange = () => {
        console.log("iceconnectionstate", peer.iceConnectionState);
      };

      peer.ondatachannel = (e) => {
        toast.success("handleSetRemoteBtnClick 채널을 생성할게요.");
        dc = e.channel;
        dc.onmessage = (e) => {
          toast.success("새로운 메시지가 도착했어요!");
          setChat((prev) => prev + `${e.data}\n`);
        };
        dc.onopen = () => {
          toast.success("상대방과 연결되었습니다. 채팅을 시작할 수 있습니다.");
        };
      };
    }

    if (ref && sdp && peer) {
      await peer
        .setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)))
        .then(() => {
          toast.success("RemoteDescription을 설정했어요!");
        });

      if (!isSendOffer) {
        await peer
          .createAnswer()
          .then(
            async (a) =>
              await peer.setLocalDescription(a).then(() => {
                toast.success("answer를 생성했어요");
                setLocalDes(peer.localDescription);
                console.log("localDescription", peer.localDescription);
                console.log("remoteDescription", peer.remoteDescription);
              })
          )
          .catch((err) => console.log(err));
      }
    }
  };

  const handleChatArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChat((prev) => prev + `${e.target.value}\n`);
  };

  const handleSendText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ref = textRef.current;
    const text = ref?.value;
    console.log(text, ref);
    if (text && dc) {
      dc.send(text);
      textRef.current.value = "";
    }
  };

  /*  useEffect(() => {
    return () => {
      peer.close();
    };
  }, []); */

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
