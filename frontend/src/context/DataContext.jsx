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

  // 1. Fetch Organizer Events
  const fetchOrganizerEvents = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && organizerEvents.data !== null && (now - organizerEvents.fetchedAt) < CACHE_TTL) {
      return organizerEvents.data;
    }
    if (activePromises.current.organizerEvents) {
      return activePromises.current.organizerEvents;
    }
    setOrganizerEventsLoading(true);
    const promise = (async () => {
      try {
        const res = await API.get('/events/organizer/my-events');
        if (res.data.success) {
          const data = res.data.data || [];
          setOrganizerEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return organizerEvents.data || [];
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        return organizerEvents.data || [];
      } finally {
        setOrganizerEventsLoading(false);
        delete activePromises.current.organizerEvents;
      }
    })();
    activePromises.current.organizerEvents = promise;
    return promise;
  }, [organizerEvents]);

  // 2. Fetch Student Registrations
  const fetchStudentRegistrations = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && studentRegistrations.data !== null && (now - studentRegistrations.fetchedAt) < CACHE_TTL) {
      return studentRegistrations.data;
    }
    if (activePromises.current.studentRegistrations) {
      return activePromises.current.studentRegistrations;
    }
    setStudentRegistrationsLoading(true);
    const promise = (async () => {
      try {
        const res = await API.get('/registrations/my-registrations');
        if (res.data.success) {
          const data = res.data.data || [];
          setStudentRegistrations({ data, fetchedAt: Date.now() });
          return data;
        }
        return studentRegistrations.data || [];
      } catch (error) {
        console.error('Error fetching student registrations:', error);
        return studentRegistrations.data || [];
      } finally {
        setStudentRegistrationsLoading(false);
        delete activePromises.current.studentRegistrations;
      }
    })();
    activePromises.current.studentRegistrations = promise;
    return promise;
  }, [studentRegistrations]);

  // 3. Fetch Deleted Events
  const fetchDeletedEvents = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && deletedEvents.data !== null && (now - deletedEvents.fetchedAt) < CACHE_TTL) {
      return deletedEvents.data;
    }
    if (activePromises.current.deletedEvents) {
      return activePromises.current.deletedEvents;
    }
    setDeletedEventsLoading(true);
    const promise = (async () => {
      try {
        const res = await API.get('/events/deleted');
        if (res.data.success) {
          const data = res.data.data || [];
          setDeletedEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return deletedEvents.data || [];
      } catch (error) {
        console.error('Error fetching deleted events:', error);
        return deletedEvents.data || [];
      } finally {
        setDeletedEventsLoading(false);
        delete activePromises.current.deletedEvents;
      }
    })();
    activePromises.current.deletedEvents = promise;
    return promise;
  }, [deletedEvents]);

  // 4. Fetch Approved Events (used in EventsPage, Past events tab, etc.)
  const fetchApprovedEvents = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && approvedEvents.data !== null && (now - approvedEvents.fetchedAt) < CACHE_TTL) {
      return approvedEvents.data;
    }
    if (activePromises.current.approvedEvents) {
      return activePromises.current.approvedEvents;
    }
    setApprovedEventsLoading(true);
    const promise = (async () => {
      try {
        const res = await API.get('/events?status=approved');
        if (res.data.success) {
          const data = res.data.data || [];
          setApprovedEvents({ data, fetchedAt: Date.now() });
          return data;
        }
        return approvedEvents.data || [];
      } catch (error) {
        console.error('Error fetching approved events:', error);
        return approvedEvents.data || [];
      } finally {
        setApprovedEventsLoading(false);
        delete activePromises.current.approvedEvents;
      }
    })();
    activePromises.current.approvedEvents = promise;
    return promise;
  }, [approvedEvents]);

  // 5. Fetch Platform Stats (used in HomePage)
  const fetchPlatformStats = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && platformStats.data !== null && (now - platformStats.fetchedAt) < CACHE_TTL) {
      return platformStats.data;
    }
    if (activePromises.current.platformStats) {
      return activePromises.current.platformStats;
    }
    setPlatformStatsLoading(true);
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
        return platformStats.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        return platformStats.data;
      } finally {
        setPlatformStatsLoading(false);
        delete activePromises.current.platformStats;
      }
    })();
    activePromises.current.platformStats = promise;
    return promise;
  }, [platformStats]);

  // 6. Fetch Event Details by ID
  const fetchEventDetails = useCallback(async (eventId, force = false) => {
    const now = Date.now();
    const cached = eventDetailsCache[eventId];
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
  }, [eventDetailsCache]);

  // 7. Fetch Event Attendees by Event ID (Organizer registrations page)
  const fetchEventAttendees = useCallback(async (eventId, force = false) => {
    const now = Date.now();
    const cached = eventAttendeesCache[eventId];
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
  }, [eventAttendeesCache]);

  // 8. Fetch Admin / Organizer Panel Data
  const fetchAdminData = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && adminData.data !== null && (now - adminData.fetchedAt) < CACHE_TTL) {
      return adminData.data;
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
        return adminData.data || null;
      } finally {
        delete activePromises.current.adminData;
      }
    })();
    activePromises.current.adminData = promise;
    return promise;
  }, [adminData]);

  // Invalidation helpers
  const invalidateOrganizerEvents = useCallback(() => {
    setOrganizerEvents({ data: null, fetchedAt: 0 });
    setApprovedEvents({ data: null, fetchedAt: 0 });
    setAdminData({ data: null, fetchedAt: 0 });
  }, []);

  const invalidateStudentRegistrations = useCallback(() => {
    setStudentRegistrations({ data: null, fetchedAt: 0 });
    setAdminData({ data: null, fetchedAt: 0 });
  }, []);

  const invalidateDeletedEvents = useCallback(() => {
    setDeletedEvents({ data: null, fetchedAt: 0 });
    setApprovedEvents({ data: null, fetchedAt: 0 });
    setOrganizerEvents({ data: null, fetchedAt: 0 });
  }, []);

  const invalidateEvent = useCallback((eventId) => {
    setEventDetailsCache((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    setEventAttendeesCache((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    setApprovedEvents({ data: null, fetchedAt: 0 });
    setOrganizerEvents({ data: null, fetchedAt: 0 });
  }, []);

  return (
    <DataContext.Provider
      value={{
        // Organizer events
        organizerEvents: organizerEvents.data,
        organizerEventsLoading,
        fetchOrganizerEvents,
        invalidateOrganizerEvents,

        // Student registrations
        studentRegistrations: studentRegistrations.data,
        studentRegistrationsLoading,
        fetchStudentRegistrations,
        invalidateStudentRegistrations,

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
