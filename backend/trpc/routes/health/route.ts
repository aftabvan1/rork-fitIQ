import { publicProcedure } from "../../create-context";

const healthRoute = publicProcedure.query(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Backend is running successfully"
  };
});

export default healthRoute;