import { publicProcedure } from "../../create-context";

const healthRoute = publicProcedure
  .query(() => {
    return {
      status: "ok",
      message: "Backend is healthy",
      timestamp: new Date().toISOString()
    };
  });

export default healthRoute;