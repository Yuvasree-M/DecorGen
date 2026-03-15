// import admin from "firebase-admin";
// import fs from "fs";

// const serviceAccount = JSON.parse(
//   fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
// );

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export const db = admin.firestore();
// export const auth = admin.auth();


import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();