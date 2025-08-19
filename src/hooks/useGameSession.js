import { useState, useEffect } from "react";
import { gameSessionService } from "@/services/api/gameSessionService";

export const useGameSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await gameSessionService.getCurrentSession();
      setSession(sessionData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addHypothesis = async (hypothesisData) => {
    if (!session) return;

    try {
      const newHypothesis = await gameSessionService.addHypothesis(
        session.Id, 
        hypothesisData
      );
      
      setSession(prev => ({
        ...prev,
        hypotheses: [...prev.hypotheses, newHypothesis]
      }));
      
      return newHypothesis;
    } catch (err) {
      throw new Error("Failed to add hypothesis");
    }
  };

  const updateHypothesis = async (hypothesisId, updates) => {
    if (!session) return;

    try {
      const updatedHypothesis = await gameSessionService.updateHypothesis(
        session.Id, 
        hypothesisId, 
        updates
      );
      
      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h => 
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));
      
      return updatedHypothesis;
    } catch (err) {
      throw new Error("Failed to update hypothesis");
    }
  };

  const deleteHypothesis = async (hypothesisId) => {
    if (!session) return;

    try {
      await gameSessionService.deleteHypothesis(session.Id, hypothesisId);
      
      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.filter(h => h.Id !== hypothesisId)
      }));
    } catch (err) {
      throw new Error("Failed to delete hypothesis");
    }
  };

  const moveHypothesis = async (hypothesisId, familyId) => {
    if (!session) return;

    try {
      const updatedHypothesis = await gameSessionService.updateHypothesis(
        session.Id,
        hypothesisId,
        { familyId: familyId }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      return updatedHypothesis;
    } catch (err) {
      throw new Error("Failed to move hypothesis");
    }
  };

const updateCurrentStage = async (stageNumber) => {
    if (!session) return;

    try {
      const updatedSession = await gameSessionService.updateCurrentStage(
        session.Id, 
        stageNumber
      );
      
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError("Failed to update stage");
      throw new Error("Failed to update stage");
    }
  };

  return {
    session,
    loading,
    error,
    loadCurrentSession,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
moveHypothesis,
    updateCurrentStage
  };
};