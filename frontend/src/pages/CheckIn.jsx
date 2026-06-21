import { useEffect, useState, useRef } from "react";
import { getProfile } from "../services/authService";
import { checkIn } from "../services/attendanceService";
import * as faceapi from "face-api.js";
import Sidebar from "../components/Sidebar";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  getGeofence
} from "../services/attendanceService";

import {
  showSuccess,
  showError,
  showWarning
} from "../utils/alert";

import {
  FaceLandmarker,
  FilesetResolver
}
from "@mediapipe/tasks-vision";


function CheckIn() {

  const [modelsLoaded, setModelsLoaded] =
  useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

const videoRef = useRef(null);

const canvasRef = useRef(null);

const trackingRef = useRef(null);

const faceLandmarkerRef =
  useRef(null);

const faceInsideScannerRef =
  useRef(false);

const faceDetectedRef =
  useRef(false);

const livenessPassedRef =
  useRef(false);

  const [faceBox, setFaceBox] =
  useState(null);

  const [faceInsideScanner,
  setFaceInsideScanner] =
  useState(false);

  const [geofence, setGeofence] =
  useState(null);

  const [distance, setDistance] =
  useState(null);

  const [insideArea, setInsideArea] =
  useState(false);

  const [faceDetected, setFaceDetected] =
  useState(false);

  const [cameraOpen, setCameraOpen] =
  useState(false);

  const [lastFacePosition,
  setLastFacePosition] =
  useState(null);

  const [challenge,
  setChallenge] =
  useState(null);

  const [livenessPassed,
  setLivenessPassed] =
  useState(false);


useEffect(() => {

  checkFaceRegistration();

  loadGeofence();

  loadFaceModel();

  initFaceLandmarker();

}, []);

 
useEffect(() => {

  if (
    !cameraOpen ||
    !videoRef.current
  ) return;

  const video =
    videoRef.current;

  video.onloadedmetadata =
    () => {

      if (modelsLoaded) {

        startFaceTracking();

      }

      startLivenessDetection();

    };

}, [cameraOpen]);

const loadFaceModel = async () => {

    try {

      await faceapi.nets
        .tinyFaceDetector
        .loadFromUri(
          "/models"
        );

      setModelsLoaded(true);

      console.log(
        "Face model loaded"
      );

    } catch (error) {

      console.log(error);
    }
};

const initFaceLandmarker = async () => {

  const vision =

    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

  const faceLandmarker =

    await FaceLandmarker.createFromOptions(
      vision,
      {

        baseOptions: {

          modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"

        },

        outputFaceBlendshapes: true,

        runningMode: "VIDEO",

        numFaces: 1

      }
    );

  faceLandmarkerRef.current =
    faceLandmarker;



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
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detection) {

          const box =
            detection.box;

          const centerX =
            box.x +
            box.width / 2;

          const centerY =
            box.y +
            box.height / 2;

          if (lastFacePosition) {

            const movement =

              Math.sqrt(

                Math.pow(
                  centerX -
                  lastFacePosition.x,
                  2
                ) +

                Math.pow(
                  centerY -
                  lastFacePosition.y,
                  2
                )

              );
          }

          setLastFacePosition({

            x: centerX,

            y: centerY

          });

          setFaceBox({

            x: box.x,
            y: box.y,

            width: box.width,
            height: box.height

          });

          if (
            !videoRef.current ||
            !videoRef.current.videoWidth ||
            !videoRef.current.videoHeight
          ) {
            return;
          }

          const scaleX =
            videoRef.current.clientWidth /
            videoRef.current.videoWidth;

          const scaleY =
            videoRef.current.clientHeight /
            videoRef.current.videoHeight;

          const faceCenterX =
            (box.x + box.width / 2) *
            scaleX;

          const faceCenterY =
            (box.y + box.height / 2) *
            scaleY;

          const scannerArea =
            getScannerArea();

          const scannerCenterX =
            scannerArea.x +
            (scannerArea.width / 2);

          const scannerCenterY =
            scannerArea.y +
            (scannerArea.height / 2);

          const toleranceX =
            scannerArea.width * 0.15;

          const toleranceY =
            scannerArea.height * 0.15;

          const insideScanner =

            Math.abs(
              faceCenterX -
              scannerCenterX
            ) < toleranceX &&

            Math.abs(
              faceCenterY -
              scannerCenterY
            ) < toleranceY;

              faceInsideScannerRef.current =
                insideScanner;

              setFaceInsideScanner(
                insideScanner
              );

            faceDetectedRef.current =
              true;

            setFaceDetected(
              true
            );

            } else {

              faceDetectedRef.current =
                false;

              setFaceDetected(false);

              setFaceInsideScanner(false);

              setFaceBox(null);

            }

      },
      500
    );

};


