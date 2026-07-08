import { useState, useRef, useEffect } from "react";

import {
  showSuccess,
  showError,
  showWarning
} from "../utils/alert";

import { useNavigate } from "react-router-dom";

import { registerFace } from "../services/faceService";
import Sidebar from "../components/Sidebar";

import * as faceapi from "face-api.js";

function RegisterFace() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const trackingRef = useRef(null);
  const countdownRef = useRef(null);
  const stableRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInsideScanner, setFaceInsideScanner] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [faceStable, setFaceStable] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [poseFinished, setPoseFinished] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPose, setCurrentPose] = useState("front");

  const poses = [
    "front",
    "left",
    "right",
    "mouth_open"
  ];

  const poseLabels = {
    front: "Depan",
    left: "Kiri",
    right: "Kanan",
    mouth_open: "Mulut"
  };

  const poseTitles = {
    front: "Pose Depan",
    left: "⬅️ Gerakkan Kepala",
    right: "➡️ Gerakkan Kepala",
    mouth_open: "Pose Mulut Terbuka"
  };

  const poseIcons = {
    front: "🙂",
    left: "⬅️",
    right: "➡️",
    mouth_open: "😮"
  };

  const poseDescriptions = {
    front: "Hadapkan wajah lurus ke kamera.",
    left: "Ikuti arah panah di layar.",
    right: "Ikuti arah panah di layar.",
    mouth_open: "Buka mulut lebar-lebar."
  };

  const currentIndex = poses.indexOf(currentPose);
  const progress = ((currentIndex + 1) / poses.length) * 100;

  const scannerArea = cameraOpen
    ? (() => {

        const videoWidth =
          videoRef.current?.clientWidth || 300;

        const videoHeight =
          videoRef.current?.clientHeight || 250;

        const scannerWidth =
          videoWidth * 0.48;

        const scannerHeight =
          scannerWidth * 1.45;

        return {

          width: scannerWidth,

          height: scannerHeight,

          x:
            (videoWidth - scannerWidth) / 2,

          y:
            (videoHeight - scannerHeight) * 0.18

        };

      })()
    : {
        width:0,
        height:0,
        x:0,
        y:0
      };

  const clearTracking = () => {
    if (trackingRef.current) {
      clearInterval(trackingRef.current);
      trackingRef.current = null;
    }
  };

  const clearCountdownTimer = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const clearCountdown = () => {
    clearCountdownTimer();

    setCountdown(null);
  };

  const clearStableTimer = () => {
    if (stableRef.current) {
      clearTimeout(stableRef.current);
      stableRef.current = null;
    }
  };

  const stopCameraTracks = () => {
    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const stopCameraStream = () => {
    stopCameraTracks();

    setCameraOpen(false);
  };

  const resetCaptureState = () => {
    setFaceDetected(false);
    setFaceInsideScanner(false);
    setFaceStable(false);
    setCountdown(null);
  };

  const loadFaceModel = async () => {
    try {
      await faceapi.nets
        .tinyFaceDetector
        .loadFromUri("/models");
    } catch {
      showError("Model wajah gagal dimuat");
    }
  };

  const startFaceTracking = () => {
    clearTracking();

    trackingRef.current = setInterval(async () => {
      if (!videoRef.current) {
        return;
      }

      let detection;

      try {
        detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
      } catch {
        setFaceDetected(false);
        setFaceInsideScanner(false);
        return;
      }

      if (!detection) {
        setFaceDetected(false);
        setFaceInsideScanner(false);
        return;
      }

      setFaceDetected(true);

      const box = detection.box;
      const scaleX =
        videoRef.current.clientWidth /
        videoRef.current.videoWidth;
      const scaleY =
        videoRef.current.clientHeight /
        videoRef.current.videoHeight;

      const centerX = (box.x + box.width / 2) * scaleX;
      const centerY = (box.y + box.height / 2) * scaleY;

      const currentVideoWidth = videoRef.current.clientWidth;
      const currentVideoHeight = videoRef.current.clientHeight;
      const scannerWidth = currentVideoWidth * 0.48;
      const scannerHeight = currentVideoHeight * 1.45;
      const scannerCenterX = currentVideoWidth / 2;
      const scannerTop = (currentVideoHeight - scannerHeight) * 0.18;
      const scannerCenterY = scannerTop + scannerHeight / 2;
      const toleranceX = scannerWidth * 0.38;
      const toleranceY = scannerHeight * 0.38;

      const insideScanner =
        Math.abs(centerX - scannerCenterX) < toleranceX &&
        Math.abs(centerY - scannerCenterY) < toleranceY;

      setFaceInsideScanner(insideScanner);
    }, 500);
  };

  const openCamera = async () => {
    setPhoto(null);
    setPhotoFile(null);
    resetCaptureState();
    clearCountdown();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{
            facingMode:"user",

            width:{
                ideal:480
            },

            height:{
                ideal:640
            },

            aspectRatio:{
                ideal:3/4
            }
        },
        audio: false
      });

      if (trackingRef.current) {
        clearInterval(trackingRef.current);
        trackingRef.current = null;
      }

      const previousStream = videoRef.current?.srcObject;

      if (previousStream) {
        previousStream
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (!videoRef.current) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        showError("Kamera belum siap");
        return;
      }

      videoRef.current.srcObject = stream;
      setCameraOpen(true);
      startFaceTracking();
    } catch {
      setCameraOpen(false);
      showError("Kamera tidak dapat diakses");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      showWarning("Buka kamera terlebih dahulu");
      return;
    }

    if (!canvasRef.current) {
      return;
    }

    const video = videoRef.current;

    if (video.videoWidth === 0) {
      showWarning("Tunggu kamera siap");
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      showWarning("Kamera belum siap");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = canvas.toDataURL("image/jpeg");

    setPhoto(imageData);

    canvas.toBlob((blob) => {
      if (!blob) {
        showWarning("Foto gagal diproses");
        return;
      }

      const file = new File(
        [blob],
        "face.jpg",
        {
          type: "image/jpeg"
        }
      );

      setPhotoFile(file);
    }, "image/jpeg");

    stopCameraStream();
    clearTracking();
  };

  const handleRetake = () => {
    clearTracking();
    stopCameraStream();
    setCameraOpen(false);

    setPhoto(null);
    setPhotoFile(null);
    resetCaptureState();

    openCamera();
  };

  const handleRegister = async () => {
    setSaving(true);

    try {
      if (!photoFile) {
        showWarning("Ambil foto terlebih dahulu");
        setSaving(false);
        return;
      }

      await registerFace(
        photoFile,
        currentPose
      );

      setPoseFinished(true);

      if (currentIndex < poses.length - 1) {
        setTimeout(() => {
          setTransitioning(true);

          setTimeout(() => {
            setCurrentPose(poses[currentIndex + 1]);
            setPhoto(null);
            setPhotoFile(null);
            setPoseFinished(false);
            setSaving(false);
            setTransitioning(false);
            openCamera();
          }, 500);
        }, 800);

        return;
      }

      setSaving(false);
      stopCameraStream();
      clearTracking();

      showSuccess("Registrasi wajah berhasil");
      navigate("/dashboard");
    } catch (error) {
      setSaving(false);
      showWarning(
        error?.response?.data?.message ||
        "Registrasi gagal"
      );
    }
  };

  useEffect(() => {
    loadFaceModel();

    return () => {
      clearTracking();
      clearCountdownTimer();
      clearStableTimer();
      stopCameraTracks();
    };
  }, []);

  useEffect(() => {
    if (!faceInsideScanner || !faceStable) {
      clearCountdown();
      return;
    }

    if (photo || countdownRef.current) {
      return;
    }

    let count = 3;

    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);

      if (count <= 0) {
        clearCountdown();
        capturePhoto();
      }
    }, 1000);

    return () => {
      clearCountdown();
    };
  }, [
    faceInsideScanner,
    faceStable,
    photo
  ]);

  useEffect(() => {
    if (!faceDetected || !faceInsideScanner) {
      setFaceStable(false);
      clearStableTimer();
      return;
    }

    stableRef.current = setTimeout(() => {
      setFaceStable(true);
    }, 2000);

    return () => {
      clearStableTimer();
    };
  }, [
    faceDetected,
    faceInsideScanner
  ]);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <div className="card">
          <h1>Registrasi Wajah</h1>

          <p>
            Ikuti setiap pose hingga seluruh
            registrasi selesai.
          </p>

          <div className="register-progress-card">
            <div className="progress-header">
              <div>
                <h3>Registrasi Wajah</h3>

                <small>
                  Langkah{" "}
                  {currentIndex + 1}{" "}
                  dari{" "}
                  {poses.length}
                </small>
              </div>

              <strong>
                {Math.round(progress)}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`
                }}
              />
            </div>

            <div className="register-stepper">
              {poses.map((pose, index) => {
                const done = index < currentIndex;
                const active = index === currentIndex;

                return (
                  <div
                    key={pose}
                    className={
                      `step-item
                      ${done ? "done" : ""}
                      ${active ? " active" : ""}`
                    }
                  >
                    <div className="step-circle">
                      {done ? "✓" : poseIcons[pose]}
                    </div>

                    <p>
                      {poseLabels[pose]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={
            `card register-camera-card
            ${transitioning ? "slide-next" : ""}`
          }
        >
          <div className="pose-card">
            <div className="pose-icon">
              {poseIcons[currentPose]}
            </div>

            <div>
              <h2>
                {poseTitles[currentPose]}
              </h2>

              <p>
                {poseDescriptions[currentPose]}
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "6px"
                }}
              >
                ℹ️ Kamera depan menggunakan tampilan cermin (mirror). Ikuti arah panah yang ditampilkan pada layar.
              </p>
            </div>
          </div>

          {!photo ? (
            <>
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
                    className="rf-camera-video"
                />

                {cameraOpen && (
                  <div
                    style={{
                      position: "absolute",
                      left: scannerArea.x,
                      top: scannerArea.y,
                      width: scannerArea.width,
                      height: scannerArea.height,
                      border: faceInsideScanner
                        ? "4px solid #22c55e"
                        : "4px dashed #94a3b8",
                      borderRadius: "50%",
                      transition: ".3s",
                      pointerEvents: "none"
                    }}
                  />
                )}
              </div>

              {cameraOpen && (
                <div className="camera-status">
                  {!faceDetected ? (
                    <span className="status danger">
                      🔴 Wajah tidak terdeteksi
                    </span>
                  ) : !faceInsideScanner ? (
                    <span className="status warning">
                      🟡 Posisikan wajah di tengah
                    </span>
                  ) : !faceStable ? (
                    <span className="status info">
                      ⏳ Tahan posisi wajah...
                    </span>
                  ) : (
                    <span className="status success">
                      🟢 Wajah stabil
                    </span>
                  )}

                  {countdown && (
                    <h1 className="countdown-number">
                      📸 {countdown}
                    </h1>
                  )}
                </div>
              )}

              <canvas
                ref={canvasRef}
                style={{
                  display: "none"
                }}
              />

              {!cameraOpen && (
                <button
                  className="btn"
                  onClick={openCamera}
                >
                  📷 Buka Kamera
                </button>
              )}
            </>
          ) : (
            <>
              <img
                src={photo}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: "450px",
                  borderRadius: "16px"
                }}
              />

              {poseFinished && (
                <div className="pose-success-card">
                  <h2>✅</h2>

                  <h3>
                    Pose {poseLabels[currentPose]} berhasil
                  </h3>

                  <p>
                    Silakan lanjut ke pose berikutnya
                  </p>
                </div>
              )}

              <div className="preview-actions">
                <button
                  className="btn btn-danger"
                  onClick={handleRetake}
                >
                  🔄 Ambil Ulang
                </button>

                <button
                  className="btn btn-success"
                  disabled={saving}
                  onClick={handleRegister}
                >
                  {saving
                    ? "⏳ Menyimpan..."
                    : currentIndex === poses.length - 1
                      ? "✅ Selesaikan"
                      : "➡ Lanjut"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>💡 Tips Registrasi</h3>

          <div className="register-tips">
            <div>☀ Cahaya Cukup</div>
            <div>🙂 Wajah Penuh</div>
            <div>📱 Kamera Stabil</div>
            <div>🚫 Tanpa Masker</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterFace;
