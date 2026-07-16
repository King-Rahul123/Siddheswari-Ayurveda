import { collection, doc, setDoc, serverTimestamp, onSnapshot, runTransaction, } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate next Patient Code
export const getNextPatientCode = async () => {
  const counterRef = doc(db, "counters", "patient");

  const nextId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentId = 0;

    if (counterDoc.exists()) {
      currentId = counterDoc.data().lastId || 0;
    }

    const newId = currentId + 1;

    transaction.set(
      counterRef,
      {
        lastId: newId,
      },
      { merge: true }
    );

    return newId;
  });

  return `CUS${nextId.toString().padStart(4, "0")}`;
};

// Add Patient
export const addPatient = async (patient) => {
  await setDoc(
    doc(db, "patients", patient.patientCode),
    {
      ...patient,
      createdAt: serverTimestamp(),
    }
  );
};

// Real-time patients
export const subscribePatients = (callback) => {
  return onSnapshot(collection(db, "patients"), (snapshot) => {
    const patients = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(patients);
  });
};