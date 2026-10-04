import { useEffect, useState } from "react";
import axios from "axios";

const HOURLY_RATE = 45;

const Attendance = () => {
  const [location, setLocation] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  const getCurrentMonth = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  const [salaryMonth, setSalaryMonth] =
    useState(getCurrentMonth());

  const token = localStorage.getItem("token");

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] =
      date.split("-");

    return `${day}-${month}-${year}`;
  };

  // =========================
  // TODAY
  // =========================

  const getTodayAttendance = async () => {
    try {
      if (!token) return;

      const response = await axios.get(
        "https://attendance-system-backend-bbl8.onrender.com/api/attendance/today",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendance(
        response.data.attendance
      );
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // HISTORY
  // =========================

  const getAttendanceHistory = async () => {
    try {
      if (!token) return;

      setHistoryLoading(true);

      const response = await axios.get(
        "https://attendance-system-backend-bbl8.onrender.com/api/attendance/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(
        response.data.attendance || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    getTodayAttendance();
    getAttendanceHistory();
  }, []);

  // =========================
  // MONTHLY SALARY
  // =========================

  const monthlyAttendance =
    history.filter(
      (item) =>
        item.date?.startsWith(
          salaryMonth
        ) &&
        item.status === "Present"
    );

  const totalWorkingHours =
    monthlyAttendance.reduce(
      (total, item) =>
        total +
        Number(
          item.workingHours || 0
        ),
      0
    );

  const totalSalary =
    totalWorkingHours * HOURLY_RATE;

  // =========================
  // LOCATION
  // =========================

  const getCurrentLocation = () => {
    setLoading(true);

    setMessage("");
    setMessageType("");

    if (!navigator.geolocation) {
      setMessage(
        "Geolocation is not supported"
      );

      setMessageType("error");
      setLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,
        });

        setMessage(
          "Location detected successfully"
        );

        setMessageType("success");

        setLoading(false);
      },

      (error) => {
        console.error(error);

        setMessage(error.message);

        setMessageType("error");

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =========================
  // CHECK IN
  // =========================

  const checkIn = async () => {
    try {
      setCheckingIn(true);

      setMessage("");
      setMessageType("");

      if (!token) {
        setMessage("Please login first");
        setMessageType("error");
        return;
      }

      if (!location) {
        setMessage(
          "Please get your current location first"
        );

        setMessageType("error");

        return;
      }

      const response = await axios.post(
        "https://attendance-system-backend-bbl8.onrender.com/api/attendance/check-in",
        {
          latitude:
            location.latitude,

          longitude:
            location.longitude,

          accuracy:
            location.accuracy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendance(
        response.data.attendance
      );

      setMessage(
        `${response.data.message} (${response.data.distance}m)`
      );

      setMessageType("success");

      await getAttendanceHistory();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Check-in failed"
      );

      setMessageType("error");
    } finally {
      setCheckingIn(false);
    }
  };

  // =========================
  // CHECK OUT
  // =========================

  const checkOut = async () => {
    try {
      setCheckingOut(true);

      setMessage("");
      setMessageType("");

      if (!token) {
        setMessage("Please login first");
        setMessageType("error");
        return;
      }

      if (!location) {
        setMessage(
          "Please get your current location first"
        );

        setMessageType("error");

        return;
      }

      const response = await axios.post(
        "https://attendance-system-backend-bbl8.onrender.com/api/attendance/check-out",
        {
          latitude:
            location.latitude,

          longitude:
            location.longitude,

          accuracy:
            location.accuracy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendance(
        response.data.attendance
      );

      setMessage(
        `${response.data.message} - ${response.data.workingHours} hours`
      );

      setMessageType("success");

      await getAttendanceHistory();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Check-out failed"
      );

      setMessageType("error");
    } finally {
      setCheckingOut(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* TOP */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ATTENDANCE */}

          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">

            <h1 className="text-2xl font-bold">
              Employee Attendance
            </h1>

            <p className="text-gray-500 mt-1 mb-6">
              GPS based office attendance
            </p>

            {/* TODAY */}

            {attendance && (
              <div className="bg-gray-100 p-5 rounded-xl mb-6">

                <h2 className="text-lg font-bold mb-4">
                  Today's Attendance
                </h2>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span>Date</span>

                    <b>
                      {formatDate(
                        attendance.date
                      )}
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span>Check In</span>

                    <b>
                      {formatTime(
                        attendance.checkIn
                      )}
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span>Check Out</span>

                    <b>
                      {formatTime(
                        attendance.checkOut
                      )}
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span>Working Hours</span>

                    <b>
                      {Number(
                        attendance.workingHours ||
                          0
                      ).toFixed(2)}{" "}
                      hrs
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span>Today's Salary</span>

                    <b className="text-green-600">
                      ₹
                      {(
                        Number(
                          attendance.workingHours ||
                            0
                        ) * HOURLY_RATE
                      ).toFixed(2)}
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span>Status</span>

                    <b className="text-green-600">
                      {attendance.status}
                    </b>
                  </div>

                </div>

              </div>
            )}

            {/* LOCATION */}

            <div className="border rounded-xl p-5">

              <h2 className="text-lg font-bold">
                📍 Office Location
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Get your current location before
                attendance
              </p>

              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading
                  ? "Getting Location..."
                  : "📍 Get Current Location"}
              </button>

              {location && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">

                  <p>
                    <b>Latitude:</b>{" "}
                    {location.latitude}
                  </p>

                  <p>
                    <b>Longitude:</b>{" "}
                    {location.longitude}
                  </p>

                  <p>
                    <b>Accuracy:</b>{" "}
                    {Math.round(
                      location.accuracy
                    )}{" "}
                    meters
                  </p>

                </div>
              )}

              {!attendance?.checkIn &&
                location && (
                  <button
                    onClick={checkIn}
                    disabled={checkingIn}
                    className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {checkingIn
                      ? "Checking In..."
                      : "🟢 Check In"}
                  </button>
                )}

              {attendance?.checkIn &&
                !attendance?.checkOut &&
                location && (
                  <button
                    onClick={checkOut}
                    disabled={checkingOut}
                    className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {checkingOut
                      ? "Checking Out..."
                      : "🔴 Check Out"}
                  </button>
                )}

            </div>

            {message && (
              <p
                className={`mt-5 text-center font-semibold ${
                  messageType === "success"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}

          </div>

          {/* SALARY */}

          <div className="bg-white p-6 rounded-2xl shadow-lg h-fit">

            <h2 className="text-xl font-bold">
              💰 Salary
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Monthly salary calculation
            </p>

            <label className="block text-sm font-semibold mb-2">
              Select Month
            </label>

            <input
              type="month"
              value={salaryMonth}
              onChange={(e) =>
                setSalaryMonth(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-3 py-2 mb-5"
            />

            <div className="bg-blue-50 p-4 rounded-xl mb-4">

              <p className="text-sm text-gray-500">
                Hourly Rate
              </p>

              <p className="text-2xl font-bold text-blue-600">
                ₹45
                <span className="text-sm font-normal">
                  {" "}
                  / hour
                </span>
              </p>

            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-4">

              <p className="text-sm text-gray-500">
                Total Working Hours
              </p>

              <p className="text-2xl font-bold">
                {totalWorkingHours.toFixed(2)} hrs
              </p>

            </div>

            <div className="bg-green-50 border border-green-200 p-5 rounded-xl">

              <p className="text-sm text-gray-500">
                Monthly Salary
              </p>

              <p className="text-3xl font-bold text-green-600">
                ₹{totalSalary.toFixed(2)}
              </p>

            </div>

            <div className="border-t mt-5 pt-5">

              <p className="text-sm text-gray-500">
                Calculation
              </p>

              <p className="font-semibold">
                {totalWorkingHours.toFixed(2)}
                {" × ₹45"}
              </p>

              <p className="font-bold text-green-600">
                = ₹{totalSalary.toFixed(2)}
              </p>

            </div>

          </div>

        </div>

        {/* HISTORY */}

        <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-xl font-bold">
                Attendance History
              </h2>

              <p className="text-sm text-gray-500">
                Your previous attendance
              </p>
            </div>

            <button
              onClick={getAttendanceHistory}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>

          {historyLoading ? (
            <p className="text-center py-8">
              Loading...
            </p>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No attendance records
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-gray-100">

                    <th className="p-3 text-left">
                      Date
                    </th>

                    <th className="p-3 text-left">
                      Check In
                    </th>

                    <th className="p-3 text-left">
                      Check Out
                    </th>

                    <th className="p-3 text-left">
                      Hours
                    </th>

                    <th className="p-3 text-left">
                      Salary
                    </th>

                    <th className="p-3 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {history.map((item) => {

                    const dailySalary =
                      Number(
                        item.workingHours || 0
                      ) * HOURLY_RATE;

                    return (
                      <tr
                        key={item._id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-3">
                          {formatDate(
                            item.date
                          )}
                        </td>

                        <td className="p-3">
                          {formatTime(
                            item.checkIn
                          )}
                        </td>

                        <td className="p-3">
                          {formatTime(
                            item.checkOut
                          )}
                        </td>

                        <td className="p-3 font-semibold">
                          {Number(
                            item.workingHours ||
                              0
                          ).toFixed(2)}{" "}
                          hrs
                        </td>

                        <td className="p-3 font-bold text-green-600">
                          ₹
                          {dailySalary.toFixed(2)}
                        </td>

                        <td className="p-3">

                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            {item.status}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Attendance;