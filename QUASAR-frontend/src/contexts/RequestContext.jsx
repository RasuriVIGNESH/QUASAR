import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { joinRequestService } from '../services/JoinRequestService';
import { projectService } from '../services/projectService';

const RequestContext = createContext();
export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const { isAuthenticated, userProfile } = useAuth();

  const cacheRef = useRef(null); // ✅ caching
  const isFetchingRef = useRef(false); // ✅ prevent duplicate calls

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sentJoinRequests, setSentJoinRequests] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [receivedJoinRequests, setReceivedJoinRequests] = useState([]);

  const fetchAllData = useCallback(async (userId, force = false) => {

    // ✅ USE CACHE
    if (!force && cacheRef.current) {
      const cached = cacheRef.current;
      setSentJoinRequests(cached.sent);
      setReceivedInvitations(cached.invites);
      setReceivedJoinRequests(cached.received);
      return;
    }

    // ✅ PREVENT DUPLICATE CALLS
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const [joinRequestsRes, invitationsRes, myProjectsResponse] = await Promise.all([
        joinRequestService.getMyJoinRequests(),
        projectService.getReceivedInvitations(0, 10),
        projectService.getMyProjects()
      ]);

      const sentRequests = joinRequestsRes?.data || joinRequestsRes || [];
      const invitations = Array.isArray(invitationsRes)
        ? invitationsRes
        : invitationsRes?.content || invitationsRes?.data || [];
      const myProjects = myProjectsResponse?.content || [];

      const ownedProjects = myProjects.filter(p => p.Lead?.id === userId);

      // ✅ LIMIT API CALLS (max 3 projects only)
      const limitedProjects = ownedProjects.slice(0, 3);

      let allJoinRequests = [];

      if (limitedProjects.length > 0) {
        const results = await Promise.all(
          limitedProjects.map(project =>
            joinRequestService.getProjectJoinRequests(project.id)
          )
        );

        allJoinRequests = results.map(res => res?.data || res || []).flat();
      }

      // ✅ SET STATE
      setSentJoinRequests(sentRequests);
      setReceivedInvitations(invitations);
      setReceivedJoinRequests(allJoinRequests);

      // ✅ SAVE CACHE
      cacheRef.current = {
        sent: sentRequests,
        invites: invitations,
        received: allJoinRequests
      };

    } catch (err) {
      console.error("RequestContext error:", err);
      setError("Could not load requests.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      fetchAllData(userProfile.id);
    }
  }, [isAuthenticated, userProfile?.id, fetchAllData]);

  const refresh = () => {
    if (userProfile?.id) {
      cacheRef.current = null; // clear cache
      fetchAllData(userProfile.id, true);
    }
  };

  const pendingInvitationCount =
    receivedInvitations.filter(inv => inv.status === 'PENDING').length;

  const pendingJoinRequestCount =
    receivedJoinRequests.filter(req => req.status === 'PENDING').length;

  return (
    <RequestContext.Provider value={{
      loading,
      error,
      sentJoinRequests,
      receivedInvitations,
      receivedJoinRequests,
      refresh,
      pendingCount: pendingInvitationCount + pendingJoinRequestCount,
    }}>
      {children}
    </RequestContext.Provider>
  );
};