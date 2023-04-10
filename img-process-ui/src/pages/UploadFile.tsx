import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faImage } from "@fortawesome/free-solid-svg-icons";
import { Button, ProgressBar } from "react-bootstrap";
import "./UploadFile.css";
import UploadFileService from "../services/UploadFileService";

export const UploadFiles = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [image, setImage] = useState<File>();
  const [progress, setProgress] = useState<number>(0);
  const [isProcessingActive, setIsProcessingActive] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const validFileType = ["image/jpeg", "image/png"];
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (validFileType.includes(file.type)) {
        setImage(file);
      }
    }
  };

  const handleUplaodClick = () => {
    inputRef?.current?.click();
  };

  const handleInputFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleClickProcess = async () => {
    setProgress(0);
    setCompleted(false);
    const res = await UploadFileService.upload(image!, (p) => {
      setProgress((p.loaded / p.total!) * 100);
      if (p.loaded === p.total) {
        setIsProcessingActive(true);
      }
    });
    setIsProcessingActive(false);
    console.log(res);
  };

  return (
    <div>
      <div
        className={`upload-area border-primary${
          dragActive ? " upload-area-active" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {image ? (
          <>
            <FontAwesomeIcon icon={faImage} size="3x" />
            <header>{image.name}</header>
            <div style={{ marginBottom: "10px" }} />
          </>
        ) : (
          <>
            <FontAwesomeIcon
              icon={faCloudUpload}
              className="text-primary"
              size="3x"
            />
            <header>Drag & Drop to Upload Image</header>
            <span>OR</span>
          </>
        )}
        <Button variant="primary" onClick={handleUplaodClick}>
          Browse Image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleInputFileChange}
          hidden
        />
      </div>

      <div className="bottom-func-container">
        <Button variant="success" onClick={handleClickProcess}>
          Process
        </Button>
        <ProgressBar
          className="my-progress-bar"
          now={progress}
          animated={isProcessingActive}
          label={isProcessingActive ? "Image is processing" : undefined}
        />
        <Button variant="primary" disabled>
          Download New Image
        </Button>
      </div>

      {/* <div className="alert alert-light" role="alert">
        {message}
      </div> */}
    </div>
  );
};

export default UploadFiles;
