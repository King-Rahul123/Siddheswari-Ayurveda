import { 
  collection,
  doc, 
  setDoc, 
  serverTimestamp, 
  onSnapshot, 
  runTransaction, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Generate next Customer Code
export const getNextCustomerCode = async () => {
  const counterRef = doc(db, "counters", "customer");

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

// Add Customer
export const addCustomer = async (customer) => {
  await setDoc(
    doc(db, "customer", customer.customerCode),
    {
      ...customer,
      createdAt: serverTimestamp(),
    }
  );
};

// Check customer by phone number
export const checkCustomerPhone = async (phone) => {
  const q = query(
    collection(db, "customer"),
    where("phone", "==", phone)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }

  return null;
};

// Update Customer
export const updateCustomer = async (customerCode, customerData) => {
  const customerRef = doc(db, "customer", customerCode);

  await updateDoc(customerRef, {
    ...customerData,
  });
};

// Delete Customer
export const deleteCustomer = async (customerCode) => {
  await deleteDoc(doc(db, "customer", customerCode));
};

// Real-time customers
export const subscribeCustomers = (callback) => {
  return onSnapshot(collection(db, "customer"), (snapshot) => {
    const customers = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    callback(customers);
  });
};