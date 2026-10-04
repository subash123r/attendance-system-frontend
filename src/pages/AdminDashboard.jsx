import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const getCurrentMonth = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  const [month, setMonth] =
    useState(getCurrentMonth());

  const [summary, setSummary] =
    useState(null);

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const getAdminData = async () => {
    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        summaryResponse,
        employeesResponse,
      ] = await Promise.all([
        axios.get(
          `https://attendance-system-backend-bbl8.onrender.com/api/admin/summary?month=${month}`,
          { headers }
        ),

        axios.get(
          `https://attendance-system-backend-bbl8.onrender.com/api/admin/employees?month=${month}`,
          { headers }
        ),
      ]);

      setSummary(
        summaryResponse.data
      );

      setEmployees(
        employeesResponse.data.employees
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getAdminData();
    }
  }, [month]);

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Employee attendance and salary
              management
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <label className="block text-sm font-semibold mb-2">
              Select Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
              className="border bg-white rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* OFFICE LOCATION CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-xl font-bold">
                Office Location
              </h2>

              <p className="text-gray-500 mt-1">
                Manage office location and
                attendance radius
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/office-location"
                )
              }
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              🗺️ Open Map
            </button>

          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

              {/* TOTAL EMPLOYEES */}
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500">
                  Total Employees
                </p>

                <p className="text-3xl font-bold mt-2">
                  {summary?.totalEmployees ||
                    0}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Active employees
                </p>
              </div>

              {/* PRESENT TODAY */}
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500">
                  Present Today
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {summary?.presentToday ||
                    0}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Employees checked in
                </p>
              </div>

              {/* WORKING HOURS */}
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500">
                  Total Working Hours
                </p>

                <p className="text-3xl font-bold mt-2">
                  {Number(
                    summary?.totalWorkingHours ||
                      0
                  ).toFixed(2)}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Selected month
                </p>
              </div>

              {/* TOTAL SALARY */}
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500">
                  Total Salary
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹
                  {formatMoney(
                    summary?.totalSalary
                  )}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  ₹45 / hour
                </p>
              </div>

            </div>

            {/* EMPLOYEE TABLE */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  Employee List
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Attendance and salary for{" "}
                  {month}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead>
                    <tr className="bg-gray-100">

                      <th className="p-4 text-left">
                        Employee
                      </th>

                      <th className="p-4 text-left">
                        Email
                      </th>

                      <th className="p-4 text-center">
                        Present Days
                      </th>

                      <th className="p-4 text-center">
                        Working Hours
                      </th>

                      <th className="p-4 text-center">
                        Rate
                      </th>

                      <th className="p-4 text-right">
                        Salary
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {employees.length === 0 ? (

                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-500"
                        >
                          No employees found
                        </td>
                      </tr>

                    ) : (

                      employees.map(
                        (employee) => (

                          <tr
                            key={
                              employee.id
                            }
                            className="border-b hover:bg-gray-50"
                          >

                            <td className="p-4">
                              <div className="font-semibold">
                                {
                                  employee.name
                                }
                              </div>
                            </td>

                            <td className="p-4 text-gray-600">
                              {
                                employee.email
                              }
                            </td>

                            <td className="p-4 text-center font-semibold">
                              {
                                employee.presentDays
                              }
                            </td>

                            <td className="p-4 text-center">
                              {Number(
                                employee.totalWorkingHours
                              ).toFixed(2)}{" "}
                              hrs
                            </td>

                            <td className="p-4 text-center">
                              ₹
                              {
                                employee.hourlyRate
                              }
                              /hr
                            </td>

                            <td className="p-4 text-right font-bold text-green-600">
                              ₹
                              {formatMoney(
                                employee.salary
                              )}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;