import { DispatchStatus, VendorResourceType } from './database';

export type DispatchEventType =
  | 'TRIGGER_BROADCAST'
  | 'ACCEPT_ASSIGNMENT'
  | 'DECLINE_ASSIGNMENT'
  | 'TIMEOUT_EXPIRED'
  | 'CANCEL_ASSIGNMENT'
  | 'REASSIGN';

export interface DispatchResourcePayload {
  bookingId: string;
  resourceType: VendorResourceType;
  tourTitle: string;
  departureDate: string;
  groupSize: number;
  meetingPoint: string;
  payoutAmountInr: number;
  timeoutMinutes: number;
  eligiblePhones: string[];
}

export interface DispatchTransitionLog {
  dispatchId: string;
  fromStatus: DispatchStatus;
  toStatus: DispatchStatus;
  event: DispatchEventType;
  responderPhone?: string;
  responderName?: string;
  reason?: string;
  timestamp: string;
}

export interface ParallelDispatchGroup {
  bookingId: string;
  guideDispatchId?: string;
  jeepDispatchId?: string;
  guideStatus: DispatchStatus;
  jeepStatus: DispatchStatus;
  allLocked: boolean;
  expiresAt: string;
}
