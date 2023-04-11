const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');
const config = require('../config.json');
const { logActivity } = require('./logger');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateEsteem(guildId, userId, delta) {
  const userRef = db.collection('reputation').doc(guildId).collection('users').doc(userId);
  await userRef.set({ reputation: admin.firestore.FieldValue.increment(delta) }, { merge: true });
  await userRef.set({ lastActivityTimestamp: Date.now() }, { merge: true });
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
 * @returns {Promise<void>} - A promise that resolves when the decay is complete.
 */
async function decayPoints(guildId) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const currentTimestamp = Date.now();

  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .get();

  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    const lastActivityTimestamp = userData.lastActivityTimestamp;
    const inactiveDays = Math.floor((currentTimestamp - lastActivityTimestamp) / oneDayMs);
    if (userData.reputation === 0) return;

    if (inactiveDays > 0) {
      const decayAmount = config.repConstants.InactivityDecayCoefficient * Math.pow(inactiveDays, 2);
      const newRep = Math.max(userData.reputation - decayAmount, 0);

      userDoc.ref.update({ reputation: newRep });
      logActivity(`Decayed ${decayAmount} points from ${userDoc.id} for being inactive for ${inactiveDays} days.`);
    }
  });
}

module.exports = {
  updateEsteem,
  burnEsteem,
  getEsteem,
  getTopEsteem,
  getBurnedEsteem,
  getTotalEsteem,
  getUserRank,
  decayPoints,
};
