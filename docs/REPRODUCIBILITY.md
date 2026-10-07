# Reproducibility

## A. Offline evidence check — no services or credentials

Use Node.js 24 (r2 packaging runtime: 24.19.0; the external r4 receipt records the current validation runtime). No `npm install`, Python environment, account or API key is needed. From a clean extracted `portfolio-project` folder:

```powershell
node --permission --allow-fs-read=. --no-addons src/verify.mjs
node --permission --allow-fs-read=. --no-addons --test --test-isolation=none tests/evidence.test.mjs
node --permission --allow-fs-read=. --no-addons src/verify.mjs --example lsass-witness
```

These commands are identical in PowerShell and a POSIX shell. The verifier resolves data relative to its own module, reads the exact manifest-listed files, and writes nothing. Run permission mode from the package root so `.` grants only package reads. Built-in tests run in the same process, without worker/child permissions.

The manifest regression suite additionally tests root `.git` directory/file handling, same-size evidence tampering, missing/extra evidence, nested `.git`, `.gitignore`, similar names and an invalid manifest entry. It creates and removes only its own disposable copies under the system temporary directory, which must be outside the package. In PowerShell, run both suites with:

```powershell
node --permission --allow-fs-read=. --allow-fs-read="$env:TEMP" --allow-fs-write="$env:TEMP" --no-addons --test --test-isolation=none tests/evidence.test.mjs tests/manifest.test.mjs
```

Use a normal external `TEMP`/`TMP` location; if both are set, they should identify the same directory. POSIX equivalent (the directory must exist):

```sh
TMPDIR="${TMPDIR:-/tmp}" node --permission --allow-fs-read=. --allow-fs-read="${TMPDIR:-/tmp}" --allow-fs-write="${TMPDIR:-/tmp}" --no-addons --test --test-isolation=none tests/evidence.test.mjs tests/manifest.test.mjs
```

The final ZIP receipt is external: `portfolio-project-2026-10-07-r4.validation.json`, supplied alongside the ZIP. It records the tested release version, exact manifest hash/count, ZIP hash, commands, exit codes and complete output from a fresh extraction. The release check uses an environment containing only operating-system/runtime essentials, without inherited account or API variables; its temporary write allowance is a private tmpfs outside the read-only package. No test report is written into the extracted package. See [packing order and verification boundary](PACKAGING.md).

The verifier code is byte-identical to r2/r3 and retains a historical `publication: "BLOCKED"` field. That field is not a fresh rights assessment or the current owner-authorization record. Use [RELEASE.json](../RELEASE.json) and [publication status](../PUBLICATION_BLOCKERS.md) for the current status; offline verification cannot establish a remote upload.

Runnable package modules use only filesystem, path, OS, crypto, assert, URL and test built-ins. Node permission mode limits filesystem and process capabilities; it is not a network sandbox or the validated Linux isolation required to execute arbitrary generated Python.

The new verifier checks file integrity, query/prompt bindings, native job completion flags, full input row multisets, literal Kusto exports, explicit time conversion, model responses, first-step raw returns and partial-chain receipts. It does not interpret or execute SPL/KQL/Python. Unit tests use deliberately malformed data to test the verifier, not to manufacture research outcomes. Historical Python verifiers were statically reviewed but **NOT RUN** here because the installed Python executables were inaccessible.

JSON comparison inputs reject floating numeric tokens (including `1.0`), booleans as integers and unsafe integers. Row duplicates are preserved. Only `sld_set` permits reordered elements, with duplicates rejected. `diagnostic_time_epoch` is verified against SPL `_time` before it is removed from the input comparison; the raw export remains unchanged.

## B. Repeat the native observations — NOT RUN during packaging

This requires the owner's existing authorized Splunk/ADX access and applicable terms. Do not change the saved observations. Use a separate private rerun directory and record a new timestamp and build for each engine. Archived Splunk version is **10.6.0.5**. The Kusto server build is **unknown**, so exact engine-version reproduction cannot be promised.

