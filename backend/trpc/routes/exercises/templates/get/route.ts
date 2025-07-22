import { publicProcedure } from "../../../../create-context";

export const getExerciseTemplatesProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch exercise templates from a database.
  // For this example, we'll just return a mock list of templates.
  const templates = [
    { id: "1", name: "Bench Press", category: "Chest" },
    { id: "2", name: "Squat", category: "Legs" },
    { id: "3", name: "Deadlift", category: "Back" },
  ];

  return {
    templates,
  };
});
