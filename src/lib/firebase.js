// Firebase client for the Piri-Piri Wingding board.
//
// NOTE: a Firebase web config is public by design — it ships in the client
// bundle, and access is controlled by Realtime Database security rules +
// Anonymous Auth, not by hiding this config. The values below are therefore
// safe to publish. The apiKey is nonetheless pulled from a build-time env
// var (PUBLIC_FB_API_KEY) so the raw key literal stays out of committed
// source — supplied by a gitignored .env locally and a GitHub Actions
// repository variable in CI. It is additionally HTTP-referrer-locked to
// gszep.com / *.gszep.com / localhost.
//
// Provisioned under contact@gszep.com. To regenerate the config:
//   firebase apps:sdkconfig WEB --project gszep-wingding
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const apiKey = import.meta.env.PUBLIC_FB_API_KEY;
if (!apiKey) {
  throw new Error(
    "PUBLIC_FB_API_KEY is not set. Add it to .env locally, and as a GitHub " +
    "Actions repository variable for the deploy workflows.",
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: "gszep-wingding.firebaseapp.com",
  databaseURL: "https://gszep-wingding-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gszep-wingding",
  storageBucket: "gszep-wingding.firebasestorage.app",
  messagingSenderId: "46039239887",
  appId: "1:46039239887:web:9dc9d9e677475e2180bbba",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
