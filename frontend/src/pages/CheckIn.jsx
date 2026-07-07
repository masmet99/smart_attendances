import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { checkIn, getGeofence, getTodayAttendance } from "../services/attendanceService";
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
  showSuccess,
  showError,
  showWarning
} from "../utils/alert";

import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";


function CheckIn() {

  const navigate = useNavigate();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [latitude, setLatitude]         = useState(null);
  const [longitude, setLongitude]       = useState(null);
  const [photo, setPhoto]               = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);
  const [faceBox, setFaceBox]           = useState(null);
  const [faceInsideScanner, setFaceInsideScanner] = useState(false);
  const [geofence, setGeofence]         = useState(null);
  const [distance, setDistance]         = useState(null);
  const [insideArea, setInsideArea]     = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [lastFacePosition, setLastFacePosition] = useState(null);
  const [challenge, setChallenge]       = useState(null);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [checkingIn, setCheckingIn]     = useState(false);
  const [mapOpen, setMapOpen]           = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loadingLocation, setLoadingLocation]   = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [videoInfo, setVideoInfo] = useState(null);
  const MAX_RETRY = 3;

  const videoRef             = useRef(null);
  const canvasRef            = useRef(null);
  const trackingRef          = useRef(null);
  const faceLandmarkerRef    = useRef(null);
  const faceInsideScannerRef = useRef(false);
  const faceDetectedRef      = useRef(false);
  const livenessPassedRef    = useRef(false);
  const animationRef = useRef(null);
  

  // ── step progress helper ──────────────────────────────
  const stepStatus = (step) => {
    if (step === 1) {
      if (insideArea) return "done";
      if (latitude)   return "active";
      return "wait";
    }
    if (step === 2) {
      if (livenessPassed) return "done";
      if (cameraOpen)     return "active";
      return "wait";
    }
    if (step === 3) {
      if (photo)          return "done";
      if (livenessPassed) return "active";
      return "wait";
    }
  };

  const stepLabel = (step) => {
    const s = stepStatus(step);
    if (s === "done")   return { cls: "ci-badge-done",   text: "✓ Selesai" };
    if (s === "active") return { cls: "ci-badge-active", text: "● Proses" };
    return               { cls: "ci-badge-wait",         text: "Menunggu" };
  };

  // ── lifecycle ─────────────────────────────────────────
  useEffect(() => {
    checkFaceRegistration();
    loadGeofence();
    loadFaceModel();
    initFaceLandmarker();
  }, []);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current) return;
    const video = videoRef.current;

    video.onloadedmetadata = () => {

      console.log("clientWidth :", video.clientWidth);
      console.log("clientHeight:", video.clientHeight);

      console.log("videoWidth :", video.videoWidth);
      console.log("videoHeight:", video.videoHeight);

      if (modelsLoaded) startFaceTracking();
      startLivenessDetection();
    };
  }, [cameraOpen]);

  // ── logika tidak diubah ───────────────────────────────
  const loadFaceModel = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
    } catch (error) { console.log(error); }
  };

  const initFaceLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });
    faceLandmarkerRef.current = faceLandmarker;
  };

  const startFaceTracking = () => {
    if (trackingRef.current) clearInterval(trackingRef.current);
    trackingRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );
      if (detection) {
        const box = detection.box;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        setLastFacePosition({ x: centerX, y: centerY });
        setFaceBox({ x: box.x, y: box.y, width: box.width, height: box.height });
        if (!videoRef.current?.videoWidth || !videoRef.current?.videoHeight) return;
        const scaleX = videoRef.current.clientWidth  / videoRef.current.videoWidth;
        const scaleY = videoRef.current.clientHeight / videoRef.current.videoHeight;
        const faceCenterX = (box.x + box.width  / 2) * scaleX;
        const faceCenterY = (box.y + box.height / 2) * scaleY;
        const scannerArea  = getScannerArea();
        const scannerCenterX = scannerArea.x + scannerArea.width  / 2;
        const scannerCenterY = scannerArea.y + scannerArea.height / 2;
        const toleranceX = scannerArea.width  * 0.15;
        const toleranceY = scannerArea.height * 0.15;
        const insideScanner =
          Math.abs(faceCenterX - scannerCenterX) < toleranceX &&
          Math.abs(faceCenterY - scannerCenterY) < toleranceY;
        faceInsideScannerRef.current = insideScanner;
        setFaceInsideScanner(insideScanner);
        faceDetectedRef.current = true;
        setFaceDetected(true);
      } else {
        faceDetectedRef.current = false;
        setFaceDetected(false);
        setFaceInsideScanner(false);
        setFaceBox(null);
      }
    }, 500);
  };

  const checkFaceRegistration = async () => {
    try {
      const profile = await getProfile();
      if (!profile.user.face_registered) {
        navigate("/register-face");
        return;
      }

      // Cek apakah sudah check in hari ini
      const today = await getTodayAttendance();
      if (today?.checked_in) {
        showWarning("Anda sudah check in hari ini");
        navigate("/dashboard");
        return;
      }

    } catch (error) { console.log(error); }
  };

  const loadGeofence = async () => {
    try {
      const result = await getGeofence();
      setGeofence(result.data);
    } catch (error) { console.log(error); }
  };

  const getLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        if (geofence) {
          const dist = calculateDistance(lat, lng, geofence.latitude, geofence.longitude);
          setDistance(dist);
          setInsideArea(dist <= geofence.radius_meter);
        }
        setLoadingLocation(false);
      },
      (error) => {
        showWarning("Gagal mengambil lokasi");
        console.log(error);
        setLoadingLocation(false);
      }
    );
  };

  const checkChallenge = (result) => {
    if (!faceInsideScannerRef.current) return;
    if (!faceDetectedRef.current) return;
    if (livenessPassedRef.current) return;
    const landmarks  = result.faceLandmarks[0];
    const nose       = landmarks[1];
    const leftCheek  = landmarks[234];
    const rightCheek = landmarks[454];
    const faceCenter = (leftCheek.x + rightCheek.x) / 2;
    const offset     = nose.x - faceCenter;
    const upperLip   = landmarks[13];
    const lowerLip   = landmarks[14];
    const mouthGap   = Math.abs(upperLip.y - lowerLip.y);
    if (challenge === "LOOK_LEFT"  && offset   < -0.03) { showSuccess("Kepala ke kiri terdeteksi");   completeLiveness(); }
    if (challenge === "LOOK_RIGHT" && offset   >  0.03) { showSuccess("Kepala ke kanan terdeteksi");  completeLiveness(); }
    if (challenge === "OPEN_MOUTH" && mouthGap >  0.03) { showSuccess("Mulut terbuka terdeteksi");    completeLiveness(); }
  };

  const startLivenessDetection = () => {
    const detect = () => {
      if (!videoRef.current || videoRef.current.videoWidth === 0) {
            animationRef.current =
                requestAnimationFrame(detect);

            return;
      }
      const result = faceLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      if (result.faceLandmarks?.length > 0 && faceInsideScannerRef.current) {
        checkChallenge(result);
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  const openCamera = async () => {
    try {
      setPhoto(null); setPhotoFile(null);
      livenessPassedRef.current = false; setLivenessPassed(false);
      setFaceInsideScanner(false);
      faceDetectedRef.current = false; setFaceDetected(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      
      const challenges = ["LOOK_LEFT", "LOOK_RIGHT", "OPEN_MOUTH"];
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    } catch (error) {
      console.error(error);
      showWarning("Kamera tidak dapat diakses");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    setPhoto(imageData);
    canvas.toBlob((blob) => {
      const file = new File([blob], "checkin.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
      showSuccess("Foto berhasil diambil");
    }, "image/jpeg");
  };

  const stopCamera = () => {

    const stream = videoRef.current?.srcObject;
    if (stream)
        stream.getTracks().forEach(track => track.stop());
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
    }

    if (trackingRef.current) {
        clearInterval(trackingRef.current);
        trackingRef.current = null;
    }

    if (videoRef.current)
        videoRef.current.srcObject = null;

    setCameraOpen(false);
    faceDetectedRef.current = false;
    setFaceDetected(false);
    setFaceInsideScanner(false);
  };

  const resetLiveness = () => {

  livenessPassedRef.current = false;
  setLivenessPassed(false);

  faceDetectedRef.current = false;
  setFaceDetected(false);

  faceInsideScannerRef.current = false;
  setFaceInsideScanner(false);

  setPhoto(null);
  setPhotoFile(null);

  };

  const completeLiveness = () => {

      if (livenessPassedRef.current) return;
      livenessPassedRef.current = true;
      setLivenessPassed(true);

      // STOP LOOP DETEKSI
      if (animationRef.current) {
          cancelAnimationFrame(
              animationRef.current
          );
          animationRef.current = null;
      }

      // STOP FACE TRACKING
      if (trackingRef.current) {
          clearInterval(
              trackingRef.current
          );
          trackingRef.current = null;
      }

      showSuccess("Verifikasi berhasil");
      setTimeout(() => {
          capturePhoto();
          setTimeout(() => {
              stopCamera();
          }, 200);
      }, 300);
  };

  const getScannerArea = () => {
    const videoWidth  = videoRef.current?.clientWidth  || 300;
    const videoHeight = videoRef.current?.clientHeight || 250;
    return {
      width:  videoWidth  * 0.40,
      height: videoHeight * 0.65,
      x:      (videoWidth * 0.50) - (videoWidth * 0.40 / 2),
      y:      videoHeight * 0.08
    };
  };

  const handleCheckIn = async () => {
    if (!latitude || !longitude) { showWarning("Ambil lokasi terlebih dahulu"); return; }
    if (!livenessPassed)          { showWarning("Verifikasi wajah belum berhasil"); return; }
    if (!photoFile)               { showWarning("Ambil foto terlebih dahulu"); return; }
    setCheckingIn(true);
    try {
      const result = await checkIn(photoFile, latitude, longitude);
      console.log(result);
      if (result.success) {
        showSuccess(result.message);
        setRetryCount(0);
        navigate("/dashboard");
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data) { showError(error.response.data.message); }
      else                      { showError("Check In gagal"); }
    } finally {
      setCheckingIn(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R    = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const scannerArea = getScannerArea();

  const challengeText = {
    LOOK_LEFT:  { icon: "⬅️", text: "Gerakkan kepala mengikuti arah panah di layar." },
    LOOK_RIGHT: { icon: "➡️", text: "Gerakkan kepala mengikuti arah panah di layar" },
    OPEN_MOUTH: { icon: "😮", text: "Buka mulut lebar-lebar" },
  };

  const canCheckIn = insideArea && livenessPassed && !!photoFile && !checkingIn;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">

        {/* HERO */}
        <div className="ci-hero-card">
          <div>
            <h1 className="ci-hero-title">Absensi Kehadiran</h1>
            <p className="ci-hero-sub">Lengkapi 3 langkah di bawah untuk check in</p>
          </div>
        </div>

        {/* STEP TRACKER */}
        <div className="ci-steps-row">
          {[
            { n: 1, label: "Lokasi"   },
            { n: 2, label: "Liveness" },
            { n: 3, label: "Foto"     },
          ].map(({ n, label }) => {
            const { cls, text } = stepLabel(n);
            return (
              <div key={n} className="ci-step-card">
                <span className="ci-step-num">Langkah {n}</span>
                <span className="ci-step-title">{label}</span>
                <span className={`ci-badge ${cls}`}>{text}</span>
              </div>
            );
          })}
        </div>

        {/* LOKASI — tombol ambil lokasi di dalam card */}
        <div className="card ci-section-card">
          <p className="ci-section-label">Status Lokasi</p>

          {latitude ? (
            <>
              <div className="ci-detail-row">
                <span className="ci-detail-label">📏 Jarak ke kantor</span>
                <span className="ci-detail-val">
                  {distance !== null
                    ? distance > 1000
                      ? (distance / 1000).toFixed(2) + " km"
                      : distance.toFixed(0) + " meter"
                    : "—"}
                </span>
              </div>
              <div className="ci-detail-row">
                <span className="ci-detail-label">🏢 Area</span>
                <span className={insideArea ? "ci-badge ci-badge-done" : "ci-badge ci-badge-danger"}>
                  {insideArea ? "🟢 Dalam Area Kantor" : "🔴 Di Luar Area Kantor"}
                </span>
              </div>
              <div className="ci-detail-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                <span className="ci-detail-label">📡 Koordinat</span>
                <span className="ci-detail-val" style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              </div>
            </>
          ) : (
            <p className="ci-empty-hint">Tekan tombol di bawah untuk mendeteksi posisimu.</p>
          )}

          <button
            className="ci-btn-block"
            onClick={getLocation}
            disabled={loadingLocation}
            style={{ marginTop: "12px", opacity: loadingLocation ? 0.6 : 1 }}
          >
            {loadingLocation
              ? "⏳ Mendeteksi lokasi..."
              : latitude ? "📍 Perbarui Lokasi" : "📍 Ambil Lokasi"}
          </button>
        </div>

        {/* PETA — accordion, default tertutup */}
        {geofence && (
          <div className="card ci-map-accordion">
            <button
              className="ci-map-accordion-header"
              onClick={() => setMapOpen(!mapOpen)}
            >
              <div className="ci-map-accordion-info">
                <span className="ci-section-label" style={{ marginBottom: 0 }}>Peta Area Absensi</span>
                <span className="ci-map-accordion-sub">
                  {geofence.nama_lokasi} · Radius {geofence.radius_meter}m
                </span>
              </div>
              <span className={`ci-map-accordion-arrow ${mapOpen ? "open" : ""}`}>›</span>
            </button>

            {mapOpen && (
              <div className="ci-map-body">
                <div className="ci-map-wrap">
                  <MapContainer
                    center={[geofence.latitude, geofence.longitude]}
                    zoom={17}
                    style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[geofence.latitude, geofence.longitude]} />
                    <Circle center={[geofence.latitude, geofence.longitude]} radius={geofence.radius_meter} />
                    {latitude && longitude && <Marker position={[latitude, longitude]} />}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KAMERA — tombol buka kamera di dalam card */}
        {!photo && (
          <div className="card ci-section-card">
            <p className="ci-section-label">Kamera Selfie</p>

            {!cameraOpen ? (
              <>
                <div className="ci-cam-placeholder">
                  <span style={{ fontSize: "2.5rem" }}>📷</span>
                  <p>Verifikasi wajah diperlukan untuk check in</p>
                </div>
                <button className="ci-btn-block" onClick={openCamera}>
                  📷 Buka Kamera
                </button>
              </>
            ) : (
              <>
                {challenge && !livenessPassed && (
                  <div className="ci-liveness-banner">
                    <span style={{ fontSize: "1.5rem" }}>{challengeText[challenge]?.icon}</span>
                    <div>
                      <p className="ci-liveness-title">Verifikasi Liveness</p>
                      <p className="ci-liveness-sub">{challengeText[challenge]?.text}</p>
                    </div>
                  </div>
                )}

                {livenessPassed && (
                  <div className="ci-liveness-success">✅ Verifikasi liveness berhasil</div>
                )}

                <div className="ci-video-wrap">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", maxWidth: "560px", borderRadius: "12px", display: "block" }}
                  />
                  <div
                    className="ci-scanner-oval"
                    style={{
                      left:        scannerArea.x,
                      top:         scannerArea.y,
                      width:       scannerArea.width,
                      height:      scannerArea.height,
                      borderColor: faceInsideScanner ? "#22c55e" : "#94a3b8",
                      borderStyle: faceInsideScanner ? "solid"   : "dashed",
                      boxShadow:   faceInsideScanner ? "0 0 32px rgba(34,197,94,.5)" : "none",
                    }}
                  />
                </div>

              {videoInfo && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      background: "#f1f5f9",
                      borderRadius: 8,
                      fontSize: 13,
                      textAlign: "left",
                    }}
                  >
                    <div>
                      client : {videoInfo.clientWidth} × {videoInfo.clientHeight}
                    </div>
                    <div>
                      video : {videoInfo.videoWidth} × {videoInfo.videoHeight}
                    </div>
                  </div>
                )}
                
                <div className="ci-face-status">
                  {!faceDetected ? (
                    <span className="ci-status-pill ci-status-danger">🔴 Wajah tidak terdeteksi</span>
                  ) : faceInsideScanner ? (
                    <span className="ci-status-pill ci-status-success">🟢 Posisi wajah sesuai</span>
                  ) : (
                    <span className="ci-status-pill ci-status-warning">🟡 Posisikan wajah di dalam scanner</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* PREVIEW FOTO */}
        {photo && (
          <div className="card ci-section-card">
            <p className="ci-section-label">Preview Selfie</p>
            <div style={{ textAlign: "center" }}>
              <img
                src={photo}
                alt="Preview"
                style={{ width: "100%", maxWidth: "460px", borderRadius: "12px" }}
              />
            </div>
            <button
              className="ci-btn-block ci-btn-block-ghost"
              style={{ marginTop: "12px" }}
              onClick={() => {

                if (retryCount >= MAX_RETRY) {
                  showError("Batas pengambilan ulang foto telah tercapai.");
                  return;
                }

                setRetryCount(prev => prev + 1);
                
                stopCamera();
                resetLiveness();
                openCamera();
              }}
            >
              🔄 Ambil Ulang Foto
            </button>
          </div>
        )}

        {/* TOMBOL CHECK IN */}
        <button
          className={`ci-btn-checkin ${!canCheckIn ? "ci-btn-checkin-disabled" : ""}`}
          onClick={handleCheckIn}
          disabled={!canCheckIn}
        >
          {checkingIn ? "⏳ Memproses..." : "✅ CHECK IN SEKARANG"}
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />

      </div>
    </div>
  );
}

export default CheckIn;