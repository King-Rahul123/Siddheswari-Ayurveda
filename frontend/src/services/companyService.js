import { collection, doc, setDoc, serverTimestamp, onSnapshot, runTransaction, } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate next companies Code
export const getNextcompaniesCode = async () => {
  const counterRef = doc(db, "counters", "companies");

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

// Add companies
export const addcompanies = async (companies) => {
  await setDoc(
    doc(db, "companies", companies.companiesCode),
    {
      ...companies,
      createdAt: serverTimestamp(),
    }
  );
};

// Real-time companiess
export const subscribecompanies = (callback) => {
  return onSnapshot(collection(db, "companies"), (snapshot) => {
    const companies = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(companies);
  });
};