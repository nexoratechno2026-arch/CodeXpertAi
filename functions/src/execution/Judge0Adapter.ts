import {
  IExecutionProvider,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxStatus,
  SupportedLanguage,
} from './types';

export const JUDGE0_LANGUAGE_MAP: Record<SupportedLanguage, number> = {
  python: 71,      // Python 3.10
  javascript: 63,  // JavaScript (Node.js 18)
  typescript: 74,  // TypeScript 4.8
  java: 62,        // Java OpenJDK 17
  cpp: 54,         // C++ (GCC 11.2)
  sql: 82,         // SQL (SQLite 3.39)
};

export class Judge0Adapter implements IExecutionProvider {
  name = 'Judge0 CE / RapidAPI Sandbox';
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = apiKey || process.env.JUDGE0_API_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        'Judge0 execution provider is not configured. Missing JUDGE0_API_KEY.'
      );
    }

    const languageId = JUDGE0_LANGUAGE_MAP[request.language];
    if (!languageId) {
      throw new Error(`Unsupported execution language: ${request.language}`);
    }

    // Prepare payload with base64 encoding to prevent newline or binary truncation
    const payload = {
      source_code: Buffer.from(request.sourceCode).toString('base64'),
      language_id: languageId,
      stdin: request.stdin ? Buffer.from(request.stdin).toString('base64') : undefined,
      expected_output: request.expectedOutput
        ? Buffer.from(request.expectedOutput).toString('base64')
        : undefined,
      cpu_time_limit: request.cpuTimeLimitSeconds || 5,
      memory_limit: request.memoryLimitKB ? Math.round(request.memoryLimitKB / 1024) : 256, // MB
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiUrl.includes('rapidapi.com')) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    } else {
      headers['X-Auth-Token'] = this.apiKey;
    }

    const response = await fetch(
      `${this.apiUrl}/submissions?base64_encoded=true&wait=true`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Judge0 API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return this.normalizeJudge0Response(data);
  }

  private normalizeJudge0Response(data: any): SandboxExecutionResponse {
    const statusId = data.status?.id;
    let status: SandboxStatus = 'internal_error';

    // Map Judge0 status IDs
    switch (statusId) {
      case 3:
        status = 'accepted';
        break;
      case 4:
        status = 'wrong_answer';
        break;
      case 5:
        status = 'time_limit_exceeded';
        break;
      case 6:
        status = 'compilation_error';
        break;
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        status = 'runtime_error';
        break;
      case 13:
      default:
        status = 'internal_error';
        break;
    }

    const decodeBase64 = (b64?: string | null) =>
      b64 ? Buffer.from(b64, 'base64').toString('utf-8') : null;

    return {
      status,
      stdout: decodeBase64(data.stdout),
      stderr: decodeBase64(data.stderr),
      compileOutput: decodeBase64(data.compile_output),
      timeSeconds: data.time ? parseFloat(data.time) : null,
      memoryKB: data.memory ? parseInt(data.memory, 10) : null,
      rawStatusCode: statusId,
    };
  }
}
