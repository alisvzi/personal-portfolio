"use client";

import { fetchPortfolioData } from "@/lib/utils";
import { PortfolioData } from "@/types";
import { useEffect, useState } from "react";

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
      heroTitle: "Ali Soveizi",
      heroSubtitle: "Frontend Developer",
      heroDescription: "I build things for the web.",
      aboutText: "Loading...",
      contactEmail: "AliSoveizi@example.com",
      contactPhone: "+98 992 875 7403",
    },
    experience: [],
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
