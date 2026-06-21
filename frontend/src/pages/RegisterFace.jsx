import { useState, useRef, useEffect} from "react";

import {showSuccess, showError, showWarning} from "../utils/alert";

import { useNavigate } from "react-router-dom";

import { registerFace } from "../services/faceService";
import Sidebar from "../components/Sidebar";

import * as faceapi from "face-api.js";

function RegisterFace() {

  const navigate = useNavigate();

  const [faceDetected,
  setFaceDetected] =
  useState(false);

  const [faceInsideScanner,
  setFaceInsideScanner] =
  useState(false);

  const [cameraOpen,
  setCameraOpen] =
  useState(false);

  const [countdown,
  setCountdown] =
  useState(null);

  const [faceStable,
  setFaceStable] =
  useState(false);

  const [capturing,
  setCapturing] =
  useState(false);

  const [photo, setPhoto] = useState(null);

  const [currentPose,
    setCurrentPose] =
    useState("front");

  const poses = [
    "front",
    "left",
    "right",
    "mouth_open"
  ];

  useEffect(() => {
  loadFaceModel();
  }, []);

  useEffect(() => {

    console.log({

  faceDetected,

  faceInsideScanner,

  faceStable,

  capturing,

  photo

});

      if (

        !faceInsideScanner ||

        !faceStable

      ) 
      
      {

      if (countdownRef.current) {

        clearInterval(
          countdownRef.current
        );

      }

      setCountdown(null);

      setCapturing(false);

      return;

    }

    if (photo)
      return;

    if (capturing)
      return;

    setCapturing(true);

    let count = 3;

    setCountdown(count);

    countdownRef.current =
      setInterval(() => {

        count--;

        setCountdown(count);

        if (count <= 0) {

          clearInterval(
            countdownRef.current
          );

          capturePhoto();

          setCountdown(null);

          setCapturing(false);

        }

      }, 1000);

    return () => {

      if (countdownRef.current) {

        clearInterval(
          countdownRef.current
        );

      }

    };

    }, [

      faceInsideScanner,

      faceStable,

      photo

    ]);
  
  useEffect(() => {

  if (

    !faceDetected ||

    !faceInsideScanner

  ) {

    setFaceStable(false);

    if (stableRef.current) {

      clearTimeout(
        stableRef.current
      );

    }

    return;

  }

  stableRef.current =
    setTimeout(() => {

      setFaceStable(true);

    }, 2000);

  return () => {

    if (stableRef.current) {

      clearTimeout(
        stableRef.current
      );

    }

  };

}, [

  faceDetected,

  faceInsideScanner

]);


  const loadFaceModel = async () => {

      try {

        await faceapi.nets
          .tinyFaceDetector
          .loadFromUri(
            "/models"
          );

        console.log(
          "Face model loaded"
        );

      } catch (error) {

        console.log(error);

      }

    };


const videoRef =
  useRef(null);

const canvasRef =
  useRef(null);

const trackingRef =
  useRef(null);
  
const countdownRef =
  useRef(null);

const stableRef =
  useRef(null);

const scannerArea = cameraOpen
  ? {
      width:
        (videoRef.current?.clientWidth || 300) * 0.45,

      height:
        (videoRef.current?.clientHeight || 250) * 0.70,

      x:
        ((videoRef.current?.clientWidth || 300) / 2) -
        (((videoRef.current?.clientWidth || 300) * 0.45) / 2),

      y:
        (videoRef.current?.clientHeight || 250) * 0.08
    }
  : {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    };

const startFaceTracking = () => {

  if (trackingRef.current) {

    clearInterval(
      trackingRef.current
    );

  }

  trackingRef.current =
    setInterval(

      async () => {

      if (
        !videoRef.current
      ) return;

      const detection =
        await faceapi.detectSingleFace(

          videoRef.current,

          new faceapi
          .TinyFaceDetectorOptions()

        );

      if (!detection) {

        setFaceDetected(
          false
        );

        setFaceInsideScanner(
          false
        );

        return;

      }

      setFaceDetected(
        true
      );

      const box =
        detection.box;

      const scaleX =

        videoRef.current.clientWidth /

        videoRef.current.videoWidth;

      const scaleY =

        videoRef.current.clientHeight /

        videoRef.current.videoHeight;

      const centerX =

        (box.x + box.width / 2)

        * scaleX;

      const centerY =

        (box.y + box.height / 2)

        * scaleY;

      const currentVideoWidth =
        videoRef.current.clientWidth;

      const currentVideoHeight =
        videoRef.current.clientHeight;

      const scannerWidth =
        currentVideoWidth * 0.45;

      const scannerHeight =
        currentVideoHeight * 0.70;

      const scannerCenterX =
        currentVideoWidth / 2;

      const scannerCenterY =
        currentVideoHeight * 0.43;

      const toleranceX =
        scannerWidth * 0.35;

      const toleranceY =
        scannerHeight * 0.35;

console.log({

  centerX,
  centerY,

  scannerCenterX,
  scannerCenterY,

  toleranceX,
  toleranceY

});

      const insideScanner =

        Math.abs(
          centerX - scannerCenterX
        ) < toleranceX &&

        Math.abs(
          centerY - scannerCenterY
        ) < toleranceY;

        console.log({

        centerX,
        centerY,

        scannerCenterX,
        scannerCenterY,

        toleranceX,
        toleranceY,

        insideScanner

      });

      setFaceInsideScanner(
        insideScanner
      );

    },

    500

  );

};

  const [photoFile, setPhotoFile] = useState(null);

  const openCamera = async () => {

    setPhoto(null);

    setPhotoFile(null);

    setFaceDetected(false);

    setFaceInsideScanner(false);

    setFaceStable(false);

    setCountdown(null);

    setCapturing(false);

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: "user"
          },

          audio: false
        });

        videoRef.current.srcObject = stream;

        setCameraOpen(true);
        startFaceTracking();

    } catch (error) {

      console.log(error);

      showError(
        "Kamera tidak dapat diakses"
      );
    }
  };

  const capturePhoto = () => {

    if (!videoRef.current) {

      showWarning(
        "Buka kamera terlebih dahulu"
      );

      return;
    }

    if (!canvasRef.current) {

      return;
    }

    const video = videoRef.current;

    if (
        video.videoWidth === 0
      ) {

        showWarning(
          "Tunggu kamera siap"
        );

        return;
      }

    const canvas = canvasRef.current;

    const context =
      canvas.getContext("2d");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas.toDataURL(
        "image/jpeg"
      );

    setPhoto(imageData);

    canvas.toBlob(

      (blob) => {

        const file = new File(
          [blob],
          "face.jpg",
          {
            type:
              "image/jpeg"
          }
        );

        setPhotoFile(file);

      },

      "image/jpeg"
    );

    const stream =
      video.srcObject;

    if (stream) {

      stream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

        setCameraOpen(false);

        if (trackingRef.current) {

        clearInterval(
          trackingRef.current
        );

      }

    }
  };

  const handleRegister = async () => {

      try {

        if (!photoFile) {

          showWarning(
            "Ambil foto terlebih dahulu"
          );

          return;
        }

        console.log(
  "POSE:",
  currentPose
);
        const result =
          await registerFace(
            photoFile,
            currentPose
          );

          console.log(
  "RESPONSE BACKEND:",
  result
);

        showSuccess(
          `${currentPose} berhasil disimpan`
        );

        const currentIndex =
          poses.indexOf(
            currentPose
          );

        if (
          currentIndex <
          poses.length - 1
        ) {

          setCurrentPose(
            poses[
              currentIndex + 1
            ]
          );

          console.log(
          "POSE SEKARANG:",
          currentPose
        );

        console.log(
          "POSE BERIKUTNYA:",
          poses[currentIndex + 1]
        );

          setPhoto(null);

          setPhotoFile(null);

          return;

        }

        showSuccess(
          "Registrasi wajah selesai"
        );

        navigate(
          "/dashboard"
        );

        const stream =
          videoRef.current?.srcObject;

        if (stream) {

          stream
            .getTracks()
            .forEach(track =>
              track.stop()
            );

}

      } catch (error) {

  console.log(
    "ERROR REGISTER:",
    error
  );

  console.log(
    error?.response?.data
  );

  showWarning(
    "Registrasi gagal"
  );
}
    };

