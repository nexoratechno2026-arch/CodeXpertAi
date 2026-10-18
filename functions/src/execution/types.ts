export type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'sql';

export interface SandboxExecutionRequest {
  sourceCode: string;
  language: SupportedLanguage;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimitSeconds?: number;
  memoryLimitKB?: number;
}

export type SandboxStatus =
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'compilation_error'
  | 'runtime_error'
  | 'internal_error';

export interface SandboxExecutionResponse {
  status: SandboxStatus;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  timeSeconds: number | null;
  memoryKB: number | null;
  rawStatusCode?: number;
}

export interface IExecutionProvider {
  name: string;
  isConfigured(): boolean;
  execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse>;
}
