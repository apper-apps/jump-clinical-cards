import { useState, useEffect, useCallback } from "react";
import { collaborativeService } from "@/services/api/collaborativeService";
import { toast } from "react-toastify";

export const useCollaborativeSession = (groupId) => {
  const [session, setSession] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCollaborativeSession = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      
      const [sessionData, groupData] = await Promise.all([
        collaborativeService.getSession(groupId),
        collaborativeService.getGroup(groupId)
      ]);
      
      setSession(sessionData);
      setGroup(groupData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load collaborative session");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const addHypothesis = async (hypothesisData) => {
    if (!session || !group) return;

    try {
      const newHypothesis = await collaborativeService.addHypothesis(
        group.Id,
        {
          ...hypothesisData,
          authorId: "current-user",
          authorName: "Current User",
          phase: session.currentPhase
        }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: [...prev.hypotheses, newHypothesis]
      }));

      toast.success("Hypothesis added successfully!");
      return newHypothesis;
    } catch (err) {
      toast.error("Failed to add hypothesis");
      throw err;
    }
  };

  const updateHypothesis = async (hypothesisId, updates) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.updateHypothesis(
        group.Id,
        hypothesisId,
        updates
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      toast.success("Hypothesis updated successfully!");
      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to update hypothesis");
      throw err;
    }
  };

  const deleteHypothesis = async (hypothesisId) => {
    if (!session || !group) return;

    try {
      await collaborativeService.deleteHypothesis(group.Id, hypothesisId);

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.filter(h => h.Id !== hypothesisId)
      }));

      toast.success("Hypothesis deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete hypothesis");
      throw err;
    }
  };

  const moveHypothesis = async (hypothesisId, familyId) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.updateHypothesis(
        group.Id,
        hypothesisId,
        { familyId }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to move hypothesis");
      throw err;
    }
  };

  const submitForReview = async (hypothesisId) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.submitForReview(
        group.Id,
        hypothesisId
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      toast.success("Hypothesis submitted for peer review!");
      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to submit for review");
      throw err;
    }
  };

  const addComment = async (hypothesisId, commentText) => {
    if (!session || !group) return;

    try {
      const comment = await collaborativeService.addComment(
        group.Id,
        hypothesisId,
        {
          text: commentText,
          authorId: "current-user",
          authorName: "Current User"
        }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId
            ? {
                ...h,
                comments: [...(h.comments || []), comment]
              }
            : h
        )
      }));

      toast.success("Comment added successfully!");
      return comment;
    } catch (err) {
      toast.error("Failed to add comment");
      throw err;
    }
  };

  useEffect(() => {
    if (groupId) {
      loadCollaborativeSession();
    }
  }, [groupId, loadCollaborativeSession]);

  return {
    session,
    group,
    loading,
    error,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    moveHypothesis,
    submitForReview,
    addComment,
    loadCollaborativeSession
  };
};