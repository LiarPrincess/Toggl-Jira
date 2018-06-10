import dotenv from "dotenv";
import logger from "./logger";

const CONFIGURATION_FILE = ".env";

logger.debug(`Using ${CONFIGURATION_FILE} file to supply config environment variables`);
const result = dotenv.config({ path: CONFIGURATION_FILE });

if (result.error) {
  logger.error(`Error when loading ${CONFIGURATION_FILE} file: '${result.error.message}'.`);
  process.exit(1);
}