const checkFaceRegistration = async () => {

    try {

      const profile =
        await getProfile();

      if (
        !profile.user.face_registered
      ) {

        window.location.href =
          "/register-face";

        return;
      }

    } catch (error) {

      console.log(error);
    }
};

const loadGeofence = async () => {

    try {

      const result =
        await getGeofence();

      setGeofence(
        result.data
      );

    } catch (error) {

      console.log(error);
    }
  };

const getLocation = () => {

    navigator.geolocation.getCurrentPosition(

      (position) => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      setLatitude(lat);
      setLongitude(lng);

      if (geofence) {

        const dist =
          calculateDistance(
            lat,
            lng,
            geofence.latitude,
            geofence.longitude
          );

        setDistance(dist);

        setInsideArea(
          dist <= geofence.radius_meter
        );
      }

      },

      (error) => {

        showWarning(
          "Gagal mengambil lokasi"
        );

        console.log(error);
      }

    );

  };

const checkChallenge = (result) => {


  if (!faceInsideScannerRef.current)
    return;

  if (!faceDetectedRef.current)
    return;

  if (
    livenessPassedRef.current
  )
    return;

  const landmarks =
    result.faceLandmarks[0];

  const nose =
    landmarks[1];

  const leftCheek =
    landmarks[234];

  const rightCheek =
    landmarks[454];

  const faceCenter =

    (
      leftCheek.x +
      rightCheek.x
    ) / 2;

  const offset =

    nose.x -
    faceCenter;

  const upperLip =
    landmarks[13];

  const lowerLip =
    landmarks[14];

  const mouthGap =
    Math.abs(
      upperLip.y -
      lowerLip.y
    );

    console.log(
  "MOUTH GAP",
  mouthGap
);

  if (

    challenge ===
    "LOOK_LEFT" &&

    offset < -0.03

  ) {

    showSuccess(
      "Kepala ke kiri terdeteksi"
    );

    completeLiveness();
  }

  if (

    challenge ===
    "LOOK_RIGHT" &&

    offset > 0.03

  ) {

      showSuccess(
        "Kepala ke kanan terdeteksi"
      );

      completeLiveness();

  }

  console.log({
  challenge,
  offset,
  mouthGap
});

  if (

    challenge ===
    "OPEN_MOUTH" &&

    mouthGap > 0.03

  ) {

    showSuccess(
      "Mulut terbuka terdeteksi"
    );

    completeLiveness();

  }

};

const startLivenessDetection = () => {

  const detect = () => {

    if (
      !videoRef.current ||
      videoRef.current.videoWidth === 0
    ) {

      requestAnimationFrame(
        detect
      );

      return;
    }

    const result =
      faceLandmarkerRef.current
      .detectForVideo(
        videoRef.current,
        performance.now()
      );

if (

  result.faceLandmarks &&

  result.faceLandmarks.length > 0 &&

  faceInsideScannerRef.current

)

{
  
  checkChallenge(
    result
  );

}

    requestAnimationFrame(
      detect
    );

  };

  detect();

};

const openCamera = async () => {

  try {

    // Reset state lama

    setPhoto(null);

    setPhotoFile(null);

    livenessPassedRef.current =
      false;

    setLivenessPassed(false);

    setFaceInsideScanner(false);

    faceDetectedRef.current =
      false;

    setFaceDetected(false);

    const stream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: "user"
        },

        audio: false
      });

    setCameraOpen(true);

    setTimeout(() => {

      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

      }

        }, 100);

    livenessPassedRef.current =
      false;

    setLivenessPassed(false);

    const challenges = [

      "LOOK_LEFT",

      "LOOK_RIGHT",

      "OPEN_MOUTH"

    ];

    const randomChallenge =

      challenges[
        Math.floor(
          Math.random() *
          challenges.length
        )
      ];

    setChallenge(
      randomChallenge
    );

    if (modelsLoaded) {

    }

  } catch (error) {

    console.error(error);

    showWarning(
      "Kamera tidak dapat diakses"
    );

  }

};

const capturePhoto = () => {

  if (!videoRef.current) {

    return;
  }

  if (!canvasRef.current) {

    return;
  }

    const video = videoRef.current;

    const canvas = canvasRef.current;

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas.toDataURL("image/jpeg");

    setPhoto(imageData);

    canvas.toBlob(

      (blob) => {

        const file = new File(
          [blob],
          "checkin.jpg",
          {
            type: "image/jpeg"
          }
        );

        setPhotoFile(file);

        showSuccess(
        "Foto berhasil diambil"
      );

      },

      "image/jpeg"
    );
  };

  const stopCamera = () => {

  const stream =
    videoRef.current?.srcObject;

  if (stream) {

    stream
      .getTracks()
      .forEach(track =>
        track.stop()
      );

  }

  if (videoRef.current) {

    videoRef.current.srcObject =
      null;

  }

  setCameraOpen(false);

  faceDetectedRef.current =
  false;

  setFaceDetected(false);

  setFaceInsideScanner(false);

};

