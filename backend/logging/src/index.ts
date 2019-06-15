export interface LoggingType {
  message: string;
}

export function log(message: string): void {
  console.log(message);
}
