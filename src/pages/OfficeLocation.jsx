import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OfficeLocation = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [radius, setRadius] =
    useState(50);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage(
        "Geolocation is not supported by this browser"
      );

      return;
    }

    setMessage(
      "Getting current location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        setLatitude(
          latitude.toFixed(6)
        );

        setLongitude(
          longitude.toFixed(6)
        );

        setMessage(
          "Location detected successfully"
        );
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setMessage(
          "Unable to get current location"
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const saveLocation = async (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      setMessage(
        "Please enter latitude and longitude"
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response =
        await axios.post(
          "https://attendance-system-backend-bbl8.onrender.com/api/office/location",
          {
            latitude: Number(latitude),
            longitude: Number(longitude),
            radius: Number(radius),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setMessage(
        response.data.message ||
          "Office location saved successfully"
      );

    } catch (error) {
      console.error(
        "Save location error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to save office location"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() =>
            navigate("/admin")
          }
          className="mb-6 bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          ← Back to Dashboard
        </button>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold mb-2">
            Office Location
          </h1>

          <p className="text-gray-500 mb-8">
            Set the office location used for
            attendance check-in and check-out.
          </p>

          {/* CURRENT LOCATION BUTTON */}
          <button
            type="button"
            onClick={
              getCurrentLocation
            }
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
          >
            📍 Get Current Location
          </button>

          {/* FORM */}
          <form
            onSubmit={saveLocation}
          >

            {/* LATITUDE */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) =>
                  setLatitude(
                    e.target.value
                  )
                }
                placeholder="Enter latitude"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* LONGITUDE */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) =>
                  setLongitude(
                    e.target.value
                  )
                }
                placeholder="Enter longitude"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* RADIUS */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Attendance Radius
              </label>

              <div className="flex items-center gap-3">

                <input
                  type="number"
                  min="1"
                  value={radius}
                  onChange={(e) =>
                    setRadius(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <span className="text-gray-600 font-semibold">
                  meters
                </span>

              </div>
            </div>

            {/* SAVE */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Office Location"}
            </button>

          </form>

          {/* MESSAGE */}
          {message && (
            <div className="mt-6 bg-gray-100 rounded-lg p-4 text-center font-medium">
              {message}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OfficeLocation;