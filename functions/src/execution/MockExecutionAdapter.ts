import {
  IExecutionProvider,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
} from './types';

export class MockExecutionAdapter implements IExecutionProvider {
  name = 'Mock Local Sandbox (Development Only)';

  isConfigured(): boolean {
    return true;
  }

  async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    // Simulated short execution latency
    await new Promise((r) => setTimeout(r, 100));

    const code = request.sourceCode.trim();
    if (code.length < 10) {
      return {
        status: 'compilation_error',
        stdout: null,
        stderr: 'Source code is empty or insufficient.',
        compileOutput: 'Empty source error',
        timeSeconds: 0,
        memoryKB: 0,
      };
    }

    const expected = (request.expectedOutput || '').trim();
    // Simulate output
    const stdout = expected;

    return {
      status: 'accepted',
      stdout,
      stderr: null,
      compileOutput: null,
      timeSeconds: 0.045,
      memoryKB: 18240,
    };
  }
}
