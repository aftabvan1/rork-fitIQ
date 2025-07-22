import { publicProcedure } from "../../../../create-context";

export const getFriendActivitiesProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch the user's friends' activities from a database.
  // For this example, we'll just return a mock list of activities.
  const activities = [
    {
      id: "1",
      friendId: "2",
      friendName: "Jane Doe",
      type: "workout",
      description: "completed a workout.",
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    activities,
  };
});
