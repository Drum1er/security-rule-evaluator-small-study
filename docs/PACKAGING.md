# Release identity and final ZIP validation

This public-release package is **2026-10-07-r4**. The original r2 and r3 ZIPs are preserved unchanged. All 161 transferred evidence files identified in `results/provenance.json`, the verifier/tests and `SCOPE.md`, `docs/RESULTS.md`, `docs/LIMITATIONS.md` retain their r2/r3 bytes. Only documentation, manifest and release metadata change in r4. No new research runs were performed.

## Packing order

1. Complete documents/notices and release identity. Keep the builder and every validation report outside `portfolio-project/`.
2. Regenerate `docs/PUBLICATION_FILES.md`, then `MANIFEST.json` for every file except itself; preserve origin records for unchanged files and mark r4 documentation/metadata changes accurately.
3. Freeze bytes and create the sorted ZIP beneath `portfolio-project/`, with normalized timestamps `2026-10-07T00:00:00Z`, no archive comment, no custom extra fields or Git metadata.
4. Extract this final ZIP into a fresh validation directory. Verify path/count/byte identity, original r3 ZIP digest, all 161 evidence hashes and unchanged source/tests/claims.
5. After static review and explicit owner permission, run only the offline verifier, both test suites and LSASS example in a verified network-denied isolation environment with no home secrets. Temporary test copies remain outside the package. If isolation or a command is unavailable, report NOT RUN rather than a pass. No package dependency installation or engine/model/research Python execution is permitted.
6. Record commands, runtime, isolation evidence, stdout/stderr, exit codes, manifest/ZIP hashes, static privacy/link review and before/after snapshots in the external receipt. Write the external checksum. Do not change/reseal the ZIP afterward.

Companions: `portfolio-project-2026-10-07-r4.zip`, `portfolio-project-2026-10-07-r4.zip.sha256`, `portfolio-project-2026-10-07-r4.validation.json`. The receipt, rather than historical r2/r3 reports, states the actual r4 test status. The manifest does not hash itself; the ZIP checksum binds it. `manifest_files + 1` must equal the extracted/ZIP file count.

The root `.git` exclusion is solely a verifier behavior, not privacy clearance for a Git history. Any later added file requires resealing and revalidation. Rights review and owner publication approval remain separate from successful software checks.

The preserved verifier still emits its historical `publication: "BLOCKED"` label. The external receipt retains that output without rewriting it. Current owner authorization and the pending-upload verification status are recorded in `RELEASE.json` and `PUBLICATION_BLOCKERS.md`.
