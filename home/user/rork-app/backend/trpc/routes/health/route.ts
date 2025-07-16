import { publicProcedure } from "../../create-context";

export default publicProcedure
  .query(() => {
    return {
      status: 'ok',
      message: 'tRPC API is running',
      timestamp: new Date().toISOString(),
    };
  });