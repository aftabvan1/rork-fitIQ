import { publicProcedure } from "../../../create-context";

export const getWorkoutsProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch the user's workouts from a database.
  // For this example, we'll just return a mock list of workouts.
  const workouts = [
    {
      id: "1",
      name: "Morning Workout",
      date: "2024-07-21",
      duration: 3600,
      exercises: [],
      completed: true,
    },
  ];

  return {
    workouts,
  };
});
