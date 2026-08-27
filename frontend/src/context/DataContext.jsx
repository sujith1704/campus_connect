import React, { createContext, useState, useCallback, useContext, useEffect, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const DataContext = createContext();

const CACHE_TTL = 30000; // 30 seconds

export const DataProvider = ({ children }) => {
  const { isAuthenticated, isOrganizer, isStudent } = useContext(AuthContext);

  // Cache stores: { data, fetchedAt }
  const [organizerEvents, setOrganizerEvents] = useState({ data: null, fetchedAt: 0 });
  const [studentRegistrations, setStudentRegistrations] = useState({ data: null, fetchedAt: 0 });
  const [deletedEvents, setDeletedEvents] = useState({ data: null, fetchedAt: 0 });

  // Loading states
  const [organizerEventsLoading, setOrganizerEventsLoading] = useState(false);
  const [studentRegistrationsLoading, setStudentRegistrationsLoading] = useState(false);
  const [deletedEventsLoading, setDeletedEventsLoading] = useState(false);

  // Prevent concurrent duplicate fetches
  const fetchingRef = useRef({});

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizerEvents({ data: null, fetchedAt: 0 });
      setStudentRegistrations({ data: null, fetchedAt: 0 });
      setDeletedEvents({ data: null, fetchedAt: 0 });
    }
  }, [isAuthenticated]);

  const fetchOrganizerEvents = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && organizerEvents.data && (now - organizerEvents.fetchedAt) < CACHE_TTL) {
      return organizerEvents.data;
    }
    if (fetchingRef.current.organizerEvents) return organizerEvents.data;
    fetchingRef.current.organizerEvents = true;
    setOrganizerEventsLoading(true);
    try {
      const res = await API.get('/events/organizer/my-events');
      if (res.data.success) {
        const data = res.data.data;
        setOrganizerEvents({ data, fetchedAt: Date.now() });
        return data;
      }
      return organizerEvents.data || [];
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      return organizerEvents.data || [];
    } finally {
      setOrganizerEventsLoading(false);
      fetchingRef.current.organizerEvents = false;
    }
  }, [organizerEvents]);

  const fetchStudentRegistrations = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && studentRegistrations.data && (now - studentRegistrations.fetchedAt) < CACHE_TTL) {
      return studentRegistrations.data;
    }
    if (fetchingRef.current.studentRegistrations) return studentRegistrations.data;
    fetchingRef.current.studentRegistrations = true;
    setStudentRegistrationsLoading(true);
    try {
      const res = await API.get('/registrations/my-registrations');
      if (res.data.success) {
        const data = res.data.data;
        setStudentRegistrations({ data, fetchedAt: Date.now() });
        return data;
      }
      return studentRegistrations.data || [];
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      return studentRegistrations.data || [];
    } finally {
      setStudentRegistrationsLoading(false);
      fetchingRef.current.studentRegistrations = false;
    }
  }, [studentRegistrations]);

  const fetchDeletedEvents = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && deletedEvents.data && (now - deletedEvents.fetchedAt) < CACHE_TTL) {
      return deletedEvents.data;
    }
    if (fetchingRef.current.deletedEvents) return deletedEvents.data;
    fetchingRef.current.deletedEvents = true;
    setDeletedEventsLoading(true);
    try {
      const res = await API.get('/events/deleted');
      if (res.data.success) {
        const data = res.data.data;
        setDeletedEvents({ data, fetchedAt: Date.now() });
        return data;
      }
      return deletedEvents.data || [];
    } catch (error) {
      console.error('Error fetching deleted events:', error);
      return deletedEvents.data || [];
    } finally {
      setDeletedEventsLoading(false);
      fetchingRef.current.deletedEvents = false;
    }
  }, [deletedEvents]);

  // Invalidate cache (e.g., after deleting an event)
  const invalidateOrganizerEvents = useCallback(() => {
    setOrganizerEvents({ data: null, fetchedAt: 0 });
  }, []);

  const invalidateStudentRegistrations = useCallback(() => {
    setStudentRegistrations({ data: null, fetchedAt: 0 });
  }, []);

  const invalidateDeletedEvents = useCallback(() => {
    setDeletedEvents({ data: null, fetchedAt: 0 });
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
