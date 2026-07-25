import { apiFetch } from "../api/apiClient";

// Generate next Doctor Code
export const getNextDoctorCode = async () => {
  const res = await apiFetch("/doctors/next-code");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate doctor code");
  return data.code;
};

// Add Doctor
export const addDoctor = async (doctor) => {
  const res = await apiFetch("/doctors", {
    method: "POST",
    body: JSON.stringify(doctor)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add doctor");
  return data;
};

// Real-time doctors
export const subscribeDoctors = (callback) => {
  let isMounted = true;

  const fetchDoctors = async () => {
    try {
      const res = await apiFetch("/doctors");
      if (res.ok) {
        const doctors = await res.json();
        if (isMounted) {
          callback(doctors.map((d) => ({ docId: d.doctorCode || d._id, ...d })));
        }
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  fetchDoctors();
  const interval = setInterval(fetchDoctors, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};