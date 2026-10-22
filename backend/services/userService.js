const { db, formatDoc, formatDocs, FieldValue } = require('../config/firebase');

const USERS_COLLECTION = 'users';

class UserService {
  /**
   * Find user by Clerk User ID
   */
  async findByClerkId(clerkUserId) {
    if (!clerkUserId) return null;

    // 1. Check direct doc lookup by clerkUserId
    const docRef = db.collection(USERS_COLLECTION).doc(clerkUserId);
    const snap = await docRef.get();
    if (snap.exists) {
      return formatDoc(snap);
    }

    // 2. Fallback query by clerkUserId or clerkId field
    const q1 = await db.collection(USERS_COLLECTION)
      .where('clerkUserId', '==', clerkUserId)
      .limit(1)
      .get();

    if (!q1.empty) {
      return formatDoc(q1.docs[0]);
    }

    const q2 = await db.collection(USERS_COLLECTION)
      .where('clerkId', '==', clerkUserId)
      .limit(1)
      .get();

    if (!q2.empty) {
      return formatDoc(q2.docs[0]);
    }

    return null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const snap = await db.collection(USERS_COLLECTION)
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();

    if (snap.empty) return null;
    return formatDoc(snap.docs[0]);
  }

  /**
   * Find user by document ID or Clerk ID
   */
  async findById(id) {
    if (!id) return null;
    const snap = await db.collection(USERS_COLLECTION).doc(id).get();
    if (snap.exists) {
      return formatDoc(snap);
    }
    // Fallback to clerkId query
    return this.findByClerkId(id);
  }

  /**
   * Atomic user provisioning / linking
   */
  async syncOrProvisionUser({ clerkUserId, email, name, role, profileImage }) {
    const cleanEmail = email.toLowerCase().trim();
    const userRef = db.collection(USERS_COLLECTION).doc(clerkUserId);

    // 1. Check if user document already exists at users/{clerkUserId}
    const snap = await userRef.get();
    if (snap.exists) {
      const existing = snap.data();
      const updates = {
        updatedAt: new Date(),
      };
      if (profileImage && !existing.profileImage) {
        updates.avatar = profileImage;
        updates.profileImage = profileImage;
      }
      await userRef.update(updates);
      const updatedSnap = await userRef.get();
      return formatDoc(updatedSnap);
    }

    // 2. Check if a pre-existing record has this email under a different ID
    const existingByEmail = await this.findByEmail(cleanEmail);
    if (existingByEmail) {
      const existingRef = db.collection(USERS_COLLECTION).doc(existingByEmail.id);
      await existingRef.set({
        clerkUserId,
        clerkId: clerkUserId,
        avatar: profileImage || existingByEmail.avatar,
        profileImage: profileImage || existingByEmail.profileImage,
        updatedAt: new Date(),
      }, { merge: true });

      const updatedDoc = await existingRef.get();
      return formatDoc(updatedDoc);
    }

    // 3. Create new user document
    const now = new Date();
    const organizerEmail = (process.env.CAMPUSCONNECT_ORGANIZER_EMAIL || 'organizer@campusconnect.com').toLowerCase().trim();
    const isOrganizerEmail = cleanEmail === organizerEmail || cleanEmail === 'organizercampusconnect@gmail.com';

    // Strict role determination: designated organizer email is always organizer; all others default to student
    let determinedRole = 'student';
    if (isOrganizerEmail) {
      determinedRole = 'organizer';
    } else if (role === 'organizer') {
      determinedRole = 'organizer';
    }

    const newUser = {
      clerkUserId,
      clerkId: clerkUserId,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0] || 'Student',
      role: determinedRole,
      avatar: profileImage || null,
      profileImage: profileImage || null,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(newUser);
    const createdSnap = await userRef.get();
    return formatDoc(createdSnap);
  }

  /**
   * Get all users, optionally filtered by role
   */
  async getAllUsers(roleFilter) {
    let query = db.collection(USERS_COLLECTION);
    if (roleFilter && ['student', 'organizer'].includes(roleFilter)) {
      query = query.where('role', '==', roleFilter);
    }

    const snap = await query.get();
    const users = formatDocs(snap);
    // Sort in-memory to prevent complex composite index requirements
    return users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  /**
   * Count users by role
   */
  async countUsers(role) {
    let query = db.collection(USERS_COLLECTION);
    if (role) {
      query = query.where('role', '==', role);
    }
    const snap = await query.count().get();
    return snap.data().count;
  }

  /**
   * Update user role
   */
  async updateRole(id, newRole) {
    const user = await this.findById(id);
    if (!user) return null;

    const userRef = db.collection(USERS_COLLECTION).doc(user.id);
    await userRef.update({
      role: newRole,
      updatedAt: new Date(),
    });

    const updated = await userRef.get();
    return formatDoc(updated);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const user = await this.findById(id);
    if (!user) return false;
    await db.collection(USERS_COLLECTION).doc(user.id).delete();
    return true;
  }
}

module.exports = new UserService();
