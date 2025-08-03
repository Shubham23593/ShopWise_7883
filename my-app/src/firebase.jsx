import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA106yirWtgxq_mjksdXOSQB5nUj94dcJE",
  authDomain: "authentication-939a7.firebaseapp.com",
  projectId: "authentication-939a7",
  storageBucket: "authentication-939a7.appspot.com",
  messagingSenderId: "438250504911",
  appId: "1:438250504911:web:6c232dca3214b23408adba"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
