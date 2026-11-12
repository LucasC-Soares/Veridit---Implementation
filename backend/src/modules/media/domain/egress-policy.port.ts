export const EGRESS_POLICY = Symbol('EGRESS_POLICY');

export interface EgressPolicy {
  validate(url: string): void;
}
