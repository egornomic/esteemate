const { async } = require('@firebase/util');
const admin = require('firebase-admin');
const db = admin.firestore();

async function updateRep(guildId, userId, delta) {
  const userRef = db.collection('reputation').doc(guildId).collection('users').doc(userId);
  await userRef.set({ reputation: admin.firestore.FieldValue.increment(delta) }, { merge: true });
}

async function burnRep(guildId, amount) {
  const guildRef = db.collection('reputation').doc(guildId);
  await guildRef.set({ burned: admin.firestore.FieldValue.increment(amount) }, { merge: true });
}

async function getRep(guildId, userId) {
  const userRef = db.collection('reputation').doc(guildId).collection('users').doc(userId);
  const userDoc = await userRef.get();
  return userDoc.exists ? userDoc.data().reputation : 0;
}

async function getTopRep(guildId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .orderBy('reputation', 'desc')
    .limit(10)
    .get();

  const topUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, reputation: doc.data().reputation }));
  return topUsers;
}

async function getBurnedRep(guildId) {
  const guildRef = db.collection('reputation').doc(guildId);
  const guildDoc = await guildRef.get();
  return guildDoc.exists ? guildDoc.data().burned : 0;
}

async function getTotalRep(guildId) {
  const usersSnapshot = await db.collection('reputation')
    .doc(guildId)
    .collection('users')
    .get();

  const totalRep = usersSnapshot.docs.reduce((acc, doc) => acc + doc.data().reputation, 0);
  return totalRep;
}

module.exports = {
  updateRep,
  burnRep,
  getRep,
  getTopRep,
  getBurnedRep,
  getTotalRep,
};
