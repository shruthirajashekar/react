// import React, { Component } from "react";
// import "./App.css";
// import { createWorker, createScheduler } from "tesseract.js";
// import Quagga from "quagga";
// import label101 from "./assets/label101.jpg";
// import CameraPhoto, { FACING_MODES } from "jslib-html5-camera-photo";
// import Progress from "react-progressbar";
// import cv from "opencv.js";

// class App extends Component {
//   constructor(props, context) {
//     super(props, context);
//     this.cameraPhoto = null;
//     this.videoRef = React.createRef();
//     this.state = {
//       dataUri: "",
//       scanning: false,
//       capturedImage: [],
//       SenderAddress: "",
//       ReceiverAddress: "",
//       barcode: "",
//       progress1: 0,
//       progress2: 0,
//       croppedImage: "",
//       progressText: "",
//       textConfidence: null,
//       courierService: null,
//     };

//     this.scheduler = createScheduler();
//     this.worker1 = createWorker({
//       logger: (m) => {
//         console.log(m);
//         this.setState({
//           progress1: m.progress,
//           progressText: m.status,
//         });
//       },
//     });
//     this.worker2 = createWorker({
//       logger: (m) => {
//         console.log(m);
//         this.setState({
//           progress2: m.progress,
//           progressText: m.status,
//         });
//       },
//     });
//   }

//   componentDidMount() {
//     // We need to instantiate CameraPhoto inside componentDidMount because we
//     // need the refs.video to get the videoElement so the component has to be
//     // mounted.
//     console.log("@@@: this.videoRef.current ="+this.videoRef.current)
//     this.cameraPhoto = new CameraPhoto(this.videoRef.current);
//     //this.loadResources();
//   }

//   loadResources = async () => {
//     await this.worker1.load();
//     await this.worker2.load();
//     await this.worker1.loadLanguage("eng");
//     await this.worker2.loadLanguage("eng");
//     await this.worker1.initialize("eng");
//     await this.worker2.initialize("eng");

//     await this.scheduler.addWorker(this.worker1);
//     await this.scheduler.addWorker(this.worker2);
//   };

//   startCamera(idealFacingMode, idealResolution) {
//     this.cameraPhoto
//       .startCamera(idealFacingMode, idealResolution)
//       .then(() => {
//         console.log("camera is started !");
//       })
//       .catch((error) => {
//         console.error("Camera not started!", error);
//       });
//   }

//   startCameraMaxResolution = async (idealFacingMode) => {
//     this.cameraPhoto
//       .startCameraMaxResolution(idealFacingMode)
//       .then(() => {
//         console.log("camera is started !");
//       })
//       .catch((error) => {
//         console.error("Camera not started!", error);
//       });
//   };

//   scan() {
//     this.setState({ scanning: !this.state.scanning });
//   }

//   stopCamera() {
//     this.cameraPhoto
//       .stopCamera()
//       .then(() => {
//         console.log("Camera stoped!");
//       })
//       .catch((error) => {
//         console.log("No camera to stop!:", error);
//       });
//   }

//   startProcessing = async () => {
//     Quagga.init(
//       {
//         inputStream: {
//           name: "Live",
//           type: "LiveStream",
//           constraints: {
//             width: window.innerWidth,
//             height: window.innerHeight,
//             facingMode: "environment", // or user
//           },
//         },
//         locator: {
//           patchSize: "medium",
//           halfSample: true,
//         },
//         numOfWorkers: 2,
//         decoder: {
//           readers: ["code_128_reader"],
//         },
//         locate: true,
//       },
//       (err) => {
//         console.log(this.state.scanning);
//         if (this.state.scanning) {
//           Quagga.start();
//         }
//       }
//     );
//     Quagga.onDetected(this.onDetected.bind(this));
//   };

//   doOCR = async (image) => {
//     const scannedData = await this.worker1.recognize(image);
//     console.log(scannedData.data.text);
//     scannedData.data.text.search("Amazon");
//     if (scannedData.data.confidence > 60) {
//       if (scannedData.data.text.includes("Amazon")) {
//         this.setState({ courierService: "Amazon" });
//         const rectangles = [
//           { left: 23, top: 84, width: 254, height: 170 },
//           {
//             left: 300,
//             top: 74,
//             width: 347,
//             height: 170,
//           },
//         ];
//         console.log(this.state.capturedImage);
//         const results = await Promise.all(
//           rectangles.map((rectangle) =>
//             this.scheduler.addJob("recognize", image, {
//               rectangle,
//             })
//           )
//         );
//         console.log(results.map((r) => r.data.text));
//         // await this.scheduler.terminate();

