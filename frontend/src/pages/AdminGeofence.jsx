import {
  useEffect,
  useState
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import AdminSidebar from "../components/AdminSidebar";

import {
  showSuccess,
  showError
} from "../utils/alert";

import {
  getGeofence,
  updateGeofence
} from "../services/adminService";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

});

function AdminGeofence() {

  const [loading, setLoading] =
    useState(true);

  const [id, setId] =
    useState(null);

  const [namaLokasi, setNamaLokasi] =
    useState("");

  const [latitude, setLatitude] =
    useState(-3.955166);

  const [longitude, setLongitude] =
    useState(122.473108);

  const [radius, setRadius] =
    useState(100);

const [originalData, setOriginalData] =
  useState(null);

  const hasChanges =

  originalData && (

    namaLokasi !==
      originalData.nama_lokasi

    ||

    latitude !==
      Number(
        originalData.latitude
      )

    ||

    longitude !==
      Number(
        originalData.longitude
      )

    ||

    radius !==
      Number(
        originalData.radius_meter
      )

  );

  useEffect(() => {

    loadGeofence();

  }, []);

  const loadGeofence =
    async () => {

      try {

        const result =
          await getGeofence();

        const data =
        result.data;

        setOriginalData(data);

        setId(data.id);

        setNamaLokasi(
        data.nama_lokasi
        );

        setLatitude(
          Number(data.latitude)
        );

        setLongitude(
          Number(data.longitude)
        );

        setRadius(
          Number(data.radius_meter)
        );

      } catch (error) {

        console.log(error);

        showError(
          "Gagal memuat data geofence"
        );

      } finally {

        setLoading(false);

      }
    };

const handleSave =
  async () => {

    try {

      await updateGeofence({

        id,

        nama_lokasi:
          namaLokasi,

        latitude,

        longitude,

        radius_meter:
          radius

      });

      await loadGeofence();

      showSuccess(
        "Geofence berhasil diperbarui"
      );

    } catch (error) {

        console.log(error);

        showError(
          "Gagal menyimpan geofence"
        );

      }
    };

    const handleReset = () => {

    if (!originalData)
        return;

    setNamaLokasi(
        originalData.nama_lokasi
    );

    setLatitude(
        Number(
        originalData.latitude
        )
    );

    setLongitude(
        Number(
        originalData.longitude
        )
    );

    setRadius(
        Number(
        originalData.radius_meter
        )
    );

};

const handleMyLocation =
  () => {

    navigator.geolocation
      .getCurrentPosition(

        (position) => {

          setLatitude(
            position.coords.latitude
          );

          setLongitude(
            position.coords.longitude
          );

          showSuccess(
            "Lokasi berhasil diambil"
          );

        },

        () => {

          showError(
            "Gagal mengambil lokasi"
          );

        }

      );

};

  function MapClickHandler() {

    useMapEvents({

      click(e) {

        setLatitude(
          e.latlng.lat
        );

        setLongitude(
          e.latlng.lng
        );

      }

    });

    return null;
  }

  if (loading) {

    return (

      <div className="layout">

        <AdminSidebar />

        <div className="main-content">

          <div className="card">

            <h2>
              Loading...
            </h2>

          </div>

        </div>

      </div>

    );
  }
  function ChangeMapView({
      center
    }) {

      const map = useMap();

      useEffect(() => {

        map.setView(
          center,
          18
        );

      }, [center, map]);

      return null;
    }

return (

  <div className="layout">

    <AdminSidebar />

    <div className="main-content">

      {/* HEADER */}

      <div className="card">

        <h1>
          📍 Kelola Geofence
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: "10px"
          }}
        >
          Tentukan area absensi
          pegawai berdasarkan
          lokasi kantor.
        </p>

      </div>

      {/* STATISTIK */}

      <div className="admin-stats">

        <div className="admin-card bg-blue">

          <h4>
            📍 Latitude
          </h4>

          <h2>
            {latitude.toFixed(5)}
          </h2>

        </div>

        <div className="admin-card bg-green">

          <h4>
            🌎 Longitude
          </h4>

          <h2>
            {longitude.toFixed(5)}
          </h2>

        </div>

        <div className="admin-card bg-orange">

          <h4>
            📏 Radius
          </h4>

          <h2>
            {radius}m
          </h2>

        </div>

        <div className="admin-card bg-red">

          <h4>
            🏢 Lokasi
          </h4>

          <h2
            style={{
              fontSize: "20px"
            }}
          >
            {namaLokasi}
          </h2>

        </div>

      </div>

      {/* FORM */}

      <div className="card">

        <h3>
          Informasi Lokasi
        </h3>

        <div
          style={{
            display: "grid",
            gap: "15px",
            marginTop: "20px"
          }}
        >

          <div>

            <label>
              Nama Lokasi
            </label>

            <input
              type="text"
              value={namaLokasi}
              onChange={(e) =>
                setNamaLokasi(
                  e.target.value
                )
              }
            />

          </div>

          <div>

            <label>
              Latitude
            </label>

            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) =>
                setLatitude(
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>

          <div>

            <label>
              Longitude
            </label>

            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) =>
                setLongitude(
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>

          <div>

            <label>
              Radius Geofence
            </label>

            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={radius}
              onChange={(e) =>
                setRadius(
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <div
              style={{
                marginTop: "10px",
                fontWeight: "600",
                color: "#2563eb"
              }}
            >
              {radius} Meter
            </div>

          </div>

        </div>

      </div>

      {/* WARNING */}

      {
        hasChanges && (

          <div
            className="card"
            style={{
              background:
                "#fff7ed",
              border:
                "1px solid #fdba74"
            }}
          >

            <strong
              style={{
                color: "#9a3412"
              }}
            >
              ⚠ Ada perubahan yang belum disimpan
            </strong>

          </div>

        )
      }

      {/* ACTION */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}
      >

        <button
          className="btn"
          onClick={
            handleMyLocation
          }
        >
          📍 Lokasi Saya
        </button>

        <button
          className="btn btn-danger"
          onClick={
            handleReset
          }
        >
          🔄 Reset
        </button>

        <button
          className="btn btn-success"
          onClick={
            handleSave
          }
        >
          💾 Simpan
        </button>

      </div>

      {/* MAP */}

      <div className="card">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom: "15px"
          }}
        >

          <h3>
            🗺️ Peta Geofence
          </h3>

          <strong>

            Radius :
            {" "}
            {radius}
            m

          </strong>

        </div>

        <div
          style={{
            height: "500px",
            borderRadius:
              "15px",
            overflow: "hidden"
          }}
        >

          <MapContainer
            center={[
              latitude,
              longitude
            ]}
            zoom={17}
            style={{
              height: "100%",
              width: "100%"
            }}
          >
            <ChangeMapView
            center={[
              latitude,
              longitude
            ]}
            />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler />

            <Marker
              position={[
                latitude,
                longitude
              ]}
            />

            <Circle
              center={[
                latitude,
                longitude
              ]}
              radius={radius}
            />

          </MapContainer>

        </div>

        <p
          style={{
            marginTop: "15px",
            color: "#64748b"
          }}
        >
          Klik pada peta untuk
          memindahkan titik
          geofence. Radius akan
          berubah secara realtime.
        </p>

      </div>

    </div>

  </div>

);
}

export default AdminGeofence;