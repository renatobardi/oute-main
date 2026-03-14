export class InvalidInterviewError extends Error {
  constructor(reason: string) {
    super(`Invalid interview: ${reason}`);
    this.name = 'InvalidInterviewError';
  }
}
