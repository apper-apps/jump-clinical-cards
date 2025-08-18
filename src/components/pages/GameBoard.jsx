import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import CasePresentation from "@/components/organisms/CasePresentation";
import GameBoardGrid from "@/components/organisms/GameBoardGrid";
import HypothesisWorkspace from "@/components/organisms/HypothesisWorkspace";
import ScoreDisplay from "@/components/molecules/ScoreDisplay";
import { useGameSession } from "@/hooks/useGameSession";
import { useFamilies } from "@/hooks/useFamilies";
import { useCase } from "@/hooks/useCase";

const GameBoard = () => {
  const [currentStage, setCurrentStage] = useState(1);
  
  const { 
    session, 
    loading: sessionLoading, 
    error: sessionError,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    moveHypothesis,
    loadCurrentSession
  } = useGameSession();

  const { 
    families, 
    loading: familiesLoading, 
    error: familiesError,
    loadFamilies 
  } = useFamilies();

  const { 
    caseData, 
    loading: caseLoading, 
    error: caseError,
    unlockStage,
    loadCase 
  } = useCase(1);

  const isLoading = sessionLoading || familiesLoading || caseLoading;
  const hasError = sessionError || familiesError || caseError;

  const handleStageChange = (stageNumber) => {
    setCurrentStage(stageNumber);
    unlockStage(stageNumber);
  };

  const handleRetry = () => {
    loadCurrentSession();
    loadFamilies();
    loadCase();
  };

  if (isLoading) {
    return <Loading message="Loading clinical reasoning game..." />;
  }

  if (hasError) {
    return (
      <Error 
        message={sessionError || familiesError || caseError} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Stethoscope" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ClinicalCards
                </h1>
                <p className="text-sm text-gray-600">
                  Clinical Reasoning Game for Physiotherapy Students
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Stage</div>
                <div className="text-lg font-semibold text-primary">
                  Stage {currentStage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Score Display */}
          <ScoreDisplay 
            score={session?.score || { diversity: 0, coverage: 0, reasoning: 0 }}
            totalFamilies={families.length}
          />

          {/* Main Game Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Information Panel */}
            <div className="lg:col-span-1">
              <CasePresentation
                caseData={caseData}
                currentStage={currentStage}
                onStageChange={handleStageChange}
              />
            </div>

            {/* Game Board */}
            <div className="lg:col-span-2">
              <GameBoardGrid
                families={families}
                hypotheses={session?.hypotheses || []}
                onHypothesisMove={moveHypothesis}
              />
            </div>
          </div>

          {/* Hypothesis Workspace */}
          <HypothesisWorkspace
            hypotheses={session?.hypotheses || []}
            families={families}
            onAddHypothesis={addHypothesis}
            onUpdateHypothesis={updateHypothesis}
            onDeleteHypothesis={deleteHypothesis}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              ClinicalCards - Evidence-based clinical reasoning education
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>Powered by the ICF Framework</span>
              <span>•</span>
              <span>Biopsychosocial Model</span>
              <span>•</span>
              <span>Happy Families Method</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GameBoard;