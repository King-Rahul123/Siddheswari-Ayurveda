import {
  collection,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Show next bill number without incrementing
export const getCurrentSaleId = async () => {
  const counterRef = doc(db, "counters", "sale");
  const counterDoc = await getDoc(counterRef);
  let currentId = 0;
  if (counterDoc.exists()) {
    currentId = counterDoc.data().lastId || 0;
  }
  const nextId = currentId + 1;
  
  return `SDA-${nextId.toString().padStart(5, "0")}`;
};

// Generate Next Sale ID
export const getNextSaleId = async () => {
  const counterRef = doc(db, "counters", "sale");
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

  return `SDA-${nextId.toString().padStart(5, "0")}`;
};

// Save Sale with Items
export const addSale = async (saleData, items) => {
  const saleRef = doc(db, "sales", saleData.saleId);

  const batch = writeBatch(db);

  // Sale Header
  batch.set(saleRef, {
    ...saleData,
    createdAt: serverTimestamp(),
  });

  // Sale Items
  items.forEach((item, index) => {
    const itemRef = doc(
      collection(db, "sales", saleData.saleId, "items"),
      (index + 1).toString()
    );

    batch.set(itemRef, {
      itemCode: item.itemCode,
      batch: item.batch,
      qty: Number(item.qty),
      rate: Number(item.rate),
      discount: Number(item.discount || 0),
      amount: Number(item.amount),
    });
  });

  await batch.commit();
};

// Real-time Sales
export const subscribeSales = (callback) => {
  return onSnapshot(collection(db, "sales"), (snapshot) => {
    const sales = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(sales);
  });
};