import axios, { AxiosProgressEvent } from "axios";

const UploadFileService = {
  upload(file: File, onUploadProgress: (p: AxiosProgressEvent) => void) {
    let formData = new FormData();
    formData.append("file", file);
    return axios.request({
      method: "post",
      url: "http://localhost:8080/upload",
      data: formData,
      onUploadProgress,
    });
    // .then((data) => {
    //   console.log(data);

    //   //this.setState({
    //   //fileprogress: 1.0,
    //   //})
    // });
  },
};

export default UploadFileService;