//         console.log(results);
//         this.setState(
//           {
//             SenderAddress: results[0]["data"].text,
//             ReceiverAddress: results[1]["data"].text,
//             textConfidence:
//               (results[0]["data"].confidence + results[1]["data"].confidence) /
//               2,
//           },
//           () => {
//             if (this.state.textConfidence < 60) {
//               if (
//                 window.confirm(
//                   "Image is not clear. Please rescan",
//                   this.state.textConfidence
//                 )
//               ) {
//                 this.state.capturedImage.length = 0;
//               } else {
//               }
//             }else{
//               this.state.capturedImage.length = 0;
//             }
//           }
//         );
//       } else if (scannedData.data.text.includes("USPS")) {
//         this.setState({ courierService: "United States Postal Service" });
//         const rectangles = [
//           { left: 73, top: 44, width: 324, height: 90 },
//           {
//             left: 190,
//             top: 134,
//             width: 330,
//             height: 100,
//           },
//         ];
//         console.log(this.state.capturedImage);
//         const results = await Promise.all(
//           rectangles.map((rectangle) =>
//             this.scheduler.addJob("recognize", image, {
//               rectangle,
//             })
//           )
//         );
//         console.log(results.map((r) => r.data.text));
//         // await this.scheduler.terminate();

//         console.log(results);
//         this.setState(
//           {
//             SenderAddress: results[0]["data"].text,
//             ReceiverAddress: results[1]["data"].text,
//             textConfidence:
//               (results[0]["data"].confidence + results[1]["data"].confidence) /
//               2,
//           },
//           () => {
//             if (this.state.textConfidence < 60) {
//               if (
//                 window.confirm(
//                   "Image is not clear. Please rescan",
//                   this.state.textConfidence
//                 )
//               ) {
//                 this.state.capturedImage.length = 0;
//               } else {
//               }
//             }else{
//               this.state.capturedImage.length = 0;
//             }
//           }
//         );
//       } else {
//         alert("CourierService not Detected");
//       }
//     } else {
//       if (
//         window.confirm(
//           "Image is not clear. Please Rescan",
//           this.state.textConfidence
//         )
//       ) {
//         this.state.capturedImage.length = 0;
//       }
//     }
//   };

//   onDetected(result) {
//     // Quagga.pause();
//     console.log(result);
//     const config = {
//       sizeFactor: 1,
//     };
//     let dataUri = this.cameraPhoto.getDataUri(config);

//       this.setState(
//         {
//           // scanning: false,
//           capturedImage: [...this.state.capturedImage, dataUri],
//           barcode: result.codeResult.code,
//         },
//         () => {
//           if (this.state.capturedImage.length === 1) {
//             this.doOCR(this.state.capturedImage[0]);
//           }
//         }
//       );
//   }

//   captureImage() {    
//     const context = this.canvas.getContext("2d")
//     context.drawImage(this.videoStream, 0, 0, 800, 600)
//     const image = this.canvas.toDataURL('image/png', 0.5)
//     return image
//   }

//   takePhoto() {
//     const config = {
//       sizeFactor: 1,
//     };

//     let dataUri = this.cameraPhoto.getDataUri(config);
//     this.setState({ dataUri });

//     // let src = cv.imread('imgCamera');
//     // let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
//     // cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
//     // cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
//     // let contours = new cv.MatVector();
//     // let hierarchy = new cv.Mat();
//     // let poly = new cv.MatVector();
//     // cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
//     // // approximates each contour to polygon
//     // for (let i = 0; i < contours.size(); ++i) {
//     //     let tmp = new cv.Mat();
//     //     let cnt = contours.get(i);
//     //     // You can try more different parameters
//     //     cv.approxPolyDP(cnt, tmp, 3, true);
//     //     poly.push_back(tmp);
//     //     cnt.delete(); tmp.delete();
//     // }
//     // // draw contours with random Scalar
//     // for (let i = 0; i < contours.size(); ++i) {
//     //     let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
//     //                               Math.round(Math.random() * 255));
//     //     cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
//     // }
//     // cv.imshow('canvasOutput', dst);
//     // this.setState({ dataUri });

