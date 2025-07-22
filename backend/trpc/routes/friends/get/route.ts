import { publicProcedure } from "../../../create-context";

export const getFriendsProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch the user's friends from a database.
  // For this example, we'll just return a mock list of friends.
  const friends = [
    {
      id: "2",
      name: "Jane Doe",
      email: "jane@example.com",
      status: "accepted",
    },
  ];

  return {
    friends,
  };
});
