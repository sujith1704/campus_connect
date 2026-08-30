import React, { createContext, useState, useCallback, useContext, useEffect, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const DataContext = createContext();

const CACHE_TTL = 300000; // 5 minutes session cache

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  // Cache stores: { data, fetchedAt }
  const [organizerEvents, setOrganizerEvents] = useState({ data: null, fetchedAt: 0 });
  const [studentRegistrations, setStudentRegistrations] = useState({ data: null, fetchedAt: 0 });
  const [deletedEvents, setDeletedEvents] = useState({ data: null, fetchedAt: 0 });
  const [approvedEvents, setApprovedEvents] = useState({ data: null, fetchedAt: 0 });
  const [platformStats, setPlatformStats] = useState({ data: null, fetchedAt: 0 });
  const [adminData, setAdminData] = useState({ data: null, fetchedAt: 0 });
  const [eventDetailsCache, setEventDetailsCache] = useState({});
  const [eventAttendeesCache, setEventAttendeesCache] = useState({});

  // Loading states
  const [organizerEventsLoading, setOrganizerEventsLoading] = useState(false);
  const [studentRegistrationsLoading, setStudentRegistrationsLoading] = useState(false);
  const [deletedEventsLoading, setDeletedEventsLoading] = useState(false);
  const [approvedEventsLoading, setApprovedEventsLoading] = useState(false);
  const [platformStatsLoading, setPlatformStatsLoading] = useState(false);

  // Refs to allow stable callbacks without re-triggering component consumers
  const organizerEventsRef = useRef(organizerEvents);
  organizerEventsRef.current = organizerEvents;

  const studentRegistrationsRef = useRef(studentRegistrations);
  studentRegistrationsRef.current = studentRegistrations;

  const deletedEventsRef = useRef(deletedEvents);
  deletedEventsRef.current = deletedEvents;

  const approvedEventsRef = useRef(approvedEvents);
  approvedEventsRef.current = approvedEvents;

  const platformStatsRef = useRef(platformStats);
  platformStatsRef.current = platformStats;

  const adminDataRef = useRef(adminData);
  adminDataRef.current = adminData;

  const eventDetailsCacheRef = useRef(eventDetailsCache);
  eventDetailsCacheRef.current = eventDetailsCache;

  const eventAttendeesCacheRef = useRef(eventAttendeesCache);
  eventAttendeesCacheRef.current = eventAttendeesCache;

  // Prevent concurrent duplicate fetches
  const activePromises = useRef({});

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizerEvents({ data: null, fetchedAt: 0 });
      setStudentRegistrations({ data: null, fetchedAt: 0 });
      setDeletedEvents({ data: null, fetchedAt: 0 });
      setApprovedEvents({ data: null, fetchedAt: 0 });
      setPlatformStats({ data: null, fetchedAt: 0 });
      setAdminData({ data: null, fetchedAt: 0 });
      setEventDetailsCache({});
      setEventAttendeesCache({});
      activePromises.current = {};
    }
  }, [isAuthenticated]);

  // 1. Fetch Organizer Events (Stable callback reference)
  const fetchOrganizerEvents = useCallback(async (force = false) => {
    const now = Date.now();
    const current = organizerEventsRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.organizerEvents) {
      return activePromises.current.organizerEvents;
    }
    if (current.data === null) {
      setOrganizerEventsLoading(true);
    }
    const promise = (async () => {
      try {
        const res = await API.get('/events/organizer/my-events');
        if (res.data.success) {
          const data = res.data.data || [];
          setOrganizerEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return current.data || [];
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        return current.data || [];
      } finally {
        setOrganizerEventsLoading(false);
        delete activePromises.current.organizerEvents;
      }
    })();
    activePromises.current.organizerEvents = promise;
    return promise;
  }, []);

  // 2. Fetch Student Registrations (Stable callback reference)
  const fetchStudentRegistrations = useCallback(async (force = false) => {
    const now = Date.now();
    const current = studentRegistrationsRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.studentRegistrations) {
      return activePromises.current.studentRegistrations;
    }
    if (current.data === null) {
      setStudentRegistrationsLoading(true);
    }
    const promise = (async () => {
      try {
        const res = await API.get('/registrations/my-registrations');
        if (res.data.success) {
          const data = res.data.data || [];
          setStudentRegistrations({ data, fetchedAt: Date.now() });
          return data;
        }
        return current.data || [];
      } catch (error) {
        console.error('Error fetching student registrations:', error);
        return current.data || [];
      } finally {
        setStudentRegistrationsLoading(false);
        delete activePromises.current.studentRegistrations;
      }
    })();
    activePromises.current.studentRegistrations = promise;
    return promise;
  }, []);

  // 3. Fetch Deleted Events (Stable callback reference)
  const fetchDeletedEvents = useCallback(async (force = false) => {
    const now = Date.now();
    const current = deletedEventsRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.deletedEvents) {
      return activePromises.current.deletedEvents;
    }
    if (current.data === null) {
      setDeletedEventsLoading(true);
    }
    const promise = (async () => {
      try {
        const res = await API.get('/events/deleted');
        if (res.data.success) {
          const data = res.data.data || [];
          setDeletedEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return current.data || [];
      } catch (error) {
        console.error('Error fetching deleted events:', error);
        return current.data || [];
      } finally {
        setDeletedEventsLoading(false);
        delete activePromises.current.deletedEvents;
      }
    })();
    activePromises.current.deletedEvents = promise;
    return promise;
  }, []);

  // 4. Fetch Approved Events (Stable callback reference)
  const fetchApprovedEvents = useCallback(async (force = false) => {
    const now = Date.now();
    const current = approvedEventsRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.approvedEvents) {
      return activePromises.current.approvedEvents;
    }
    if (current.data === null) {
      setApprovedEventsLoading(true);
    }
    const promise = (async () => {
      try {
        const res = await API.get('/events?status=approved');
        if (res.data.success) {
          const data = res.data.data || [];
          setApprovedEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return current.data || [];
      } catch (error) {
        console.error('Error fetching approved events:', error);
        return current.data || [];
      } finally {
        setApprovedEventsLoading(false);
        delete activePromises.current.approvedEvents;
      }
    })();
    activePromises.current.approvedEvents = promise;
    return promise;
  }, []);

  // 5. Fetch Platform Stats (Stable callback reference)
  const fetchPlatformStats = useCallback(async (force = false) => {
    const now = Date.now();
    const current = platformStatsRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.platformStats) {
      return activePromises.current.platformStats;
    }
    if (current.data === null) {
      setPlatformStatsLoading(true);
    }
    const promise = (async () => {
      try {
        const res = await API.get('/stats');
        if (res.data) {
          const raw = res.data.data || res.data;
          const formatted = {
            eventsHosted: typeof raw.eventsHosted === 'number' ? raw.eventsHosted : 0,
            activeRegistrations: typeof raw.activeRegistrations === 'number' ? raw.activeRegistrations : 0,
            organizers: typeof raw.organizers === 'number' ? raw.organizers : 0,
            verifiedEvents: 100,
          };
          setPlatformStats({ data: formatted, fetchedAt: Date.now() });
          return formatted;
        }
        return current.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        return current.data;
      } finally {
        setPlatformStatsLoading(false);
        delete activePromises.current.platformStats;
      }
    })();
    activePromises.current.platformStats = promise;
    return promise;
  }, []);

  // 6. Fetch Event Details by ID (Stable callback reference)
  const fetchEventDetails = useCallback(async (eventId, force = false) => {
    const now = Date.now();
    const cached = eventDetailsCacheRef.current[eventId];
    if (!force && cached && (now - cached.fetchedAt) < CACHE_TTL) {
      return cached.data;
    }
    const key = `event_${eventId}`;
    if (activePromises.current[key]) {
      return activePromises.current[key];
    }
    const promise = (async () => {
      try {
        const res = await API.get(`/events/${eventId}`);
        if (res.data.success) {
          const data = res.data.data;
          setEventDetailsCache((prev) => ({
            ...prev,
            [eventId]: { data, fetchedAt: Date.now() },
          }));
          return data;
        }
        return cached?.data || null;
      } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error);
        return cached?.data || null;
      } finally {
        delete activePromises.current[key];
      }
    })();
    activePromises.current[key] = promise;
    return promise;
  }, []);

  // 7. Fetch Event Attendees by Event ID (Stable callback reference)
  const fetchEventAttendees = useCallback(async (eventId, force = false) => {
    const now = Date.now();
    const cached = eventAttendeesCacheRef.current[eventId];
    if (!force && cached && (now - cached.fetchedAt) < CACHE_TTL) {
      return cached;
    }
    const key = `attendees_${eventId}`;
    if (activePromises.current[key]) {
      return activePromises.current[key];
    }
    const promise = (async () => {
      try {
        const res = await API.get(`/registrations/event/${eventId}`);
        if (res.data.success) {
          const payload = {
            registrations: res.data.data || [],
            eventTitle: res.data.eventTitle || '',
            fetchedAt: Date.now(),
          };
          setEventAttendeesCache((prev) => ({
            ...prev,
            [eventId]: payload,
          }));
          return payload;
        }
        return cached || { registrations: [], eventTitle: '' };
      } catch (error) {
        console.error(`Error fetching attendees for event ${eventId}:`, error);
        return cached || { registrations: [], eventTitle: '' };
      } finally {
        delete activePromises.current[key];
      }
    })();
    activePromises.current[key] = promise;
    return promise;
  }, []);

  // 8. Fetch Admin Data (Stable callback reference)
  const fetchAdminData = useCallback(async (force = false) => {
    const now = Date.now();
    const current = adminDataRef.current;
    if (!force && current.data !== null && (now - current.fetchedAt) < CACHE_TTL) {
      return current.data;
    }
    if (activePromises.current.adminData) {
      return activePromises.current.adminData;
    }
    const promise = (async () => {
      try {
        const [statsRes, usersRes, eventsRes, regsRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/users'),
          API.get('/events/organizer/my-events?scope=all'),
          API.get('/registrations/all'),
        ]);
        const data = {
          stats: statsRes.data.success ? statsRes.data.stats : null,
          users: usersRes.data.success ? usersRes.data.data : [],
          events: eventsRes.data.success ? eventsRes.data.data : [],
          registrations: regsRes.data.success ? regsRes.data.data : [],
        };
        setAdminData({ data, fetchedAt: Date.now() });
        return data;
      } catch (error) {
        console.error('Error fetching admin data:', error);
        return current.data || null;
      } finally {
        delete activePromises.current.adminData;
      }
    })();
    activePromises.current.adminData = promise;
    return promise;
  }, []);

  // =========================================================================
  // GRANULAR CACHE MUTATION HELPERS (Smooth in-place updates, NO full-page flashes)
  // =========================================================================

  // Add newly created event to cache
  const addEventToCache = useCallback((newEvent) => {
    if (!newEvent || !newEvent._id) return;
    setOrganizerEvents((prev) => ({
      data: prev.data ? [newEvent, ...prev.data.filter((e) => e._id !== newEvent._id)] : [newEvent],
      fetchedAt: Date.now(),
    }));
    if (newEvent.status === 'approved') {
      setApprovedEvents((prev) => ({
        data: prev.data ? [newEvent, ...prev.data.filter((e) => e._id !== newEvent._id)] : [newEvent],
        fetchedAt: Date.now(),
      }));
    }
    setEventDetailsCache((prev) => ({
      ...prev,
      [newEvent._id]: { data: newEvent, fetchedAt: Date.now() },
    }));
  }, []);

  // Update existing event in cache
  const updateEventInCache = useCallback((updatedEvent) => {
    if (!updatedEvent || !updatedEvent._id) return;
    setOrganizerEvents((prev) => ({
      data: prev.data ? prev.data.map((e) => (e._id === updatedEvent._id ? { ...e, ...updatedEvent } : e)) : null,
      fetchedAt: prev.fetchedAt || Date.now(),
    }));
    setApprovedEvents((prev) => ({
      data: prev.data ? prev.data.map((e) => (e._id === updatedEvent._id ? { ...e, ...updatedEvent } : e)) : null,
      fetchedAt: prev.fetchedAt || Date.now(),
    }));
    setEventDetailsCache((prev) => ({
      ...prev,
      [updatedEvent._id]: {
        data: prev[updatedEvent._id]?.data ? { ...prev[updatedEvent._id].data, ...updatedEvent } : updatedEvent,
        fetchedAt: Date.now(),
      },
    }));
  }, []);

  // Delete event (move to deletedEvents in cache)
  const removeEventFromCache = useCallback((eventId, deletedEventObj) => {
    if (!eventId) return;
    let target = deletedEventObj;
    setOrganizerEvents((prev) => {
      if (prev.data) {
        if (!target) target = prev.data.find((e) => e._id === eventId);
        return { data: prev.data.filter((e) => e._id !== eventId), fetchedAt: Date.now() };
      }
      return prev;
    });
    setApprovedEvents((prev) => ({
      data: prev.data ? prev.data.filter((e) => e._id !== eventId) : null,
      fetchedAt: Date.now(),
    }));
    if (target) {
      const markedDeleted = { ...target, isDeleted: true, deletedAt: new Date().toISOString() };
      setDeletedEvents((prev) => ({
        data: prev.data ? [markedDeleted, ...prev.data.filter((e) => e._id !== eventId)] : [markedDeleted],
        fetchedAt: Date.now(),
      }));
      setEventDetailsCache((prev) => ({
        ...prev,
        [eventId]: { data: markedDeleted, fetchedAt: Date.now() },
      }));
    }
  }, []);

  // Restore deleted event
  const restoreEventInCache = useCallback((eventId, restoredEvent) => {
    if (!eventId) return;
    setDeletedEvents((prev) => ({
      data: prev.data ? prev.data.filter((e) => e._id !== eventId) : [],
      fetchedAt: Date.now(),
    }));
    if (restoredEvent) {
      const activeObj = { ...restoredEvent, isDeleted: false };
      setOrganizerEvents((prev) => ({
        data: prev.data ? [activeObj, ...prev.data.filter((e) => e._id !== eventId)] : [activeObj],
        fetchedAt: Date.now(),
      }));
      if (activeObj.status === 'approved') {
        setApprovedEvents((prev) => ({
          data: prev.data ? [activeObj, ...prev.data.filter((e) => e._id !== eventId)] : [activeObj],
          fetchedAt: Date.now(),
        }));
      }
      setEventDetailsCache((prev) => ({
        ...prev,
        [eventId]: { data: activeObj, fetchedAt: Date.now() },
      }));
    }
  }, []);

  // Permanently purge deleted event
  const purgeEventFromCache = useCallback((eventId) => {
    if (!eventId) return;
    setDeletedEvents((prev) => ({
      data: prev.data ? prev.data.filter((e) => e._id !== eventId) : [],
      fetchedAt: Date.now(),
    }));
    setEventDetailsCache((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  }, []);

  // Add new student registration to cache
  const addRegistrationToCache = useCallback((newRegistration) => {
    if (!newRegistration) return;
    setStudentRegistrations((prev) => ({
      data: prev.data ? [newRegistration, ...prev.data.filter((r) => r._id !== newRegistration._id)] : [newRegistration],
      fetchedAt: Date.now(),
    }));
    const eventId = newRegistration.event?._id || newRegistration.event;
    if (eventId) {
      setEventDetailsCache((prev) => {
        if (prev[eventId]?.data) {
          return {
            ...prev,
            [eventId]: {
              data: {
                ...prev[eventId].data,
                registeredCount: (prev[eventId].data.registeredCount || 0) + 1,
              },
              fetchedAt: Date.now(),
            },
          };
        }
        return prev;
      });
      setApprovedEvents((prev) => ({
        data: prev.data ? prev.data.map((e) => e._id === eventId ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e) : null,
        fetchedAt: prev.fetchedAt || Date.now(),
      }));
    }
  }, []);

  // Cancel student registration in cache
  const cancelRegistrationInCache = useCallback((registrationId, eventId) => {
    setStudentRegistrations((prev) => {
      if (!prev.data) return prev;
      return {
        data: prev.data.map((r) => r._id === registrationId ? { ...r, status: 'cancelled' } : r),
        fetchedAt: Date.now(),
      };
    });
    if (eventId) {
      setEventDetailsCache((prev) => {
        if (prev[eventId]?.data) {
          return {
            ...prev,
            [eventId]: {
              data: {
                ...prev[eventId].data,
                registeredCount: Math.max(0, (prev[eventId].data.registeredCount || 0) - 1),
              },
              fetchedAt: Date.now(),
            },
          };
        }
        return prev;
      });
      setApprovedEvents((prev) => ({
        data: prev.data ? prev.data.map((e) => e._id === eventId ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 0) - 1) } : e) : null,
        fetchedAt: prev.fetchedAt || Date.now(),
      }));
    }
  }, []);

  // Soft invalidation helpers (expire timestamp without clearing data array)
  const invalidateOrganizerEvents = useCallback(() => {
    setOrganizerEvents((prev) => ({ data: prev.data, fetchedAt: 0 }));
    setApprovedEvents((prev) => ({ data: prev.data, fetchedAt: 0 }));
    setAdminData((prev) => ({ data: prev.data, fetchedAt: 0 }));
  }, []);

  const invalidateStudentRegistrations = useCallback(() => {
    setStudentRegistrations((prev) => ({ data: prev.data, fetchedAt: 0 }));
  }, []);

  const invalidateDeletedEvents = useCallback(() => {
    setDeletedEvents((prev) => ({ data: prev.data, fetchedAt: 0 }));
  }, []);

  const invalidateEvent = useCallback((eventId) => {
    if (!eventId) return;
    setEventDetailsCache((prev) => {
      if (prev[eventId]) {
        return { ...prev, [eventId]: { data: prev[eventId].data, fetchedAt: 0 } };
      }
      return prev;
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        // Organizer events
        organizerEvents: organizerEvents.data,
        organizerEventsLoading,
        fetchOrganizerEvents,
        invalidateOrganizerEvents,
        addEventToCache,
        updateEventInCache,
        removeEventFromCache,
        restoreEventInCache,
        purgeEventFromCache,

        // Student registrations
        studentRegistrations: studentRegistrations.data,
        studentRegistrationsLoading,
        fetchStudentRegistrations,
        invalidateStudentRegistrations,
        addRegistrationToCache,
        cancelRegistrationInCache,

        // Deleted events
        deletedEvents: deletedEvents.data,
        deletedEventsLoading,
        fetchDeletedEvents,
        invalidateDeletedEvents,

        // Approved events
        approvedEvents: approvedEvents.data,
        approvedEventsLoading,
        fetchApprovedEvents,

        // Platform stats
        platformStats: platformStats.data,
        platformStatsLoading,
        fetchPlatformStats,

        // Event details cache
        eventDetailsCache,
        fetchEventDetails,
        invalidateEvent,

        // Event attendees cache
        fetchEventAttendees,

        // Admin panel data
        adminData: adminData.data,
        fetchAdminData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
