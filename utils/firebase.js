const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');
const config = require('../config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Function to update points for a user.
 * @param {string} guildId - The ID of a guild for which to update points.
 * @param {string} userId - The ID of a user for which to update points.
 * @param {number} delta - The amount of points to add or subtract.
 * @returns {number} The new amount of points.
 */
async function updateEsteem(guildId, userId, delta) {
  const userRef = db.collection('reputation').doc(guildId).collection('users').doc(userId);
  await userRef.set({ reputation: admin.firestore.FieldValue.increment(delta) }, { merge: true });
  await userRef.set({ lastActivityTimestamp: Date.now() }, { merge: true });
  const userDoc = await userRef.get();
  return userDoc.data().reputation;
}

async function burnEsteem(guildId, amount) {
  const guildRef = db.collection('reputation').doc(guildId);
  await guildRef.set({ burned: admin.firestore.FieldValue.increment(amount) }, { merge: true });
}

async function getEsteem(guildId, userId) {
  const userRef = db.collection('reputation').doc(guildId).collection('users').doc(userId);
  const userDoc = await userRef.get();
  return userDoc.exists ? userDoc.data().reputation : 0;
}

async function getUserRank(guildId, userId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .orderBy('reputation', 'desc')
    .get();

  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, reputation: doc.data().reputation }));
  return users.findIndex(user => user.id === userId) + 1;
}

async function getTopEsteem(guildId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .orderBy('reputation', 'desc')
    .limit(10)
    .get();

  const topUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, reputation: doc.data().reputation }));
  return topUsers;
}

async function getBurnedEsteem(guildId) {
  const guildRef = db.collection('reputation').doc(guildId);
  const guildDoc = await guildRef.get();
  return guildDoc.exists ? guildDoc.data().burned : 0;
}

async function getDecayedEsteem(guildId) {
  const guildRef = db.collection('reputation').doc(guildId);
  const guildDoc = await guildRef.get();
  return guildDoc.exists ? guildDoc.data().decay : 0;
}

async function getTotalEsteem(guildId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .get();

  const totalRep = usersSnapshot.docs.reduce((acc, doc) => acc + doc.data().reputation, 0);
  return totalRep;
}

/**
 * Decay points for users who have not been active for a while using polynomial decay.
 * @param {string} guildId - The ID of a guild for which to decay points.
 * @returns {number} The total amount of decayed points.
 */
async function decayEsteem(guildId) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const currentTimestamp = Date.now();
  let totalDecayAmount = 0;
  const guildRef = db.collection('reputation').doc(guildId);
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .get();

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const lastActivityTimestamp = userData.lastActivityTimestamp;
    const inactiveDays = Math.floor((currentTimestamp - lastActivityTimestamp) / oneDayMs);
    if (userData.reputation === 0) continue;
    let newRep = 0;

    if (inactiveDays > 0) {
      const decayAmount = config.repConstants.InactivityDecayCoefficient * Math.pow(inactiveDays, 2);
      if (userData.reputation > decayAmount) {
        newRep = userData.reputation - decayAmount;
        totalDecayAmount += decayAmount;
      } else {
        totalDecayAmount += userData.reputation;
      }
      await userDoc.ref.update({ reputation: newRep });
    }
  };

  guildRef.set({ decay: admin.firestore.FieldValue.increment(totalDecayAmount) }, { merge: true });
  return totalDecayAmount;
}

/**
 * Function to get all users and their reputation from a guild.
 * @param {string} guildId - The ID of a guild for which to get user IDs.
 * @returns {object} An object containing users snapshot.
 */
async function getAllUsers(guildId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .get();

  return usersSnapshot;
}

module.exports = {
  updateEsteem,
  burnEsteem,
  getEsteem,
  getTopEsteem,
  getBurnedEsteem,
  getDecayedEsteem,
  getTotalEsteem,
  getUserRank,
  decayEsteem,
  getAllUsers,
};
