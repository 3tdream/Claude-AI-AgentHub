/** Deterministic Stage Contracts — structured I/O validation for pipeline stages */

/** A named, typed field in a contract */
export interface ContractField {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "json_block";
  required: boolean;
  description: string;
  /** Validation regex or JSON schema fragment */
  validation?: string;
}

/** What the stage expects and promises */
export interface StageContract {
  stageId: string;
  stageName: string;
  agentId: string;

  /** What this stage consumes from upstream stages */
  inputs: {
    field: string;
    fromStage: string;
    required: boolean;
    description: string;
  }[];

  /** What this stage MUST produce — machine-verifiable outputs */
  outputs: {
    field: string;
    type: ContractField["type"];
    required: boolean;
    description: string;
    /** Regex for quick validation */
    pattern?: string;
  }[];

  /** Explicit assumptions the agent is making */
  assumptions: {
    id: string;
    text: string;
    /** If wrong, what breaks? */
    impactIfWrong: string;
    /** Confidence: 0-1 */
    confidence: number;
  }[];

  /** Hard constraints the output must satisfy */
  constraints: {
    id: string;
    rule: string;
    /** How to verify (automated or manual) */
    verification: string;
    severity: "blocking" | "warning";
  }[];

  /** Known risks for this stage */
  risks: {
    id: string;
    description: string;
    probability: "low" | "medium" | "high";
    impact: "low" | "medium" | "high" | "critical";
    mitigation: string;
  }[];
}

/** Result of validating a stage output against its contract */
export interface ContractValidation {
  stageId: string;
  valid: boolean;
  outputsPresent: { field: string; present: boolean; valid: boolean }[];
  constraintsPassed: { id: string; passed: boolean; reason?: string }[];
  missingRequired: string[];
  warnings: string[];
  score: number; // 0-100
}

/** Contract metadata block that agents must embed in their output */
export interface StageContractOutput {
  _contract: {
    stageId: string;
    inputs_received: string[];
    outputs_produced: string[];
    assumptions: { id: string; text: string; confidence: number }[];
    constraints_satisfied: string[];
    risks_flagged: string[];
  };
}
