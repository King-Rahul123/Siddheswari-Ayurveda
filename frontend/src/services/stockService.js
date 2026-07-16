import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate Stock ID
export const getNextStockId = async () => {
  const counterRef = doc(db, "counters", "stock");

  const nextId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentId = 0;

    if (counterDoc.exists()) {
      currentId = counterDoc.data().lastId || 0;
    }

    const newId = currentId + 1;

    transaction.set(
      counterRef,
      { lastId: newId },
      { merge: true }
    );

    return newId;
  });

  return `STOCK${nextId.toString().padStart(6, "0")}`;
};

// Add Stock Batch
export const addStock = async (stock) => {
  await setDoc(
    doc(db, "stock", stock.stockId),
    {
      ...stock,
      createdAt: serverTimestamp(),
    }
  );
};

// Subscribe Stock
export const subscribeStock = (callback) => {
  return onSnapshot(collection(db, "stock"), (snapshot) => {
    const stock = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(stock);
  });
};