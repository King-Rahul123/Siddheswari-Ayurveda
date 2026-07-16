import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate Next Product Code
export const getNextProductCode = async () => {
  const counterRef = doc(db, "counters", "product");

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

  return `PCM${nextId.toString().padStart(3, "0")}`;
};

// Add Product
export const addProduct = async (product) => {
  await setDoc(
    doc(db, "products", product.itemCode),
    {
      ...product,
      createdAt: serverTimestamp(),
    }
  );
};

// Real-time Products
export const subscribeProducts = (callback) => {
  return onSnapshot(collection(db, "products"), (snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(products);
  });
};