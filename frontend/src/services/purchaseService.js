import {
  collection,
  doc,
//   setDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate Purchase ID
export const getNextPurchaseId = async () => {
  const counterRef = doc(db, "counters", "purchase");

  const nextId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentId = 0;

    if (counterDoc.exists()) {
      currentId = counterDoc.data().lastId || 0;
    }

    const newId = currentId + 1;

    transaction.set(counterRef, { lastId: newId }, { merge: true });

    return newId;
  });

  const year = new Date().getFullYear();

  return `PUR${year}${nextId.toString().padStart(4, "0")}`;
};

// Save Purchase with Items
export const addPurchase = async (purchaseData, items) => {
  const purchaseRef = doc(db, "purchases", purchaseData.purchaseId);

  const batch = writeBatch(db);

  // Purchase Header
  batch.set(purchaseRef, {
    ...purchaseData,
    createdAt: serverTimestamp(),
  });

  // Purchase Items
  items.forEach((item, index) => {
    const itemRef = doc(
      collection(db, "purchases", purchaseData.purchaseId, "items"),
      (index + 1).toString()
    );

    batch.set(itemRef, item);
  });

  await batch.commit();
};

// Real-time Purchase List
export const subscribePurchases = (callback) => {
  return onSnapshot(collection(db, "purchases"), (snapshot) => {
    const purchases = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(purchases);
  });
};