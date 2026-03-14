import type { Interview, InterviewStatus } from '../entities/Interview';

export interface CreateInterviewProps {
  projectId: string;
  conductedBy: string;
  title: string;
}

/**
 * IInterviewRepository Port
 * The domain declares WHAT it needs — infrastructure delivers HOW.
 */
export interface IInterviewRepository {
  /** Create a new interview (DB generates id and interviewCode) */
  create(props: CreateInterviewProps): Promise<Interview>;

  /** Find by internal UUID */
  findById(id: string): Promise<Interview | null>;

  /** Find by human-readable code (e.g. INT-X7K2QP) */
  findByCode(code: string): Promise<Interview | null>;

  /** List all active interviews for a given project */
  findByProjectId(projectId: string): Promise<Interview[]>;

  /** List all interviews conducted by a user */
  findByConductedBy(userId: string): Promise<Interview[]>;

  /** Persist status/timestamp changes */
  update(interview: Interview): Promise<void>;

  /** Soft-delete */
  delete(id: string): Promise<void>;
}
