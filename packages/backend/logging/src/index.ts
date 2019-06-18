export interface LoggingType {
  message: string;
}

export function log(message: string): void {
  // eslint-disable-next-line no-console
  console.log(message);
}
