const { db, formatDoc, formatDocs } = require('../config/firebase');
const userService = require('./userService');

const EVENTS_COLLECTION = 'events';

class EventService {
  /**
   * Helper to populate organizer details
   */
  async populateOrganizer(event) {
    if (!event) return null;
    if (event.organizer && typeof event.organizer === 'object' && event.organizer.name) {
      return event;
    }

    if (event.organizerData) {
      event.organizer = {
        _id: event.organizer,
        id: event.organizer,
        name: event.organizerData.name,
        email: event.organizerData.email,
      };
      return event;
    }

    const organizerUser = await userService.findById(event.organizer);
    event.organizer = organizerUser ? {
      _id: organizerUser.id,
      id: organizerUser.id,
      name: organizerUser.name,
      email: organizerUser.email,
    } : { _id: event.organizer, id: event.organizer, name: 'Campus Organizer', email: '' };

    return event;
  }

  /**
   * Get all events with filtering and text search
   */
  async getEvents({ search, category, status }) {
    let query = db.collection(EVENTS_COLLECTION).where('isDeleted', '==', false);

    const targetStatus = (status && ['approved', 'pending', 'rejected'].includes(status))
      ? status
      : 'approved';
    query = query.where('status', '==', targetStatus);

    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    const snap = await query.get();
    let events = formatDocs(snap);

    // Apply text search across title, venue, and description in-memory
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim().toLowerCase();
      events = events.filter((e) =>
        (e.title && e.title.toLowerCase().includes(term)) ||
        (e.venue && e.venue.toLowerCase().includes(term)) ||
        (e.description && e.description.toLowerCase().includes(term))
      );
    }

    // Populate organizer info
    const populated = await Promise.all(events.map((e) => this.populateOrganizer(e)));

    // Sort by createdAt descending
    return populated.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  /**
   * Get single event by ID
   */
  async getEventById(id) {
    if (!id) return null;
    const snap = await db.collection(EVENTS_COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    const event = formatDoc(snap);
    return await this.populateOrganizer(event);
  }

  /**
   * Create new event
   */
  async createEvent(eventData, organizerUser) {
    const docRef = db.collection(EVENTS_COLLECTION).doc();
    const now = new Date();

    const organizer = organizerUser || eventData.organizer || {};
    const organizerId = organizer.id || organizer._id || (typeof organizer === 'string' ? organizer : null);

    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      category: eventData.category || 'Technical',
      date: eventData.date,
      time: eventData.time,
      venue: eventData.venue,
      maxParticipants: eventData.maxParticipants || eventData.capacity || 1000,
      registeredCount: 0,
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      status: eventData.status || 'approved',
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      organizer: organizerId,
      organizerData: {
        name: organizer.name || '',
        email: organizer.email || '',
      },
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newEvent);
    const createdSnap = await docRef.get();
    const event = formatDoc(createdSnap);
    return await this.populateOrganizer(event);
  }

  /**
   * Update existing event
   */
  async updateEvent(id, updates) {
    const docRef = db.collection(EVENTS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const cleanUpdates = { ...updates, updatedAt: new Date() };
    await docRef.update(cleanUpdates);

    const updatedSnap = await docRef.get();
    const event = formatDoc(updatedSnap);
    return await this.populateOrganizer(event);
  }

  /**
   * Soft delete event
   */
  async deleteEvent(id, deletedByUserId) {
    const docRef = db.collection(EVENTS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const now = new Date();
    await docRef.update({
      isDeleted: true,
      deletedAt: now,
      deletedBy: deletedByUserId,
      updatedAt: now,
    });

    const updatedSnap = await docRef.get();
    return formatDoc(updatedSnap);
  }

  /**
   * Get events for organizer
   */
  async getOrganizerEvents(organizerId, scope) {
    let query = db.collection(EVENTS_COLLECTION).where('isDeleted', '==', false);

    if (scope !== 'all') {
      query = query.where('organizer', '==', organizerId);
    }

    const snap = await query.get();
    const events = formatDocs(snap);
    const populated = await Promise.all(events.map((e) => this.populateOrganizer(e)));
    return populated.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  /**
   * Get deleted events
   */
  async getDeletedEvents() {
    const snap = await db.collection(EVENTS_COLLECTION).where('isDeleted', '==', true).get();
    const events = formatDocs(snap);

    const populated = await Promise.all(
      events.map(async (e) => {
        const withOrg = await this.populateOrganizer(e);
        if (e.deletedBy) {
          const deleter = await userService.findById(e.deletedBy);
          withOrg.deletedBy = deleter ? { _id: deleter.id, id: deleter.id, name: deleter.name, email: deleter.email } : null;
        }
        return withOrg;
      })
    );

    return populated.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
  }

  /**
   * Approve or reject event status
   */
  async updateStatus(id, newStatus) {
    const docRef = db.collection(EVENTS_COLLECTION).doc(id);
    await docRef.update({
      status: newStatus,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return formatDoc(updated);
  }

  /**
   * Adjust registeredCount
   */
  async adjustRegisteredCount(id, delta) {
    const docRef = db.collection(EVENTS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const currentCount = snap.data().registeredCount || 0;
    const newCount = Math.max(0, currentCount + delta);
    await docRef.update({ registeredCount: newCount });
    return newCount;
  }

  /**
   * Count events
   */
  async countEvents({ isDeleted = false, status } = {}) {
    try {
      let query = db.collection(EVENTS_COLLECTION).where('isDeleted', '==', isDeleted);
      if (status) {
        query = query.where('status', '==', status);
      }
      const snap = await query.count().get();
      return snap.data().count;
    } catch (err) {
      let query = db.collection(EVENTS_COLLECTION).where('isDeleted', '==', isDeleted);
      if (status) {
        query = query.where('status', '==', status);
      }
      const snap = await query.get();
      return snap.size;
    }
  }
}

module.exports = new EventService();