const completeLiveness = () => {

  if (
    livenessPassedRef.current
  ) return;

  livenessPassedRef.current =
    true;

  setLivenessPassed(true);

  showSuccess(
    "Verifikasi berhasil"
  );

setTimeout(() => {

  capturePhoto();

  setTimeout(() => {

    stopCamera();

  }, 200);

}, 300);

};

const getScannerArea = () => {

  const videoWidth =
    videoRef.current?.clientWidth || 300;

  const videoHeight =
    videoRef.current?.clientHeight || 250;

  return {

    width:
      videoWidth * 0.40,

    height:
      videoHeight * 0.65,

    x:
      (videoWidth * 0.50) -
      (videoWidth * 0.40 / 2),

    y:
      videoHeight * 0.08

  };

};

  const handleCheckIn = async () => {

    try {

      if (!latitude || !longitude) {

        showWarning(
          "Ambil lokasi terlebih dahulu"
        );

        return;
      }


      if (!livenessPassed) {

        showWarning(
          "Verifikasi wajah belum berhasil"
        );

        return;
      }

      if (!photoFile) {

      showWarning(
        "Ambil foto terlebih dahulu"
      );

        return;
      }

const result = await checkIn(
  photoFile,
  latitude,
  longitude
);

console.log(result);

if (result.success) {

  showSuccess(
    result.message
  );

} else {

  showError(
    result.message
  );

  return;

} 
} catch (error) {

  console.log(error);

  if (
    error.response &&
    error.response.data
  ) {

    showError(
      error.response.data.message
    );

  } else {

    showError(
      "Check In gagal"
    );

  }

}

};
  const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {

  const R = 6371000;

  const dLat =
    (lat2 - lat1) *
    Math.PI / 180;

  const dLon =
    (lon2 - lon1) *
    Math.PI / 180;

  const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

    Math.cos(
      lat1 * Math.PI / 180
    ) *

    Math.cos(
      lat2 * Math.PI / 180
    ) *

    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

const scannerArea =
  getScannerArea();

return (

  <div className="layout">

    <Sidebar />

    <div className="main-content">

      {/* HEADER */}

      <div className="card">

        <h1>
          Absensi Kehadiran
        </h1>

        <p
          style={{
            color: "#666"
          }}
        >
          Ambil lokasi dan foto selfie
          sebelum melakukan absensi.
        </p>

      </div>

      {/* MAP GEOFENCE */}

      {
        geofence && (

          <div className="card">

            <h3>
              📍 Area Absensi
            </h3>

            <p
              style={{
                color: "#666",
                marginTop: "5px"
              }}
            >
              {geofence.nama_lokasi}
            </p>

            <p
              style={{
                color: "#666"
              }}
            >
              Radius :
              {" "}
              {geofence.radius_meter}
              m
            </p>

            <div
              style={{
                height: "400px",
                marginTop: "20px"
              }}
            >

              <MapContainer
                center={[
                  geofence.latitude,
                  geofence.longitude
                ]}
                zoom={17}
                style={{
                  height: "100%",
                  width: "100%",
                  borderRadius: "12px"
                }}
              >

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Kantor */}

                <Marker
                  position={[
                    geofence.latitude,
                    geofence.longitude
                  ]}
                />

                {/* Radius Geofence */}

                <Circle
                  center={[
                    geofence.latitude,
                    geofence.longitude
                  ]}
                  radius={
                    geofence.radius_meter
                  }
                />

                {/* Lokasi User */}

                {
                  latitude &&
                  longitude && (

                    <Marker
                      position={[
                        latitude,
                        longitude
                      ]}
                    />

                  )
                }

              </MapContainer>

            </div>

          </div>

        )
      }

      {
  distance !== null && (

    <div className="card">

      <h3>
        Status Lokasi
      </h3>

      <br />

      <p>

        📏 Jarak Anda :

        {" "}

        {
          distance > 1000
            ? (
                distance / 1000
              ).toFixed(2) + " km"
            : distance.toFixed(0) + " meter"
        }

      </p>

      <br />

      <h2
        style={{
          color:
            insideArea
              ? "#16a34a"
              : "#dc2626"
        }}
      >

        {
          insideArea
            ? "🟢 Dalam Area Kantor"
            : "🔴 Di Luar Area Kantor"
        }

      </h2>

    </div>

  )
}

      {/* STATUS */}

      <div className="stats-grid">

        <div className="status-card">

          <h4>
            Lokasi
          </h4>

          <h2>
            {
              latitude
                ? "✅"
                : "❌"
            }
          </h2>

          {
            latitude && (

              <small>

                {latitude.toFixed(5)}
                <br />
                {longitude.toFixed(5)}

              </small>

            )
          }

        </div>

        <div className="status-card">

          <h4>
            Foto
          </h4>

          <h2>
            {
              photo
                ? "📷"
                : "❌"
            }
          </h2>

        </div>

      </div>

      {/* AKSI */}

      <div className="card">

        <h3>
          Aksi Absensi
        </h3>

        <br />

        <button
          className="btn"
          onClick={getLocation}
        >
          📍 Ambil Lokasi
        </button>

        <button
          className="btn"
          onClick={openCamera}
          style={{
            marginLeft: "10px"
          }}
        >
          📷 Buka Kamera
        </button>

      </div>

      {/* CAMERA */}

{
  !photo && (

    <div className="card camera-box">

  <h3>
    Kamera Selfie
  </h3>

  <br />

  {
    !cameraOpen ? (

      <div
        style={{
          textAlign: "center",
          padding: "50px 20px",
          color: "#64748b"
        }}
      >

        <div
          style={{
            fontSize: "60px",
            marginBottom: "15px"
          }}
        >
          📷
        </div>

        <h3>
          Kamera Belum Dibuka
        </h3>

        <p>
          Klik tombol
          {" "}
          <strong>Buka Kamera</strong>
          {" "}
          untuk memulai verifikasi wajah.
        </p>

      </div>

    ) : (

      <>

        {
          challenge && (

            <div
              style={{
                textAlign: "center",
                marginBottom: "15px"
              }}
            >

              <h3>
                🔄 Verifikasi Liveness
              </h3>

              <h2>

                {
                  challenge === "LOOK_LEFT" &&
                  "⬅️ Putar Kepala ke Kiri"
                }

                {
                  challenge === "LOOK_RIGHT" &&
                  "➡️ Putar Kepala ke Kanan"
                }

                {
                  challenge === "OPEN_MOUTH" &&
                  "😮 Buka Mulut Lebar"
                }

              </h2>

            </div>

          )
        }

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

          {/* Scanner Oval */}

          <div
            style={{

              position: "absolute",

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

              boxShadow:
                faceInsideScanner
                  ? "0 0 40px rgba(34,197,94,.7)"
                  : "none",

              animation:
                faceInsideScanner
                  ? "pulse 1.5s infinite"
                  : "none",

              transition:
                "all .3s ease",

              pointerEvents:
                "none"

            }}
          />

          {/* Face Tracking */}

          {/*
            faceBox && (

              <div
                style={{

                  position: "absolute",

                  left:
                    `${faceBox.x}px`,

                  top:
                    `${faceBox.y}px`,

                  width:
                    `${faceBox.width}px`,

                  height:
                    `${faceBox.height}px`,

                  border:
                    "3px solid #22c55e",

                  borderRadius:
                    "12px",

                  boxShadow:
                    "0 0 20px rgba(34,197,94,.5)",

                  transition:
                    "all .1s linear",

                  pointerEvents:
                    "none"

                }}
              />

            )
          */}

        </div>

        <div
          style={{
            marginTop: "15px",
            textAlign: "center"
          }}
        >

          {
            !faceDetected ? (

              <h3>
                🔴 Wajah tidak terdeteksi
              </h3>

            ) : faceInsideScanner ? (

              <h3>
                🟢 Posisi wajah sesuai
              </h3>

            ) : (

              <h3>
                🟡 Posisikan wajah di dalam scanner
              </h3>

            )
          }

          {
            livenessPassed && (

              <h3
                style={{
                  color: "#22c55e",
                  marginTop: "10px"
                }}
              >
                ✅ Verifikasi Liveness Berhasil
              </h3>

            )
          }

        </div>

      </>

    )
  }
    </div>

  )
}

  <canvas
    ref={canvasRef}
    style={{
      display: "none"
    }}
  />

      {/* PREVIEW */}

      {
        photo && (

          <div className="card camera-box">

            <h3>
              Preview Selfie
            </h3>

            <br />

            <img
              src={photo}
              alt="Preview"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "12px"
              }}
            />

          </div>

        )
      }

      {/* BUTTON CHECK IN */}

      <button
        className="btn btn-success"
        onClick={handleCheckIn}
        disabled={!insideArea || !livenessPassed}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "16px",
          fontSize: "18px",
          fontWeight: "bold",
          opacity:
            insideArea
              ? 1
              : 0.5
        }}
      >
        ✅ CHECK IN
      </button>

    </div>

  </div>

);
}

export default CheckIn;