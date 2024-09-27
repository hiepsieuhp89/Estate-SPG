import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Add this new function
export const isLoggedIn = () => {
  return auth.currentUser !== null;
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
