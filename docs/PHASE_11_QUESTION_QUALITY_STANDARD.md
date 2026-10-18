# Phase 11 — Question Quality & Evaluation Standard

## 1. Quality Checklist for Published Problems
Every coding problem published in Nexora CodeLab must strictly satisfy the following criteria before publication:

1. **Clean Starter Code (No Revealed Solutions):**
   - The student editor must NEVER receive a pre-filled, working solution.
   - Functions must contain standard function signatures, input type hints, and placeholder statements (`pass` in Python, default return values in JS/TS/Java/C++).
   - Test execution wrappers handle standard I/O so students can test their code with standard input and standard output.

2. **Isolated Server Reference Solutions:**
   - Private reference solutions are stored in `SEED_REFERENCE_SOLUTIONS` / `EXPANDED_REFERENCE_SOLUTIONS` on the backend only.
   - Client DTO sanitization (`sanitizeClientProblem`) strips `referenceSolution` before payloads are transmitted to the browser.

3. **Visible and Hidden Test Cases:**
   - **Visible Samples:** 2–3 public example tests matching the examples in the problem statement so students can verify their implementation against expected outputs.
   - **Hidden Test Cases:** 2–4 private edge-case tests (empty inputs, negative values, large numbers, boundary values) to evaluate solution robustness and prevent hardcoding.

4. **Multi-Language Support:**
   - Standard starter templates provided for Python, JavaScript, TypeScript, Java, and C++ (or SQL where applicable).

5. **Explanatory Hints:**
   - Multi-stage hints that guide the student conceptually without spoiling the complete answer.
