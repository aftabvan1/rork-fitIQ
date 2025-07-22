import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import healthRoute from "./routes/health/route";
import { addMealEntryProcedure } from "./routes/nutrition/add-meal-entry/route";
import { getDailyNutritionProcedure } from "./routes/nutrition/get-daily-nutrition/route";
import { searchFoodProcedure } from "./routes/nutrition/search-food/route";
import { scanBarcodeProcedure } from "./routes/nutrition/scan-barcode/route";
import { analyzeFoodPhotoProcedure } from "./routes/nutrition/analyze-food-photo/route";
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { refreshProcedure } from "./routes/auth/refresh/route";
import { getProfileProcedure } from "./routes/user/profile/get/route";
import { updateProfileProcedure } from "./routes/user/profile/put/route";
import { uploadProfilePictureProcedure } from "./routes/user/profile-picture/post/route";
import { updateMealEntryProcedure } from "./routes/nutrition/update-meal-entry/route";
import { deleteMealEntryProcedure } from "./routes/nutrition/delete-meal-entry/route";
import { getWorkoutsProcedure } from "./routes/workouts/get/route";
import { createWorkoutProcedure } from "./routes/workouts/post/route";
import { updateWorkoutProcedure } from "./routes/workouts/put/route";
import { deleteWorkoutProcedure } from "./routes/workouts/delete/route";
import { getExerciseTemplatesProcedure } from "./routes/exercises/templates/get/route";
import { getFriendsProcedure } from "./routes/friends/get/route";
import { getFriendRequestsProcedure } from "./routes/friends/requests/get/route";
import { sendFriendRequestProcedure } from "./routes/friends/request/post/route";
import { acceptFriendRequestProcedure } from "./routes/friends/request/accept/post/route";
import { rejectFriendRequestProcedure } from "./routes/friends/request/reject/post/route";
import { removeFriendProcedure } from "./routes/friends/delete/route";
import { getFriendActivitiesProcedure } from "./routes/friends/activities/get/route";
import { getSubscriptionStatusProcedure } from "./routes/subscription/status/get/route";
import { createSubscriptionProcedure } from "./routes/subscription/create/post/route";
import { cancelSubscriptionProcedure } from "./routes/subscription/cancel/post/route";
import { getMealSuggestionsProcedure } from "./routes/ai/meal-suggestions/post/route";

export const appRouter = createTRPCRouter({
  health: healthRoute,
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
    refresh: refreshProcedure,
  }),
  user: createTRPCRouter({
    getProfile: getProfileProcedure,
    updateProfile: updateProfileProcedure,
    uploadProfilePicture: uploadProfilePictureProcedure,
  }),
  nutrition: createTRPCRouter({
    addMealEntry: addMealEntryProcedure,
    getDailyNutrition: getDailyNutritionProcedure,
    searchFood: searchFoodProcedure,
    scanBarcode: scanBarcodeProcedure,
    analyzeFoodPhoto: analyzeFoodPhotoProcedure,
    updateMealEntry: updateMealEntryProcedure,
    deleteMealEntry: deleteMealEntryProcedure,
  }),
  workouts: createTRPCRouter({
    getWorkouts: getWorkoutsProcedure,
    createWorkout: createWorkoutProcedure,
    updateWorkout: updateWorkoutProcedure,
    deleteWorkout: deleteWorkoutProcedure,
  }),
  exercises: createTRPCRouter({
    getTemplates: getExerciseTemplatesProcedure,
  }),
  friends: createTRPCRouter({
    getFriends: getFriendsProcedure,
    getFriendRequests: getFriendRequestsProcedure,
    sendFriendRequest: sendFriendRequestProcedure,
    acceptFriendRequest: acceptFriendRequestProcedure,
    rejectFriendRequest: rejectFriendRequestProcedure,
    removeFriend: removeFriendProcedure,
    getFriendActivities: getFriendActivitiesProcedure,
  }),
  subscription: createTRPCRouter({
    getStatus: getSubscriptionStatusProcedure,
    create: createSubscriptionProcedure,
    cancel: cancelSubscriptionProcedure,
  }),
  ai: createTRPCRouter({
    getMealSuggestions: getMealSuggestionsProcedure,
  }),
});

export type AppRouter = typeof appRouter;