return (

  <div className="layout">

    <Sidebar />

    <div className="main-content">

      <div className="card">

        <h1>
          Registrasi Wajah
        </h1>

        <p>
          Pastikan wajah terlihat jelas
          dan berada di tengah kamera.
        </p>

        <br />

        <p>

          Status Foto :

          {
            photo
              ? " ✅ Siap didaftarkan"
              : " ❌ Belum ada foto"
          }

        </p>

        <br />

        <ul
          style={{
            textAlign: "left",
            maxWidth: "500px",
            margin: "0 auto"
          }}
        >

          <li>
            Gunakan pencahayaan yang cukup
          </li>

          <li>
            Lepaskan penutup wajah
          </li>

          <li>
            Hadapkan wajah ke kamera
          </li>

          <li>
            Ambil foto dengan posisi stabil
          </li>

        </ul>

      </div>

      <div className="card">

      <h3>
        Kamera Selfie
      </h3>

      <h2>

      {
        currentPose === "front" &&
        "➡️ Hadapkan wajah ke depan"
      }

      {
        currentPose === "left" &&
        "⬅️ Putar kepala ke kiri"
      }

      {
        currentPose === "right" &&
        "➡️ Putar kepala ke kanan"
      }

      {
        currentPose === "mouth_open" &&
        "😮 Buka mulut"
      }

      </h2>

      <div
        style={{
          position: "relative",
          display: "inline-block"
        }}
      >

  <video
    ref={videoRef}
    autoPlay
    playsInline
    style={{
      width: "100%",
      maxWidth: "600px",
      borderRadius: "12px"
    }}
  />

  {
    cameraOpen && (

      <div
        style={{

          position:
            "absolute",

          left:
            scannerArea.x,

          top:
            scannerArea.y,

          width:
            scannerArea.width,

          height:
            scannerArea.height,

          border:

            faceInsideScanner

              ? "4px solid #22c55e"

              : "4px dashed #94a3b8",

          borderRadius:
            "50%",

          transition:
            ".3s",

          pointerEvents:
            "none"

        }}
      />

    )
  }

  {
  cameraOpen && (

    <div
      style={{
        textAlign:
          "center",
        marginTop:
          "15px"
      }}
    >

      {
        !faceDetected ? (

          <h3>
            🔴 Wajah tidak terdeteksi
          </h3>

        ) : !faceInsideScanner ? (

          <h3>
            🟡 Posisikan wajah di tengah
          </h3>

        ) : !faceStable ? (

          <h3>
            ⏳ Tahan posisi wajah...
          </h3>

        ) : (

          <h3>
            🟢 Wajah stabil
          </h3>

        )
      }

      {
        countdown && (

          <h1
            style={{
              color: "#2563eb",
              marginTop: "10px"
            }}
          >
            📸 {countdown}
          </h1>

        )
      }

    </div>

  )
}

</div>

        <canvas
          ref={canvasRef}
          style={{
            display: "none"
          }}
        />

        <br />
        <br />

      {
        !cameraOpen && (

          <button
            className="btn"
            onClick={openCamera}
          >
            📷 Buka Kamera
          </button>

        )
      }

      </div>

      {
        photo && (

          <div className="card">

            <h3>
              Preview Selfie
            </h3>

            <br />

            <img
              src={photo}
              alt="Preview"
              width="400"
              style={{
                borderRadius: "10px",
                maxWidth: "100%"
              }}
            />

            <br />
            <br />

            <button
              className="btn btn-success"
              onClick={handleRegister}
            >
              ✅ Simpan Wajah
            </button>

          </div>

        )
      }

    </div>

  </div>

);
}

export default RegisterFace;