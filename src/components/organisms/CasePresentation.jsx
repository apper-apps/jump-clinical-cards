import { motion } from "framer-motion";
import CaseStagePanel from "@/components/molecules/CaseStagePanel";
import ApperIcon from "@/components/ApperIcon";

const CasePresentation = ({ 
  caseData, 
  currentStage, 
  onStageChange,
  className 
}) => {
  if (!caseData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <ApperIcon name="FileText" className="w-8 h-8 mx-auto mb-2" />
          <p>No case data available</p>
        </div>
      </div>
    );
  }

  const handleStageSelect = (stageNumber) => {
    onStageChange(stageNumber);
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Stethoscope" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {caseData.title}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {caseData.complexity}
                </span>
                <span className="text-sm px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                  {caseData.speciality}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CaseStagePanel
          stages={caseData.stages}
          currentStage={currentStage}
          onStageSelect={handleStageSelect}
        />

        <div className="bg-gradient-to-r from-info/10 to-accent/10 rounded-lg p-4 border border-info/20">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="w-5 h-5 text-info mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-info">
                Clinical Reasoning Guide
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Read each stage carefully and consider all clinical information</li>
                <li>• Generate hypotheses based on the evidence presented</li>
                <li>• Categorize your hypotheses into appropriate family groups</li>
                <li>• Provide clear rationale for your clinical reasoning</li>
                <li>• Review and refine your hypotheses as new information becomes available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CasePresentation;