1. Read [the contract](../examples/native/contract.json) and its disclosed export adaptations in [limitations](LIMITATIONS.md). Verify hashes before running anything.
2. In Splunk Search & Reporting, execute each exact file in `examples/native/input-queries/*.spl`. In ADX, execute the corresponding `.kql`. These are input diagnostics. Save complete outputs and compare all fields and multiplicities with the four `examples/native/fixtures/*.json` files. SPL's added diagnostic time field is an output-only copy.
3. Execute the four ordinary final queries in `examples/native/queries/` first (LSASS/DNS in SPL/KQL). Preserve exact submitted query text, engine version, start/end time, completed status, warnings/errors, full rows, column names/types where available and run identifiers privately. Stop an affected pair if the ordinary case is incompatible.
4. Execute the four corresponding witness queries unchanged. SPL should be exported as complete non-preview job/results JSON (`count=0`, `offset=0` when using an existing approved REST capture route). Do not use a truncated UI page as full evidence. Kusto nonempty results should use complete Copy-as-datatable exports; an empty result needs a completed grid and column names, with any missing type metadata explicitly stated.
5. Preserve raw evidence before making publication derivatives. Use the declared field mapping and multiset comparison, with whole UTC seconds. Record any required adapter change as a new protocol change; never silently repair a query or replace saved data. The historical exported DNS `qps` field is a count.

This is a manual repeat of the bounded native protocol, not a new engine installer or an automated authenticated capture tool. Earlier captures used a Kusto UI export and Splunk Web REST proxy; the complete macro/index/ingestion pipeline remains outside scope.

## C. Repeat text judging — NOT RUN during packaging

Use the official [llama.cpp project](https://github.com/ggml-org/llama.cpp) and [Qwen3-4B-GGUF](https://huggingface.co/Qwen/Qwen3-4B-GGUF), obtained separately in an approved environment. No binaries or weights are distributed here. The historical build is `b11146-7fe450e19`; Q4_K_M weights SHA-256 is `7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5`. The judge executable hash is in [runtime-summary.json](../results/judge/runtime-summary.json). Component runtime hashes are separately retained in [runtime-hashes.txt](../results/cohort/runtime-hashes.txt); do not assume the two executables are byte-identical.

`results/judge/receipts.sanitized.json` stores the exact ordered command arguments with four explicit path substitutions: `<LLAMA_COMPLETION>`, `<MODEL_GGUF>`, `<JUDGE_PROMPT>` and `<CONVERSATION_OUTPUT>`. Replace them with your verified executable, weights, the matching `results/judge/<case>.prompt.txt`, and a new private output path. Preserve every other argument. Each case's context size is recorded separately (4096 or 8192).

For example, the archived judge configuration uses temperature 0, seed 42, six threads, CPU execution, 512 output tokens, no thinking and the official model-embedded chat template. `--jinja` takes the **plain prompt**, while `*.rendered-prompt.txt` is retained for template/hash inspection; do not apply the template twice. Enforce the historical 300-second wall and 6 GiB RSS limits externally. The command alone does not enforce those process limits. Capture the full response, stdout/stderr, command, hashes and any termination. Do not retry selectively for a favorable outcome. Fixed seeds do not guarantee identical outputs across builds/hardware.

## D. Repeat adapted component experiments — NOT RUN; separate consent and validated isolation required

The public candidate deliberately contains inert upstream `.py.txt` evidence rather than an executable launcher. Historical launchers, controller versions, prompts, tapes and limits remain in the private original archive. Review them before any authorized repeat; do not execute them merely because they are archived.

Pin ARuleCon commit `5a8bb658c09e4cad32bc53e6cc5c1ccc73955d3a`. Restore the reviewed Linux adapter and corrected launcher in a separately validated environment, with no secrets, filesystem write access or network syscalls, and verified kill/reap behavior for closed stdout/stderr. Historical child limits were CPU 3 seconds, address space 256 MiB, wall 10 seconds and output 64 KiB. An independent network namespace was unavailable in the historical setup; do not claim it existed.

For the LSASS ablation, preserve the frozen IR and four input rows; replay the historical baseline and generate the patched first step once using `total_steps=4`. For the fixed cohort, follow the retained [protocol](../results/cohort/PROTOCOL.md): freeze inputs before IR, freeze first-step references before code, apply the documented MITRE qualification, exclude nondiscriminating DNS, compare `{}` with `{"total_steps":len(steps)}`, and retain both raw call paths. Component prompts are already rendered and use `--no-conversation`, 2048 output tokens and the receipt's context size. Do not run later steps or substitute rules.

The earlier incomplete LSASS full chain cannot be described as successfully reproduced. Continuing it would be a new explicitly authorized experiment, outside this packaging task. The original/corrected pilot likewise cannot be repeated exactly until its missing artifacts are supplied.
