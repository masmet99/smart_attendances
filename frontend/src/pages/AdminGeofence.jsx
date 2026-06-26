import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import AdminSidebar from "../components/AdminSidebar";
import { showSuccess, showError } from "../utils/alert";
import { getGeofence, updateGeofence } from "../services/adminService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 18);
  }, [center, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function AdminGeofence() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState(null);
  const [namaLokasi, setNamaLokasi] = useState("");
  const [latitude, setLatitude] = useState(-3.955166);
  const [longitude, setLongitude] = useState(122.473108);
  const [radius, setRadius] = useState(100);
  const [originalData, setOriginalData] = useState(null);

  const hasChanges =
    originalData &&
    (namaLokasi !== originalData.nama_lokasi ||
      latitude !== Number(originalData.latitude) ||
      longitude !== Number(originalData.longitude) ||
      radius !== Number(originalData.radius_meter));

  useEffect(() => {
    loadGeofence();
  }, []);

  const loadGeofence = async () => {
    try {
      const result = await getGeofence();
      const data = result.data;
      setOriginalData(data);
      setId(data.id);
      setNamaLokasi(data.nama_lokasi);
      setLatitude(Number(data.latitude));
      setLongitude(Number(data.longitude));
      setRadius(Number(data.radius_meter));
    } catch (error) {
      console.log(error);
      showError("Gagal memuat data geofence");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGeofence({
        id,
        nama_lokasi: namaLokasi,
        latitude,
        longitude,
        radius_meter: radius,
      });
      await loadGeofence();
      showSuccess("Geofence berhasil diperbarui");
    } catch (error) {
      console.log(error);
      showError("Gagal menyimpan geofence");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalData) return;
    setNamaLokasi(originalData.nama_lokasi);
    setLatitude(Number(originalData.latitude));
    setLongitude(Number(originalData.longitude));
    setRadius(Number(originalData.radius_meter));
  };

  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        showSuccess("Lokasi berhasil diambil");
      },
      () => showError("Gagal mengambil lokasi")
    );
  };

  if (loading) {
    return (
      <div className="layout">
        <AdminSidebar />
        <div className="main-content">
          <div className="card">
            <p style={{ color: "#64748b" }}>Memuat data geofence...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main-content">
        {/* HERO */}
        <div className="gf-hero-card">
          <div>
            <h1 className="gf-hero-title">Kelola Geofence</h1>
            <p className="gf-hero-sub">
              Tentukan area dan radius absensi pegawai
            </p>
          </div>
          {hasChanges && (
            <span className="gf-unsaved-badge">
              Ada perubahan belum disimpan
            </span>
          )}
        </div>

        {/* STAT CARDS */}
        <div className="gf-stats-row">
          <div className="gf-stat-card">
            <span className="gf-stat-label">Nama Lokasi</span>
            <span className="gf-stat-val gf-val-name">
              {namaLokasi || "-"}
            </span>
          </div>
          <div className="gf-stat-card">
            <span className="gf-stat-label">Latitude</span>
            <span className="gf-stat-val">{latitude.toFixed(5)}</span>
          </div>
          <div className="gf-stat-card">
            <span className="gf-stat-label">Longitude</span>
            <span className="gf-stat-val">{longitude.toFixed(5)}</span>
          </div>
          <div className="gf-stat-card">
            <span className="gf-stat-label">Radius</span>
            <span className="gf-stat-val gf-val-radius">{radius}m</span>
          </div>
        </div>

        {/* FORM + MAP side by side di desktop */}
        <div className="gf-body-grid">
          {/* FORM */}
          <div className="card gf-form-card">
            <details className="gf-info-accordion">
              <summary className="gf-info-summary">
                <div>
                  <p className="gf-section-label gf-section-label-tight">
                    Informasi Lokasi
                  </p>
                  <h3 className="gf-info-title">
                    {namaLokasi || "Lokasi belum diberi nama"}
                  </h3>
                  <p className="gf-info-sub">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)} - Radius{" "}
                    {radius}m
                  </p>
                </div>
              </summary>

              <div className="gf-accordion-body">
                <div className="gf-field">
                  <label>Nama Lokasi</label>
                  <input
                    type="text"
                    value={namaLokasi}
                    placeholder="Contoh: Kantor Pusat"
                    onChange={(e) => setNamaLokasi(e.target.value)}
                  />
                </div>

                <div className="gf-field">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                  />
                </div>

                <div className="gf-field">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                  />
                </div>

                <div className="gf-field">
                  <div className="gf-radius-header">
                    <label>Radius Geofence</label>
                    <span className="gf-radius-val">{radius} meter</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="gf-range"
                  />
                  <div className="gf-range-labels">
                    <span>20m</span>
                    <span>1000m</span>
                  </div>
                </div>
              </div>
            </details>

            {/* ACTIONS */}
            <div className="gf-actions gf-actions-compact">
              <button className="gf-btn gf-btn-ghost" onClick={handleMyLocation}>
                Lokasi Saya
              </button>
              <button
                className="gf-btn gf-btn-danger"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                Reset
              </button>
              <button
                className="gf-btn gf-btn-success"
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>

          {/* MAP */}
          <div className="card gf-map-card">
            <div className="gf-map-header">
              <div>
                <p className="gf-section-label">Peta Geofence</p>
                <p className="gf-map-hint">
                  Klik pada peta untuk memindahkan titik geofence
                </p>
              </div>
              <span className="gf-radius-badge">Radius: {radius}m</span>
            </div>

            <div className="gf-map-wrap">
              <MapContainer
                center={[latitude, longitude]}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
              >
                <ChangeMapView center={[latitude, longitude]} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler
                  onMapClick={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
                <Marker position={[latitude, longitude]} />
                <Circle center={[latitude, longitude]} radius={radius} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGeofence;
