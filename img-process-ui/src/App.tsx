import React from "react";
import "./App.css";
import UploadFiles from "./pages/UploadFile";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <div className="header-div">
        <h4>Upload Your Image For Process</h4>
      </div>

      <UploadFiles />
    </div>
  );
}

export default App;
