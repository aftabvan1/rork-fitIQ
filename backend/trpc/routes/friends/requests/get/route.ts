import { publicProcedure } from "../../../../create-context";

export const getFriendRequestsProcedure = publicProcedure.query(async () => {
  // In a real application, you would fetch the user's friend requests from a database.
  // For this example, we'll just return a mock list of requests.
  const requests = [
    {
      id: "3",
      name: "John Smith",
      email: "john@example.com",
      status: "pending",
    },
  ];

  return {
    requests,
  };
});
