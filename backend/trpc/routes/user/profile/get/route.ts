import { publicProcedure } from "../../../../create-context";

export const getProfileProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch the user's profile from a database.
  // For this example, we'll just return a mock user profile.
  const userProfile = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    profilePicture: "https://example.com/profile.jpg",
    weight: 70,
    height: 175,
    age: 30,
    goals: {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    },
    isPremium: false,
  };

  return {
    userProfile,
  };
});
