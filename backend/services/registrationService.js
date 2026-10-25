const { db, formatDoc, formatDocs } = require('../config/firebase');
const eventService = require('./eventService');
const userService = require('./userService');

const REGISTRATIONS_COLLECTION = 'registrations';

class RegistrationService {
  /**
   * Helper to populate event and student on a registration object
   */
  async populateRegistration(reg) {
    if (!reg) return null;

    // 1. Populate event
    if (reg.event && typeof reg.event === 'string') {
      const eventDoc = await eventService.getEventById(reg.event);
      reg.event = eventDoc || { _id: reg.event, id: reg.event, title: 'Unknown Event', isDeleted: true };
    } else if (!reg.event) {
      reg.event = { title: 'Unknown Event', isDeleted: true };
    }

    // 2. Populate student
    if (reg.student && typeof reg.student === 'string') {
      const studentDoc = await userService.findById(reg.student);
      reg.student = studentDoc ? {
        _id: studentDoc.id,
        id: studentDoc.id,
        name: studentDoc.name,
        email: studentDoc.email,
        createdAt: studentDoc.createdAt,
      } : { _id: reg.student, id: reg.student, name: 'Student', email: '' };
    }

    return reg;
  }

  /**
   * Find specific registration for a student and event
   */
  async findOne({ student, event }) {
    const snap = await db.collection(REGISTRATIONS_COLLECTION)
      .where('student', '==', student)
      .where('event', '==', event)
      .limit(1)
      .get();

    if (snap.empty) return null;
    return formatDoc(snap.docs[0]);
  }

  /**
   * Find registration by ID
   */
  async findById(id) {
    if (!id) return null;
    const snap = await db.collection(REGISTRATIONS_COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    const reg = formatDoc(snap);
    return await this.populateRegistration(reg);
  }

  /**
   * Register or re-activate a student registration
   */
  async createRegistration(params) {
    const studentId = params.studentId || params.student;
    const eventId = params.eventId || params.event;
    const docRef = db.collection(REGISTRATIONS_COLLECTION).doc();
    const now = new Date();

    const regData = {
      student: studentId,
      event: eventId,
      status: 'confirmed',
      registeredAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(regData);
    const snap = await docRef.get();
    const reg = formatDoc(snap);
    return await this.populateRegistration(reg);
  }

  /**
   * Update registration status (e.g. 'cancelled' or 'confirmed')
   */
  async updateStatus(id, newStatus) {
    const docRef = db.collection(REGISTRATIONS_COLLECTION).doc(id);
    const now = new Date();
    await docRef.update({
      status: newStatus,
      updatedAt: now,
      ...(newStatus === 'confirmed' ? { registeredAt: now } : {}),
    });

    const snap = await docRef.get();
    const reg = formatDoc(snap);
    return await this.populateRegistration(reg);
  }

  /**
   * Get all registrations for a student
   */
  async getStudentRegistrations(studentId, altId) {
    const ids = Array.from(new Set([studentId, altId].filter(Boolean)));
    let snap;
    if (ids.length <= 1) {
      const idToQuery = ids[0] || studentId;
      snap = await db.collection(REGISTRATIONS_COLLECTION)
        .where('student', '==', idToQuery)
        .get();
    } else {
      snap = await db.collection(REGISTRATIONS_COLLECTION)
        .where('student', 'in', ids)
        .get();
    }

    const regs = formatDocs(snap);
    const populated = await Promise.all(regs.map((r) => this.populateRegistration(r)));
    return populated.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
  }

  /**
   * Get confirmed registrations for an event (Attendance list)
   */
  async getEventRegistrations(eventId) {
    const snap = await db.collection(REGISTRATIONS_COLLECTION)
      .where('event', '==', eventId)
      .where('status', '==', 'confirmed')
      .get();

    const regs = formatDocs(snap);
    const populated = await Promise.all(regs.map((r) => this.populateRegistration(r)));
    return populated.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
  }

  /**
   * Get all registrations in system for Organizer Panel
   */
  async getAllRegistrations() {
    const snap = await db.collection(REGISTRATIONS_COLLECTION).get();
    const regs = formatDocs(snap);
    const populated = await Promise.all(regs.map((r) => this.populateRegistration(r)));
    return populated.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
  }

  /**
   * Delete registrations matching student or event
   */
  async deleteByStudent(studentId) {
    const snap = await db.collection(REGISTRATIONS_COLLECTION)
      .where('student', '==', studentId)
      .get();

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async deleteByEventIds(eventIds) {
    if (!eventIds || eventIds.length === 0) return;
    for (const eid of eventIds) {
      const snap = await db.collection(REGISTRATIONS_COLLECTION)
        .where('event', '==', eid)
        .get();

      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  /**
   * Count registrations
   */
  async countRegistrations({ status, eventIds } = {}) {
    let query = db.collection(REGISTRATIONS_COLLECTION);
    if (status) {
      query = query.where('status', '==', status);
    }

    const snap = await query.get();
    let regs = formatDocs(snap);
    if (eventIds && Array.isArray(eventIds)) {
      const set = new Set(eventIds.map(String));
      regs = regs.filter((r) => set.has(String(r.event)));
    }
    return regs.length;
  }
}

module.exports = new RegistrationService();
