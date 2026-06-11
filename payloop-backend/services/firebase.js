const admin = require("firebase-admin");

let db = null;
let messaging = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    messaging = admin.messaging();
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("FIREBASE_SERVICE_ACCOUNT environment variable not found. Running with in-memory metadata store.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase Admin SDK. Falling back to in-memory mode.", e);
}

// Simulated in-memory database fallback to ensure zero-blocker development
const memoryDb = {
  store: {},
  collection(colName) {
    if (!this.store[colName]) {
      this.store[colName] = {};
    }
    const col = this.store[colName];
    return {
      async get() {
        const docs = Object.keys(col)
          .filter(id => col[id].exists)
          .map(id => ({
            id,
            data: () => col[id].data,
            exists: col[id].exists
          }));
        return {
          docs,
          forEach(callback) {
            docs.forEach(callback);
          }
        };
      },
      doc(docId) {
        if (!col[docId]) {
          col[docId] = { exists: false, data: {} };
        }
        return {
          async set(data, options = {}) {
            col[docId].exists = true;
            if (options.merge) {
              col[docId].data = { ...col[docId].data, ...data };
            } else {
              col[docId].data = data;
            }
            return { writeTime: new Date() };
          },
          async get() {
            return {
              exists: col[docId].exists,
              data: () => col[docId].data,
            };
          },
        };
      },
    };
  },
};

const getDb = () => db || memoryDb;

const sendPushNotification = async (token, title, body) => {
  if (messaging && token) {
    try {
      await messaging.send({
        token,
        notification: { title, body },
      });
      console.log(`Push Notification sent successfully to: ${token}`);
    } catch (e) {
      console.error("Error sending push notification via Firebase:", e);
    }
  } else {
    console.log(`[PUSH NOTIFICATION SIMULATED] Token: ${token || "GLOBAL_DEMO_DEVICE"}`);
    console.log(`  Title: ${title}`);
    console.log(`  Body:  ${body}`);
  }
};

module.exports = { getDb, sendPushNotification };