//     // src.delete(); dst.delete(); hierarchy.delete(); contours.delete(); poly.delete();

//     //bounding rectangle
//     let src1 = cv.imread("imgCamera");
//     let dst1 = cv.Mat.zeros(src1.rows, src1.cols, cv.CV_8UC3);
//     cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
//     cv.threshold(src1, src1, 177, 200, cv.THRESH_BINARY);
//     let contours1 = new cv.MatVector();

//     //console.log("contors = "+valueOf(contours1));
//     let hierarchy1 = new cv.Mat();
//     cv.findContours(
//       src1,
//       contours1,
//       hierarchy1,
//       cv.RETR_CCOMP,
//       cv.CHAIN_APPROX_SIMPLE
//     );

//     let minX, minY, maxX, maxY;
//     let mixXpoint;
//     let maxYpoint;

//     let minX1, maxY1;
//     let mixXpoint1;
//     let maxYpoint1;
//     for (let i = 0; i < contours1.size(); ++i) {
//       let cnt1 = contours1.get(i);
//      // console.log("Shruthi: contours1 value =" + cnt1);
//       let rect = cv.boundingRect(cnt1);
//       //console.log("Shruthi: Rect value =" + rect);
//       if (i === 0) {
//         minX = rect.x;
//         maxY = rect.y;
//       }

//       //Point A
//       if (rect.x > 0 && rect.x <= minX) {
//         //console.log("Shruthi: rect: =" + JSON.stringify(rect));

//         minX = rect.x;
//         minY = rect.y;
//         minX1 = minX;
//         //console.log("Shruthi: Point A: =" + JSON.stringify(rect));
//         mixXpoint = new cv.Point(rect.x, rect.y);
//       }

//       //Point B
//       if (rect.y >= maxY) {
//         maxX = rect.x;
//         maxY = rect.y;
//         maxY1 = maxY;
//         //console.log("Shruthi: Point B: =" + JSON.stringify(rect));
//         maxYpoint = new cv.Point(rect.x, rect.y);
//       }

//       //Point A1
//       if (rect.x >= minX && rect.y <= minY) {
//         minX1 = rect.x;
//         console.log("Shruthi: Point A1: =" + JSON.stringify(rect));
//         mixXpoint1 = new cv.Point(rect.x, rect.y);
//       }

//       //Point B1
//       if (rect.y > 0 && rect.y >= maxY) {
//         maxY1 = rect.y;
//         console.log("Shruthi: Point B1: =" + JSON.stringify(rect));
//         maxYpoint1 = new cv.Point(rect.x, rect.y);
//       }

//       let contoursColor = new cv.Scalar(255, 255, 255);
//       let rectangleColor = new cv.Scalar(255, 0, 0);
//       cv.drawContours(dst1, contours1, 0, contoursColor, 1, 8, hierarchy1, 100);
//       let point1 = new cv.Point(rect.x, rect.y);
//       let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
//       cv.rectangle(dst1, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
//     }
    
//     //green rectangle
//     cv.rectangle(dst1, mixXpoint, maxYpoint, new cv.Scalar(165, 206, 94), 2, cv.LINE_AA, 0);
//     //Magenta rectangle
//     cv.rectangle(dst1, mixXpoint1, maxYpoint1, new cv.Scalar(255, 51, 153), 2, cv.LINE_AA, 0);

//     console.log("mixXpoint: = " + JSON.stringify(mixXpoint));
//     console.log("maxYpoint: = " + JSON.stringify(maxYpoint));
//     console.log("Min X: = " + minX);
//     console.log("Max Y: = " + maxY);

//     console.log("mixXpoint1: = " + JSON.stringify(mixXpoint1));
//     console.log("maxYpoint1: = " + JSON.stringify(maxYpoint1));
//     console.log("Min X1: = " + minX1);
//     console.log("Max Y1: = " + maxY1);

//     cv.imshow("canvasOutput", dst1);
//     src1.delete();
//     dst1.delete();
//     contours1.delete();
//     hierarchy1.delete(); 
//     //cnt1.delete();
//   }

