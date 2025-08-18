import { useState, useEffect } from "react";
import { caseService } from "@/services/api/caseService";

export const useCase = (caseId = 1) => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  const loadCase = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getCase(caseId);
      setCaseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unlockStage = (stageNumber) => {
    if (!caseData) return;
    
    setCaseData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, index) => 
        index + 1 === stageNumber ? { ...stage, unlocked: true } : stage
      )
    }));
  };

  return {
    caseData,
    loading,
    error,
    loadCase,
    unlockStage
  };
};