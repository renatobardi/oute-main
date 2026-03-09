/**
 * DTO: Get Profile Request
 * Input data for get profile use case
 */
export class GetProfileRequest {
  constructor(public readonly userId: string) {
    if (userId.length === 0) {
      throw new Error('User ID is required');
    }
  }
}
