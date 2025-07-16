import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import healthRoute from "./routes/health/route";
import { addMealEntryProcedure } from "./routes/nutrition/add-meal-entry/route";
import { getDailyNutritionProcedure } from "./routes/nutrition/get-daily-nutrition/route";
import { searchFoodProcedure } from "./routes/nutrition/search-food/route";
import { scanBarcodeProcedure } from "./routes/nutrition/scan-barcode/route";
import { analyzeFoodPhotoProcedure } from "./routes/nutrition/analyze-food-photo/route";

export const appRouter = createTRPCRouter({
  health: healthRoute,
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  nutrition: createTRPCRouter({
    addMealEntry: addMealEntryProcedure,
    getDailyNutrition: getDailyNutritionProcedure,
    searchFood: searchFoodProcedure,
    scanBarcode: scanBarcodeProcedure,
    analyzeFoodPhoto: analyzeFoodPhotoProcedure,
  }),
});

export type AppRouter = typeof appRouter;