//   render() {
//     return (
//       <div style={{ margin: 10 }}>
//         <div id="interactive" className="viewport">
//           <video ref={this.videoRef} autoPlay style={{ width: "100%" }} />
//           <canvas
//             className="drawingBuffer"
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//             }}
//           ></canvas>
//         </div>
//         <canvas id="photo-frame"
//             className="drawingBuffer"
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//             }}
//           ></canvas>
//         <button
//           onClick={async () => {
//             let facingMode =  FACING_MODES.ENIVORNMENT;
//             this.scan();
//             setTimeout(() => {
//               this.startCameraMaxResolution(facingMode);
//               this.startProcessing();
//             }, 500);
//           }}
//         >
//           Open Scanner
//         </button>

//         <button
//           onClick={() => {
//             this.takePhoto();
//           }}
//         >
//           {" "}
//           Take photo{" "}
//         </button>
//         <img id="imgCamera1" alt="imgCamera1" />
//         <canvas id="canvasOutput"></canvas>
//         <img id="imgCamera" alt="imgCamera" src={label101} />
//         <canvas
//       ref={(canvas) => { this.canvas = canvas }}
//       width='800'
//       height='600'
//       style={{display: 'none'}}
//        />

//         <br />
//         <h4>{this.state.progressText}</h4>
//         <Progress
//           completed={(this.state.progress1 + this.state.progress2) * 50}
//         />{" "}
//         <br />
//         <div>
//           <h3>---------------OCR---------------</h3>
//           <h3>Service: {this.state.courierService}</h3>
//           <h3>Sender's Address: {this.state.SenderAddress}</h3>
//           <h3>Receiver's Address: {this.state.ReceiverAddress}</h3>
//           <h3>confidence: {this.state.textConfidence}</h3>

//           <h3>-------------BARCODE-------------</h3>
//           <h3>Barcode Text: {this.state.barcode}</h3>
//         </div>
//       </div>
//     );
//   }
// }
// export default App;



