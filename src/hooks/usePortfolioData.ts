"use client";

import { useState, useEffect } from "react";
import { PortfolioData } from "@/types";
import { fetchPortfolioData } from "@/lib/utils";

interface UsePortfolioDataReturn {
  data: PortfolioData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolioData(): UsePortfolioDataReturn {
  const [data, setData] = useState<PortfolioData>({
    projects: [],
    skills: [],
    content: {
      heroBadge: "Hi, my name is",
      heroTitle: "John Doe",
      heroSubtitle: "Frontend Developer",
      heroDescription: "I build things for the web.",
      aboutText: "Loading...",
      contactEmail: "john.doe@example.com",
      contactPhone: "+98 912 345 6789",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const portfolioData = await fetchPortfolioData();
      setData(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error in usePortfolioData:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
