import { API_BASE_URL } from "../api/config";

// Generate next Patient Code
export const getNextPatientCode = async () => {
  const res = await fetch(`${API_BASE_URL}/patients/next-code`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate patient code");
  return data.code;
};

// Add Patient
export const addPatient = async (patient) => {
  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add patient");
  return data;
};

// Real-time patients
export const subscribePatients = (callback) => {
  let isMounted = true;

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`);
      if (res.ok) {
        const patients = await res.json();
        if (isMounted) {
          callback(patients.map((p) => ({ docId: p.patientCode || p._id, ...p })));
        }
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  fetchPatients();
  const interval = setInterval(fetchPatients, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};

export const updatePatient = async (patientCode, data) => {
  const res = await fetch(`${API_BASE_URL}/patients/${encodeURIComponent(patientCode)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.message || "Failed to update patient");
  return resData;
};