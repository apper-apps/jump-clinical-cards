import { useState, useEffect } from "react";
import { familyService } from "@/services/api/familyService";

export const useFamilies = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const familiesData = await familyService.getAllFamilies();
      setFamilies(familiesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    families,
    loading,
    error,
    loadFamilies
  };
};