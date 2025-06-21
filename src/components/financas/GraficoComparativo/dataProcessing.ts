
import { Transacao, Categoria } from "@/types";
import { processFinancialData as processFinancialDataUtil } from "./financialDataProcessor";
import { filterAndSortCycles as filterAndSortCyclesUtil } from "./cycleFiltering";

// Re-export the utilities to maintain the same interface
export const processFinancialData = processFinancialDataUtil;
export const filterAndSortCycles = filterAndSortCyclesUtil;
