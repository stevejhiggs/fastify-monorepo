import logger from "pino";

const logInstance = logger();

export function formatLibraryMessage(message: string) {
  return `library - ${message}`;
}

export function logToConsole(message: string) {
  logInstance.info(formatLibraryMessage(message));
}
