import errorHandler from "errorhandler";

import app, { initDatabase } from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
async function init() {
  try {
    console.log('Initializing Adapter-Status ...');
    await initDatabase();
    /**
   * Start Express server.
   */
    const server = app.listen(8080, () => {
      console.log(
        "  App is running at http://localhost:%d in %s mode",
        8080,
        app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
  } catch (e) {
    console.error(e);
  }
}

init();
