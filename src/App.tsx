import { useRef, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import "./App.css";
import UploadImgWrap from "./components/UploadImgWrap";
import Button from "./components/common/Button";

function App() {
  const [peer, setPeer] = useState<RTCPeerConnection>();
  const [localDes, setLocalDes] = useState<RTCSessionDescription | null>();
  const [isSendOffer, setIsSendOffer] = useState(false);
  const [saveImgArr, setSaveImgArr] = useState<string[]>([]);
  const [delImgBtn, setDelImgBtn] = useState("");
  const [chat, setChat] = useState("");
  const textRef = useRef<HTMLInputElement>(null);
  const setRemoteRef = useRef<HTMLInputElement>(null);
  const channel = useRef<RTCDataChannel>();

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

  useEffect(() => {
    if (delImgBtn)
      setSaveImgArr((prev) => prev.filter((img) => img !== delImgBtn));
    console.log(saveImgArr);
  }, [delImgBtn]);

  const handleSDPBtnClick = async () => {
    channel.current = peer?.createDataChannel("channel");

    if (channel.current) {
      channel.current.onmessage = (e) => {
        toast.success("새로운 메시지가 도착했어요!");
        setChat((prev) => prev + `릿: ${e.data}\n`);
      };
      channel.current.onopen = () =>
        toast.success("상대방과 연결되었습니다. 채팅을 시작할 수 있습니다.");
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
          console.log("localDescription설정완료.");
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
        channel.current = e.channel;
        channel.current.onmessage = (e) => {
          toast.success("새로운 메시지가 도착했어요!");
          setChat((prev) => prev + `메롱: ${e.data}\n`);
        };
        channel.current.onopen = () => {
          toast.success("상대방과 연결되었습니다. 채팅을 시작할 수 있습니다.");
        };
      };
    }

    if (ref && sdp && peer) {
      await peer
        .setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)))
        .then(() => {
          toast.success("RemoteDescription을 설정했어요!");
          console.log("setRemoteDescription완료");
        });

      if (!isSendOffer) {
        await peer
          .createAnswer()
          .then(
            async (a) =>
              await peer.setLocalDescription(a).then(() => {
                toast.success("answer를 생성했어요");
                console.log("answer생성 완료");
                setLocalDes(peer.localDescription);
              })
          )
          .catch((err) => console.log(err));
      }
    }
  };

  const handleSendText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ref = textRef.current;
    const text = ref?.value;
    setChat((prev) => prev + `나: ${text}\n`);

    if (text) {
      channel.current?.send(text);
      if (textRef.current) textRef.current.value = "";
    }
  };

  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      const filesArr = Array.from(e.target.files) as File[];
      const tmpArr: string[] = [];
      filesArr.forEach((file) => tmpArr.push(URL.createObjectURL(file)));
      setSaveImgArr(tmpArr);
      console.log(tmpArr);
    }
  };

  return (
    <div className="wrap">
      <div className="inputWrap">
        <label htmlFor="sdp">SDP</label>
        <p>{JSON.stringify(localDes)}</p>
        <Button onClick={handleSDPBtnClick} text="생성" />
      </div>
      <div className="inputWrap">
        <label htmlFor="setRemote">setRemote</label>
        <input type="text" id="setRemote" ref={setRemoteRef} />
        <Button onClick={handleSetRemoteBtnClick} text="설정" />
      </div>
      <form className="inputWrap" onSubmit={handleSendText}>
        <label htmlFor="enteredText">텍스트 입력</label>
        <input type="text" id="enteredText" ref={textRef} />
        <input
          type="file"
          accept="image/*"
          placeholder="이미지 업로드"
          multiple
          onChange={handleUploadFiles}
        />
        {saveImgArr.map((img, i) => (
          <UploadImgWrap
            src={img}
            key={`img-${i}`}
            setDelImgBtn={setDelImgBtn}
          />
        ))}
      </form>
      <div className="inputWrap">
        <label htmlFor="chat">chat</label>
        <p>{chat}</p>
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
