import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { getSystemSettings, updateSystemSettings } from "../services/systemSettingService";
import { showSuccess, showError } from "../utils/alert";

function SystemSettings() {

  const [workStart,           setWorkStart]           = useState("");
  const [workEnd,             setWorkEnd]             = useState("");
  const [lateTolerance,       setLateTolerance]       = useState(15);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.65);
  const [originalData,        setOriginalData]        = useState(null);
  const [saving,              setSaving]              = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const result = await getSystemSettings();
      const data   = result.data;
      setWorkStart(data.work_start);
      setWorkEnd(data.work_end);
      setLateTolerance(data.late_tolerance);
      setSimilarityThreshold(data.similarity_threshold);
      setOriginalData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const hasChanges = originalData && (
    workStart           !== originalData.work_start           ||
    workEnd             !== originalData.work_end             ||
    lateTolerance       !== originalData.late_tolerance       ||
    similarityThreshold !== originalData.similarity_threshold
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSettings({
        work_start:           workStart,
        work_end:             workEnd,
        late_tolerance:       lateTolerance,
        similarity_threshold: similarityThreshold,
      });
      await loadSettings();
      showSuccess("Pengaturan berhasil disimpan");
    } catch (err) {
      console.log(err);
      showError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalData) return;
    setWorkStart(originalData.work_start);
    setWorkEnd(originalData.work_end);
    setLateTolerance(originalData.late_tolerance);
    setSimilarityThreshold(originalData.similarity_threshold);
  };

  const similarityPct = Math.round(similarityThreshold * 100);

  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main-content">

        {/* HERO */}
        <div className="ss-hero-card">
          <div>
            <h1 className="ss-hero-title">Pengaturan Sistem</h1>
            <p className="ss-hero-sub">Kelola konfigurasi utama sistem absensi</p>
          </div>
          {hasChanges && (
            <span className="ss-unsaved-badge">⚠ Ada perubahan belum disimpan</span>
          )}
        </div>

        {/* JAM KERJA */}
        <div className="card ss-section-card">
          <div className="ss-section-header">
            <div className="ss-section-icon">🕒</div>
            <div>
              <p className="ss-section-title">Jam Kerja</p>
              <p className="ss-section-sub">Atur waktu operasional absensi pegawai</p>
            </div>
          </div>

          <div className="ss-fields-grid">

            <div className="ss-field">
              <label>Jam Masuk</label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
            </div>

            <div className="ss-field">
              <label>Jam Pulang</label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>

            <div className="ss-field">
              <label>Toleransi Terlambat</label>
              <div className="ss-input-suffix-wrap">
                <input
                  type="number"
                  value={lateTolerance}
                  min={0}
                  max={60}
                  onChange={(e) => setLateTolerance(Number(e.target.value))}
                />
                <span className="ss-input-suffix">menit</span>
              </div>
            </div>

          </div>
        </div>

        {/* FACE RECOGNITION */}
        <div className="card ss-section-card">
          <div className="ss-section-header">
            <div className="ss-section-icon">📸</div>
            <div>
              <p className="ss-section-title">Face Recognition</p>
              <p className="ss-section-sub">Atur tingkat kecocokan wajah minimum</p>
            </div>
          </div>

          <div className="ss-field" style={{ marginTop: "20px" }}>
            <div className="ss-range-header">
              <label>Similarity Threshold</label>
              <span className="ss-range-val">{similarityPct}%</span>
            </div>

            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.01"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
              className="ss-range"
            />

            <div className="ss-range-labels">
              <span>50% (longgar)</span>
              <span>90% (ketat)</span>
            </div>

            {/* Indikator level */}
            <div className="ss-threshold-badges">
              <span className={`ss-level-badge ${similarityPct < 65 ? "active" : ""}`}>
                🟡 Longgar (&lt;65%)
              </span>
              <span className={`ss-level-badge ${similarityPct >= 65 && similarityPct < 80 ? "active" : ""}`}>
                🟢 Normal (65–79%)
              </span>
              <span className={`ss-level-badge ${similarityPct >= 80 ? "active" : ""}`}>
                🔵 Ketat (≥80%)
              </span>
            </div>
          </div>
        </div>

        {/* FLOATING SAVE BAR */}
        {hasChanges && (
          <div className="ss-floating-bar">
            <div className="ss-floating-info">
              <strong>Ada perubahan yang belum disimpan</strong>
              <p>Simpan untuk menerapkan konfigurasi baru.</p>
            </div>
            <div className="ss-floating-actions">
              <button className="ss-btn-reset" onClick={handleReset}>
                🔄 Reset
              </button>
              <button className="ss-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ Menyimpan..." : "💾 Simpan"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SystemSettings;