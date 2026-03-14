export class InterviewNotFoundError extends Error {
  constructor(id: string) {
    super(`Interview not found: ${id}`);
    this.name = 'InterviewNotFoundError';
  }
}
