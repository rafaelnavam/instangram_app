// src/front/js/component/ecommer/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// // Tu configuración de Firebase
// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID,
//     measurementId: process.env.FIREBASE_MEASUREMENT_ID
// };

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIvsrml02FAILppybGb3ptCaknirovSEg",
  authDomain: "momentum-app-c3ce6.firebaseapp.com",
  projectId: "momentum-app-c3ce6",
  storageBucket: "momentum-app-c3ce6.appspot.com",
  messagingSenderId: "912191153793",
  appId: "1:912191153793:web:efe5c2a9b831d6bdc44f80",
  measurementId: "G-YFVH3X301R",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
