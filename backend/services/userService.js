const { db, formatDoc, formatDocs, FieldValue } = require('../config/firebase');

const USERS_COLLECTION = 'users';
const VALID_ORGANIZER_EMAIL = 'organizercampusconnect@gmail.com';
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes active session window

class UserService {
  constructor() {
    this._lastTouchMap = new Map();
    this._inMemoryActiveSessions = new Set();
  }

  /**
   * Find user by Clerk User ID or Supabase UID
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
   * Find user by document ID
   */
  async findById(id) {
    if (!id) return null;
    const snap = await db.collection(USERS_COLLECTION).doc(id).get();
    if (snap.exists) {
      return formatDoc(snap);
    }
    return this.findByClerkId(id);
  }

  /**
   * Atomic user provisioning / linking
   * Rule: Exactly ONE organizer account is permitted: organizercampusconnect@gmail.com.
   * All other users are strictly students.
   */
  async syncOrProvisionUser({ clerkUserId, email, name, role, profileImage }) {
    const cleanEmail = email.toLowerCase().trim();
    const userRef = db.collection(USERS_COLLECTION).doc(clerkUserId);

    const isOrganizer = role === 'organizer' || cleanEmail === VALID_ORGANIZER_EMAIL;
    const determinedRole = isOrganizer ? 'organizer' : (role || 'student');

    // 1. Check if user document already exists at users/{clerkUserId}
    const snap = await userRef.get();
    if (snap.exists) {
      const existing = snap.data();
      const currentRole = existing.role || determinedRole;
      const updates = {
        updatedAt: new Date(),
        role: currentRole,
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
      const currentRole = existingByEmail.role || determinedRole;
      await existingRef.set({
        clerkUserId,
        clerkId: clerkUserId,
        role: currentRole,
        avatar: profileImage || existingByEmail.avatar,
        profileImage: profileImage || existingByEmail.profileImage,
        updatedAt: new Date(),
      }, { merge: true });

      const updatedDoc = await existingRef.get();
      return formatDoc(updatedDoc);
    }

    // 3. Create new user document
    const now = new Date();
    const newUser = {
      clerkUserId,
      clerkId: clerkUserId,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0] || (determinedRole === 'organizer' ? 'Campus Organizer' : 'Student'),
      role: determinedRole,
      avatar: profileImage || null,
      profileImage: profileImage || null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    await userRef.set(newUser);
    const createdSnap = await userRef.get();
    return formatDoc(createdSnap);
  }

  /**
   * Record real authenticated student session activity
   */
  async touchStudentActivity(userId) {
    if (!userId) return;
    const now = Date.now();
    this._inMemoryActiveSessions.add(userId);

    // Throttle database write to at most once per 60 seconds
    const lastTouch = this._lastTouchMap.get(userId);
    if (lastTouch && (now - lastTouch) < 60000) {
      return;
    }
    this._lastTouchMap.set(userId, now);

    try {
      await db.collection(USERS_COLLECTION).doc(userId).set({
        lastActiveAt: new Date(),
        isActiveSession: true,
      }, { merge: true });
    } catch (e) {
      // non-fatal
    }
  }

  /**
   * End student session on explicit logout
   */
  async endStudentSession(userId) {
    if (!userId) return;
    this._inMemoryActiveSessions.delete(userId);
    this._lastTouchMap.delete(userId);

    try {
      await db.collection(USERS_COLLECTION).doc(userId).set({
        isActiveSession: false,
        lastActiveAt: null,
      }, { merge: true });
    } catch (e) {
      // non-fatal
    }
  }

  /**
   * Count real registered student accounts from the database
   * Rules:
   * - Must display the total number of real students who have registered for CampusConnect.
   * - Count actual registered student accounts from the existing database.
   * - Do NOT count:
   *   * Currently logged-in students only
   *   * Active sessions
   *   * Organizer accounts
   *   * Deleted users
   *   * Demo users
   *   * Seeded/default/test student accounts
   * - The number increases automatically when a real student registers.
   */
  async countRegisteredStudents() {
    try {
      const snap = await db.collection(USERS_COLLECTION).get();
      const allUsers = formatDocs(snap);

      const realStudents = allUsers.filter((u) => {
        // Exclude deleted accounts
        if (u.isDeleted === true) {
          return false;
        }

        const role = (u.role || '').toLowerCase().trim();
        const email = (u.email || '').toLowerCase().trim();

        // Must NOT be an organizer account
        if (role === 'organizer' || email === VALID_ORGANIZER_EMAIL) {
          return false;
        }

        // Exclude demo / seeded / test student accounts
        const id = String(u.id || '');
        if (
          u.isDemo === true ||
          u.isSeeded === true ||
          id.startsWith('student_demo_') ||
          id.startsWith('organizer_') ||
          id.startsWith('demo_') ||
          email.includes('@campusconnect.com') ||
          email === 'student@campusconnect.com'
        ) {
          return false;
        }

        // Must have an email or valid registered user record
        if (!email && !u.clerkUserId && !u.clerkId && !u.supabaseUid) {
          return false;
        }

        return true;
      });

      return realStudents.length;
    } catch (error) {
      console.error('countRegisteredStudents error:', error);
      return 0;
    }
  }

  /**
   * Alias for backward compatibility
   */
  async countActiveStudents() {
    return this.countRegisteredStudents();
  }

  /**
   * Count real registered organizer accounts from the database
   * Rules:
   * - Must display the total number of real organizers who have registered/been created as organizer accounts in CampusConnect.
   * - Do NOT hardcode the value to 1.
   * - Count actual valid organizer accounts/records from the database.
   * - Do NOT count:
   *   * Deleted organizers
   *   * Demo organizers
   *   * Seeded/test organizers
   *   * Student accounts
   *   * Any invalid or inactive organizer records
   * - For current database (only organizercampusconnect@gmail.com): returns 1.
   * - If another legitimate organizer is created: automatically returns 2.
   * - If an organizer is deleted: count decreases accordingly.
   */
  async countOrganizers() {
    try {
      const snap = await db.collection(USERS_COLLECTION).get();
      const allUsers = formatDocs(snap);

      const realOrganizers = allUsers.filter((u) => {
        // Exclude deleted accounts
        if (u.isDeleted === true) {
          return false;
        }

        // Must have organizer role, never a student
        const role = (u.role || '').toLowerCase().trim();
        if (role !== 'organizer') {
          return false;
        }

        // Exclude demo / test organizers
        const email = (u.email || '').toLowerCase().trim();
        const id = String(u.id || '');
        if (
          u.isDemo === true ||
          u.isSeeded === true ||
          id.startsWith('organizer_demo_') ||
          email === 'organizer@campusconnect.com' ||
          email === 'demo_organizer@campusconnect.com'
        ) {
          return false;
        }

        // Must have a valid email
        if (!email) {
          return false;
        }

        return true;
      });

      return realOrganizers.length;
    } catch (error) {
      console.error('countOrganizers error:', error);
      return 0;
    }
  }

  /**
   * Count users by role
   */
  async countUsers(role) {
    if (role === 'organizer') {
      return this.countOrganizers();
    }
    if (role === 'student') {
      return this.countRegisteredStudents();
    }

    const snap = await db.collection(USERS_COLLECTION).get();
    return formatDocs(snap).length;
  }

  /**
   * Get all users, filtered according to strict business logic
   */
  async getAllUsers(roleFilter) {
    const snap = await db.collection(USERS_COLLECTION).get();
    const allUsers = formatDocs(snap);

    const validUsers = allUsers.filter((u) => {
      const email = (u.email || '').toLowerCase().trim();
      const id = String(u.id || '');

      // Exclude deleted users
      if (u.isDeleted === true) return false;

      // Exclude demo / test organizer records
      if (
        u.role === 'organizer' &&
        (u.isDemo === true || u.isSeeded === true || id.startsWith('organizer_demo_') || email === 'organizer@campusconnect.com')
      ) {
        return false;
      }

      // Exclude old seeded/demo student records
      if (
        u.isDemo === true ||
        u.isSeeded === true ||
        id.startsWith('student_demo_') ||
        id.startsWith('demo_') ||
        email === 'student@campusconnect.com' ||
        email.endsWith('@campusconnect.com')
      ) {
        return false;
      }

      return true;
    });

    if (roleFilter === 'organizer') {
      return validUsers.filter((u) => u.role === 'organizer');
    }

    if (roleFilter === 'student') {
      return validUsers.filter((u) => u.role === 'student');
    }

    return validUsers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
    this._inMemoryActiveSessions.delete(user.id);
    this._lastTouchMap.delete(user.id);
    return true;
  }
}

module.exports = new UserService();
