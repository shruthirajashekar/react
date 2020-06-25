import React from "react";
import CameraPhoto, { FACING_MODES } from "jslib-html5-camera-photo";
import cv from "opencv.js";
import { createWorker, createScheduler, PSM } from "tesseract.js";
import label101 from "./assets/label101.jpg";
import img1 from "./assets/img1.png";
import img2 from "./assets/img2.png";
import img3 from "./assets/img3.png";
import img4 from "./assets/img4.png";

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
    this.cameraPhoto = new CameraPhoto(this.videoRef.current);
  }

  doOCRAndParseText(serviceType) {
    console.log("Inside doOCRAndParseText: Service Type = " + serviceType);

      switch (serviceType) {
        case "FedEx":
          const scheduler = createScheduler();
          const worker1 = createWorker({
            logger: (m) => {
              console.log(m);
            },
          });

          (async () => {
            await worker1.load();
            await worker1.loadLanguage("eng");
            await worker1.initialize("eng");
            await worker1.setParameters({
              tessjs_create_hocr: 1,
              tessedit_pageseg_mode: PSM.AUTO,
            });

            await scheduler.addWorker(worker1);

            const scannedDataFrom = await worker1.recognize(img4, {
              rectangles: [{ top: 7, left: 10, width: 300, height: 130 }],
            });
            
            const scannedDataTo = await worker1.recognize(img4, {
              rectangles: [{ top: 120, left: 10, width: 400, height: 250 }],
            });

            console.log("From Address============" + scannedDataFrom.data.text);
            console.log("To Address ============" + scannedDataTo.data.text);

            alert("Address = "+ scannedDataFrom.data.text);

            console.log("Lines ============\n" + scannedDataTo.data.lines);
          })();
          break;

        case "ups":
          const upsScheduler = createScheduler();
          const upsWorker = createWorker({
            logger: (m) => {
              console.log(m);
            },
          });
          (async () => {
            await upsWorker.load();
            await upsWorker.loadLanguage("eng");
            await upsWorker.initialize("eng");
            await upsWorker.setParameters({
              tessjs_create_hocr: 1,
              tessedit_pageseg_mode: PSM.AUTO,
            });

            await upsScheduler.addWorker(upsWorker);

            const scannedDataFrom = await upsWorker.recognize(img2, {
              rectangles: [
                { top: 7, left: 10, width: 300, height: 130 },
              ],
            }); 
         
            console.log("From Address============" + scannedDataFrom.data.text);

            // const scannedDataTo = await upsWorker.recognize(img2, {
            //   rectangles: [{ top: 120, left: 10, width: 400, height: 250 }],
            // });
            // console.log("To Address============" + scannedDataTo.data.text);
          })();
          break;
        default:

            const defaultScheduler = createScheduler();
    const defaultworker = createWorker({
      logger: (m) => {
        console.log(m);
      },
    });

    (async () => {
      await defaultworker.load();
      await defaultworker.loadLanguage("eng");
      await defaultworker.initialize("eng");
      await defaultworker.setParameters({
        tessjs_create_hocr: 1,
        tessedit_pageseg_mode: PSM.AUTO,
      });

      await defaultScheduler.addWorker(defaultworker);
      const scannedData = await defaultworker.recognize(img4);
      console.log("Shruthi existing Data============" + scannedData.data.text);
      alert("Address = " + scannedData.data.text);
  })();
          break;
      }
      
  //  })();
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

    let minX, maxY, minimumY;
    //let mixXpoint;
   // let maxYpoint;

   // let secondPointA, secondPointB;
    const xValues = [];
    const yValues = [];
    const xyValues = [];

    console.log("Shruthi: total contours =" + contours1.size());
    for (let i = 0; i < contours1.size(); ++i) {
      let cnt1 = contours1.get(i);
      let rect = cv.boundingRect(cnt1);
      xValues.push(rect.x);
      yValues.push(rect.y);
      xyValues.push(rect);
      if (i === 0) {
        minX = rect.x;
        maxY = rect.y;
      }

      //Point A
      if (rect.x > 0 && rect.x <= minX) {
        minX = rect.x;
    //    mixXpoint = new cv.Point(rect.x, rect.y);
      }

      if (rect.y > 0 && rect.y <= maxY) {
        minimumY = rect.y;
      }

      //Point B
      if (rect.y >= maxY) {
        maxY = rect.y;
      }

      let contoursColor = new cv.Scalar(255, 255, 255);
      let rectangleColor = new cv.Scalar(255, 0, 0);
      cv.drawContours(dst1, contours1, 0, contoursColor, 1, 8, hierarchy1, 100);
      let point1 = new cv.Point(rect.x, rect.y);
      let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
      cv.rectangle(dst1, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
    }

    //green rectangle
   // cv.rectangle(dst1, mixXpoint, maxYpoint, new cv.Scalar(165, 206, 94), 2, cv.LINE_AA, 0);
    //Magenta rectangle
    //cv.rectangle(dst1, mixXpoint1, maxYpoint1, new cv.Scalar(255, 51, 153), 2, cv.LINE_AA, 0);
    console.log("Min = " +
        JSON.stringify(
          xyValues.filter((a) => {
            return (
              a.x ===
              Math.min.apply(
                Math,
                xyValues.map((i) => i.x)
              )
            );
          })
        )
    );
    var minXPoint = JSON.stringify(
      xyValues.filter((a) => {
        return (
          a.x ===
          Math.max.apply(
            Math,
            xyValues.map((i) => i.x)
          )
        );
      })
    );
 
    var stringify = JSON.parse(minXPoint);
    var x = stringify[0]["x"];

    var maxYPoint = JSON.stringify(
      xyValues.filter((a) => {
        return (
          a.y ===
          Math.max.apply(
            Math,
            xyValues.map((i) => i.y)
          )
        );
      })
    );
    var stringify1 = JSON.parse(maxYPoint);
    var y1 = stringify1[0]["y"];
   // secondPointB = new cv.Point(x1, y1);
    //Create a point with Max X and Max Y values
    let rectLastPoint = new cv.Point(x, y1);
    console.log("rectLastPoint: = " + JSON.stringify(rectLastPoint));

    //blue rectangle
    //cv.rectangle(dst1, new cv.Point(14,54), new cv.Point(700,614), new cv.Scalar(0, 0, 204), 2, cv.LINE_AA, 0);
    // cv.rectangle(dst1, mixXpoint, rectLastPoint, new cv.Scalar(0, 0, 204), 2, cv.LINE_AA, 0);

    //console.log("Minium Y = " + minimumY);
    cv.rectangle(
      dst1,
      new cv.Point(minX, minimumY),
      rectLastPoint,
      new cv.Scalar(0, 0, 204),
      2,
      cv.LINE_AA,
      0
    );

    var dimensions = x + " " + y1;
    console.log("Dimensions: x ====" + x);
    console.log("Dimensions: y ====" + y1);
    console.log("Dimensions ====" + dimensions);
    switch (dimensions) {
      case "238 426":
        console.log("Template is DHL......................");
        alert("Service Provider : DHL");
        this.doOCRAndParseText();
        break;
      case "260 325":
        console.log("Template is UPS......................");
        alert("Service Provider : UPS");
        this.doOCRAndParseText("ups", 315, 304, 250, 50);
        break;
      case "250 420":
        console.log("Template is Pro Acousics......................");
        alert("Service Provider : Pro Acousics");
        this.doOCRAndParseText();
        break;
      case "644 491":
        console.log("Template is FedEx Express......................");
        alert("Service Provider : FedEx Express");
        this.doOCRAndParseText("FedEx");
        break;
      default:
        console.log("Default case in switch......................");
        this.doOCRAndParseText();
    }

    cv.imshow("canvasOutput", dst1);
    src1.delete();
    dst1.delete();
    contours1.delete();
    hierarchy1.delete();
    //cnt1.delete();

    //DHL: 238*426
    //UPS: 260*325
    //Pro Acoustics: 250*420
    //FedEx: 644 491
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
        <img id="imgCamera" alt="imgCamera" src={img4} />
        <canvas id="canvasOutput"></canvas>
      </div>
    );
  }
}

export default App;
