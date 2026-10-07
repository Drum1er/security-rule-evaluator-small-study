# Fixed small follow-up: first-step structure and selection

This is a bounded follow-up to the single LSASS context ablation, not a full ARuleCon or native-engine replication. All earlier archives remain unchanged.

## Fixed selection and ceiling

Three selected sources, with no replacement after any IR/model outcome:
1. Paper-published DNS SPL from ARuleCon Appendix C.3, arXiv:2604.06762v1. This is the existing paper example, not independent production data.
2. MITRE CAR-2013-05-004, Execution with AT, pinned commit 17c2e8633173a78d816df5dc84eebff908d7a51d, SPL implementation.
3. Microsoft Azure-Sentinel Security Event log cleared, historical version1.0.1, pinned commit d4af9625e0d390e5fdbcbdb3abce60e28fcb6c2d. This intentionally simple historical version is not claimed to be the current production rule.

Different public maintainers establish provenance diversity, not statistical independence or exclusion from model training. The DNS example must not be counted as a new independently maintained production source. Source snapshots/licenses and exact query extraction are retained separately.

Maximum: three independent model IR calls plus six first-step calls (one baseline and one patched per eligible rule), nine total. No generation retries, no time/budget extensions, no repaired IR, no favorable-outcome retry, no replacement rule. Each call uses the existing 300-second wall,2048-output-token,maximum8192-context,6GiB-RSS configuration. The existing corrected child isolation and limits are unchanged. No native setup or queries, accounts, endpoints, full chains, witness generation, or later pipeline steps.

## Registration order

Freeze source queries, neutral synthetic records, selection, code and protocol before IR generation. Model IR receives only the original query and released language guide, without fixtures or expected outcomes. Save each IR unchanged. Before either code-generation arm, review the first IR step and freeze a separate own-reference selection oracle and eligibility decision. The source's full initial filter and the IR's first step are distinct: a legitimate decomposition into several filters must not be judged against the entire rule at the first step.

An invalid/missing-field/ambiguous IR, a single-step IR, or a first step that is a transform rather than a filter is ineligible for this filter-specific ablation; report it without substitution. In particular, DNS begins TLD extraction and may be ineligible. No missing derived field will be inserted to make it eligible. If the model merely decomposes a compound filter, preserve that decomposition and document the narrower first-step reference. A substantive IR omission remains a separate IR-fidelity failure; it is not repaired.

## One factor and endpoints

Baseline context is `{}`. Patched context is `{"total_steps": len(frozen_ir["steps"])}`. Both invoke the same exact released first-step system prompt and `_generate_and_validate_step`, then stop. Require the actual model requests to differ only in the released output-description line and to select the same actual context size. All other model weights/settings and input records match. Both arms generate once; if released validation requests a retry, record an incomplete arm without granting it another generation.

Structural endpoint: in both raw validation and all-data returns, a nonempty list of complete unchanged input dictionaries with exact field/value/type preservation and no excess multiplicity. Boolean masks do not pass structure. Empty/unrepresentable/failed/incomplete outputs are inconclusive.

Selection endpoint: compare decoded selection with a separately frozen hand-reviewed first-step reference. Supported output forms are (a) full unchanged input records with multiplicity respected or (b) exactly one Boolean per input record in input order. This order assumption is an explicit first-step mask contract, not a mapping for aggregate results. Other representations are uninterpretable. Evaluate both raw calls and report disagreements. References are authored for synthetic fixtures and are NOT native results. Source-filter correctness and IR-step correctness are reported separately when their scopes differ.

Fixtures must contain both matching and nonmatching conditions relevant to the source. IDs/host names/path names must not reveal labels. The model never sees oracle files or expected-index lists. Decisions and labels stay out of query/fixture prompts.

## Stopping and interpretation

Stop each arm immediately on resource/validation/transport failure; do not alter limits or code. Finish only remaining independently scheduled eligible arms within the fixed cap. A globally unavailable execution environment blocks the cohort rather than triggering a replacement environment or new setup.

Report every selected rule, ineligible IR, failed arm and negative result. Preserve structure and predicate outcomes as separate axes. At completion give a firm recommendation on a six-month commitment using the observed transfer, regressions, source diversity and limitations. This request ends with that recommendation and artifact; it does not create another open-ended experimental gate. No general accuracy estimate, training exclusion, production validity, novelty, or full equivalence claim follows from this tiny cohort.
