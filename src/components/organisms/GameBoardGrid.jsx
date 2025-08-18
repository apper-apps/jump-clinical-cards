import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Grid3x3 } from "lucide-react";
import FamilyCard from "@/components/molecules/FamilyCard";
import { cn } from "@/utils/cn";

const GameBoardGrid = ({ 
  families, 
  hypotheses, 
  onHypothesisMove,
  className 
}) => {
  const [dragOverFamily, setDragOverFamily] = useState(null);

  const handleDrop = async (hypothesisId, familyId) => {
    try {
      await onHypothesisMove(hypothesisId, familyId);
      setDragOverFamily(null);
      toast.success("Hypothesis categorized successfully!");
    } catch (error) {
      console.error("Failed to move hypothesis:", error);
      toast.error("Failed to categorize hypothesis");
    }
  };

  const handleDragEnter = (familyId) => {
    setDragOverFamily(familyId);
  };

  const handleDragLeave = () => {
    setDragOverFamily(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Clinical Reasoning Families
        </h2>
        <p className="text-gray-600">
          Drag and drop your hypotheses into the appropriate family categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {families.map((family, index) => (
          <motion.div
            key={family.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onDragEnter={() => handleDragEnter(family.Id)}
            onDragLeave={handleDragLeave}
          >
            <FamilyCard
              family={family}
              hypotheses={hypotheses}
              onDrop={handleDrop}
              isDragOver={dragOverFamily === family.Id}
            />
          </motion.div>
        ))}
      </div>

      {families.length === 0 && (
        <div className="text-center py-12">
<div className="text-gray-400 mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Grid3x3 className="w-8 h-8" />
            </div>
          </div>
          <p className="text-gray-600">No family categories available</p>
        </div>
      )}
    </div>
  );
};

export default GameBoardGrid;