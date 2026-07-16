import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const login = async (username, password) => {

    const userRef = doc(db, "staff", username);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("Username not found");
    }

    const user = userSnap.data();

    if (user.password !== password) {
        throw new Error("Incorrect password");
    }

    // Save login session
    localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
            username,
            ...user,
        })
    );

    return user;
};

export const logout = () => {
    localStorage.removeItem("loggedInUser");
    sessionStorage.clear();
};

export const changePassword = async (
  username,
  currentPassword,
  newPassword
) => {
  const userRef = doc(db, "staff", username);

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const user = userSnap.data();

  // Check current password
  if (user.password !== currentPassword) {
    throw new Error("Current password is incorrect");
  }

  // Update password
  await updateDoc(userRef, {
    password: newPassword,
  });

  // Update localStorage
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  localStorage.setItem(
    "loggedInUser",
    JSON.stringify({
      ...loggedInUser,
      password: newPassword,
    })
  );

  return true;
};

export const resetPassword = () => {
    throw new Error("Reset password is not implemented.");
};