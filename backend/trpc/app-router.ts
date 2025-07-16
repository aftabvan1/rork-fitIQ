import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import healthRoute from "./routes/health/route";
import addMealEntryRoute from "./routes/nutrition/add-meal-entry/route";
import getDailyNutritionRoute from "./routes/nutrition/get-daily-nutrition/route";
import searchFoodRoute from "./routes/nutrition/search-food/route";

export const appRouter = createTRPCRouter({
  health: healthRoute,
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  nutrition: createTRPCRouter({
    addMealEntry: addMealEntryRoute,
    getDailyNutrition: getDailyNutritionRoute,
    searchFood: searchFoodRoute,
  }),
});

export type AppRouter = typeof appRouter;