import { config } from "dotenv";
import logger from "./logger";

const CONFIGURATION_FILE = ".env";

const result = config({ path: CONFIGURATION_FILE });

if (result.error) {
  logger.error(`Error when loading ${CONFIGURATION_FILE} file: '${result.error.message}'.`);
  process.exit(1);
}
