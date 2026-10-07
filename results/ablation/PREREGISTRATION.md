# First-step context ablation, frozen before new generation

Scope: one published LSASS SPL rule, its already saved source IR and ordinary synthetic input. This follows the completed native gate and partial component trace; it is not pre-native registration. The known missing CallTrace / added SourceImage IR error remains unchanged.

The sole intervention is the first-step execution context: `{}` becomes `{"total_steps": len(saved_source_ir["steps"])}` (4). Both arms call the exact released system-prompt builder and `_generate_and_validate_step` for step index 0, then stop. This is a first-step component call, not a complete `_generate_code_blocks` run. The intervention is in the caller context; the pinned optimizer class itself is unchanged.

Before generation:
1. Freeze code/input hashes and the exact one-line driver diff.
2. Obtain both requests inside the unchanged sandbox, using no model response.
3. Require baseline request equality with the previously captured request, including full message text and kwargs.
4. Require the only prompt change to be replacement of the final-output description with the released intermediate-output description; system message and all other content must match.
5. Save the prompt diff and hashes, then freeze the final protocol.

Baseline uses its saved complete response; there is no new baseline inference. Its validation and all-data paths are replayed in the corrected sandbox and must reproduce the saved first-step raw outputs. The patched arm uses the same official offline model weights, renderer, model settings, input, and protocol. There is one initial generation. Only if the released first-step extraction/validation requests another attempt may its unchanged maximum of three attempts be used (one initial plus at most two retries). A resource failure stops immediately; it does not authorize a retry or larger budget. There is no second-step generation or execution, no witness, no target-language chain, no DNS, and no comparator.

Limits per model attempt: wall 300 seconds, output 2048 tokens, context at most 8192, RSS 6 GiB, identical seed and sampling. Child: corrected reviewed launcher, unchanged mounts/seccomp, AS 256 MiB, CPU 3 seconds, wall 10 seconds, combined output 64 KiB. No network endpoint or credential access.

Primary outcome, evaluated on both raw validation return and raw all-data return: a nonempty list of complete dictionary records, each exactly matching an input record with all fields/types/values preserved; multiplicity must not exceed input multiplicity. Canonical JSON preserves the bool/int/float distinctions that ordinary Python equality could lose. Returning every input can pass this structural endpoint; it is not a full filtering-correctness test. Confirm patched context selection equals the historical baseline's actual 4096-token context before inference, not merely the same 8192-token maximum.

Decision rules:
- Baseline fails and patched passes: a one-sample improvement in first-step record preservation, associated with this controlled context intervention.
- Patched valid output remains a boolean/scalar/malformed-record representation: negative outcome for this intervention in this sample.
- Empty output, failed execution/validation, timeout, exceeded limits, replay mismatch, incomplete or unrepresentable capture: inconclusive; no semantic score and no repaired output.
- If both preserve records, no observed improvement; if baseline replay differs, stop as inconclusive before patched inference.

No claim that this fixes the known IR error, proves all query semantics, establishes a final equivalence verdict, or identifies the sole cause of earlier failures. One deterministic sample does not estimate an effect distribution or general reliability.
