import { collection, doc, setDoc, serverTimestamp, onSnapshot, runTransaction, } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate next Doctor Code
export const getNextDoctorCode = async () => {
  const counterRef = doc(db, "counters", "doctor");

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

  return `DR${nextId.toString().padStart(4, "0")}`;
};

// Add Doctor
export const addDoctor = async (doctor) => {
  await setDoc(
    doc(db, "doctors", doctor.doctorCode),
    {
      ...doctor,
      createdAt: serverTimestamp(),
    }
  );
};

// Real-time doctors
export const subscribeDoctors = (callback) => {
  return onSnapshot(collection(db, "doctors"), (snapshot) => {
    const doctors = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(doctors);
  });
};