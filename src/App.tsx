import "./App.css";

function App() {
  return (
    <div className="wrap">
      <form className="inputWrap">
        <label htmlFor="sdp">SDP</label>
        <input type="text" id="sdp" />
        <button type="submit">생성</button>
      </form>
      <form className="inputWrap">
        <label htmlFor="setRemote">setRemote</label>
        <input type="text" id="setRemote" />
        <button type="submit">설정</button>
      </form>
      <div className="inputWrap">
        <label htmlFor="chat">chat</label>
        <textarea />
      </div>
    </div>
  );
}

export default App;