import React from "react";
import CameraPhoto, { FACING_MODES } from "jslib-html5-camera-photo";
import cv from "opencv.js";
import label101 from "./assets/label101.jpg";

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.cameraPhoto = null;
    this.videoRef = React.createRef();
    this.state = {
      dataUri: "",
    };
  }

  componentDidMount() {
    // We need to instantiate CameraPhoto inside componentDidMount because we
    // need the refs.video to get the videoElement so the component has to be
    // mounted.
    this.cameraPhoto = new CameraPhoto(this.videoRef.current);
  }

  startCamera(idealFacingMode, idealResolution) {
    this.cameraPhoto
      .startCamera(idealFacingMode, idealResolution)
      .then(() => {
        console.log("camera is started !");
      })
      .catch((error) => {
        console.error("Camera not started!", error);
      });
  }

  startCameraMaxResolution(idealFacingMode) {
    this.cameraPhoto
      .startCameraMaxResolution(idealFacingMode)
      .then(() => {
        console.log("camera is started !");
      })
      .catch((error) => {
        console.error("Camera not started!", error);
      });
  }

  takePhoto() {
    const config = {
      sizeFactor: 1,
    };

    let dataUri = this.cameraPhoto.getDataUri(config);
    this.setState({ dataUri });

    // let src = cv.imread('imgCamera');
    // let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    // cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    // cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    // let contours = new cv.MatVector();
    // let hierarchy = new cv.Mat();
    // let poly = new cv.MatVector();
    // cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    // // approximates each contour to polygon
    // for (let i = 0; i < contours.size(); ++i) {
    //     let tmp = new cv.Mat();
    //     let cnt = contours.get(i);
    //     // You can try more different parameters
    //     cv.approxPolyDP(cnt, tmp, 3, true);
    //     poly.push_back(tmp);
    //     cnt.delete(); tmp.delete();
    // }
    // // draw contours with random Scalar
    // for (let i = 0; i < contours.size(); ++i) {
    //     let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
    //                               Math.round(Math.random() * 255));
    //     cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
    // }
    // cv.imshow('canvasOutput', dst);
    // this.setState({ dataUri });

    // src.delete(); dst.delete(); hierarchy.delete(); contours.delete(); poly.delete();

    //bounding rectangle
    let src1 = cv.imread("imgCamera");
    let dst1 = cv.Mat.zeros(src1.rows, src1.cols, cv.CV_8UC3);
    cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src1, src1, 177, 200, cv.THRESH_BINARY);
    let contours1 = new cv.MatVector();

    //console.log("contors = "+valueOf(contours1));
    let hierarchy1 = new cv.Mat();
    cv.findContours(
      src1,
      contours1,
      hierarchy1,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    let minX, minY, maxX, maxY;
    let mixXpoint;
    let maxYpoint;

    let minX1, maxY1;
    let mixXpoint1;
    let maxYpoint1;
    for (let i = 0; i < contours1.size(); ++i) {
      let cnt1 = contours1.get(i);
     // console.log("Shruthi: contours1 value =" + cnt1);
      let rect = cv.boundingRect(cnt1);
      //console.log("Shruthi: Rect value =" + rect);
      if (i === 0) {
        minX = rect.x;
        maxY = rect.y;
      }

      //Point A
      if (rect.x > 0 && rect.x <= minX) {
        //console.log("Shruthi: rect: =" + JSON.stringify(rect));

        minX = rect.x;
        minY = rect.y;
        minX1 = minX;
        //console.log("Shruthi: Point A: =" + JSON.stringify(rect));
        mixXpoint = new cv.Point(rect.x, rect.y);
      }

      //Point B
      if (rect.y >= maxY) {
        maxX = rect.x;
        maxY = rect.y;
        maxY1 = maxY;
        //console.log("Shruthi: Point B: =" + JSON.stringify(rect));
        maxYpoint = new cv.Point(rect.x, rect.y);
      }

      //Point A1
      if (rect.x >= minX && rect.y <= minY) {
        minX1 = rect.x;
        console.log("Shruthi: Point A1: =" + JSON.stringify(rect));
        mixXpoint1 = new cv.Point(rect.x, rect.y);
      }

      //Point B1
      if (rect.y > 0 && rect.y >= maxY) {
        maxY1 = rect.y;
        console.log("Shruthi: Point B1: =" + JSON.stringify(rect));
        maxYpoint1 = new cv.Point(rect.x, rect.y);
      }

      let contoursColor = new cv.Scalar(255, 255, 255);
      let rectangleColor = new cv.Scalar(255, 0, 0);
      cv.drawContours(dst1, contours1, 0, contoursColor, 1, 8, hierarchy1, 100);
      let point1 = new cv.Point(rect.x, rect.y);
      let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
      cv.rectangle(dst1, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
    }
    
    //green rectangle
    cv.rectangle(dst1, mixXpoint, maxYpoint, new cv.Scalar(165, 206, 94), 2, cv.LINE_AA, 0);
    //Magenta rectangle
    cv.rectangle(dst1, mixXpoint1, maxYpoint1, new cv.Scalar(255, 51, 153), 2, cv.LINE_AA, 0);

    console.log("mixXpoint: = " + JSON.stringify(mixXpoint));
    console.log("maxYpoint: = " + JSON.stringify(maxYpoint));
    console.log("Min X: = " + minX);
    console.log("Max Y: = " + maxY);

    console.log("mixXpoint1: = " + JSON.stringify(mixXpoint1));
    console.log("maxYpoint1: = " + JSON.stringify(maxYpoint1));
    console.log("Min X1: = " + minX1);
    console.log("Max Y1: = " + maxY1);

    cv.imshow("canvasOutput", dst1);
    src1.delete();
    dst1.delete();
    contours1.delete();
    hierarchy1.delete(); 
    //cnt1.delete();
  }

  stopCamera() {
    this.cameraPhoto
      .stopCamera()
      .then(() => {
        console.log("Camera stoped!");
      })
      .catch((error) => {
        console.log("No camera to stop!:", error);
      });
  }

  render() {
    return (
      <div>
        <button
          onClick={() => {
            let facingMode = FACING_MODES.ENVIRONMENT;
            let idealResolution = { width: 640, height: 480 };
            this.startCamera(facingMode, idealResolution);
          }}
        >
          {" "}
          Start Scanning{" "}
        </button>

        <button
          onClick={() => {
            this.takePhoto();
          }}
        >
          {" "}
          Take photo{" "}
        </button>

        <button
          onClick={() => {
            this.stopCamera();
          }}
        >
          {" "}
          Stop{" "}
        </button>

        <video ref={this.videoRef} />
        <img id="imgCamera1" alt="imgCamera1" />
        <canvas id="canvasOutput"></canvas>
        <img id="imgCamera" alt="imgCamera" src={label101} />
      </div>
    );
  }
}

export default App;