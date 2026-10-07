# Evidence map and provenance

| Claim or stage | Evidence retained here | Current assessment |
| --- | --- | --- |
| Original ZIP and nested chain preserved | [Archive inspection](../results/validation/archive-inspection.json), [source integrity](../results/validation/source-integrity.json) | Four ZIP levels; 834 extracted files; all 830 manifest-listed hashes match |
| Original six-case pilot was repaired | Owner statement; historical preparation references in private source | Missing primary artifacts; not independently verified |
| Four native comparisons | [Native exports](../results/native/), frozen [fixtures](../examples/native/fixtures/), [queries](../examples/native/queries/) | Recomputed from saved results; live rerun NOT RUN |
| Judge disagrees with three native comparisons | [Prompts, responses and receipts](../results/judge/) | Exact prompt/query bindings and parsed verdicts checked |
| `total_steps` affects output instruction | [Upstream class](../examples/upstream/SemanticRuleOptimizer.py.txt), [finding](../results/partial/total-steps-finding.json), [prompt diff](../results/ablation/prompt.diff) | Static source and actual paired requests support narrow claim |
| LSASS first-step records preserved but selection remains wrong | [Ablation input and traces](../results/ablation/) | Both raw call paths checked; frozen IR still omits CallTrace |
| Microsoft success, MITRE failure, DNS exclusion | [Cohort evidence](../results/cohort/), [fixtures/references](../examples/cohort/) | Checked against own frozen references; no new native oracle |
| Original component experiment incomplete | [SPL/KQL traces and timeout](../results/partial/) | Four source and four target step returns; target IR has six steps |
| Owner's personal work | Owner's supplied `2.txt`, summarized in [AI_ASSISTANCE.md](AI_ASSISTANCE.md) | Owner-reported; not inferred from AI-authored artifacts |

The original ZIP SHA-256 is `cf7699907bb879f9169c52dac8e61ffa9fe71dd736d7ffddaac63ec44012fbeb`. A byte-identical read-only backup is stored outside this candidate in `private-archive/`. Read-only is a local protection, not a tamper-proof guarantee. Four manifest files are not listed in their own historical manifests; the extraction inventory hashes all 834 entries separately.

[results/provenance.json](../results/provenance.json) maps every transferred file to its exact nested archive, source path, original SHA-256, packaged SHA-256 and transformation. Original and derivative hashes are explicitly different concepts. `*.sanitized.*` artifacts identify their transformation; originals remain private. Complete screenshots, full UI DOM, installers, binaries, model weights, nested backup ZIPs and unrelated logs are omitted.

The new JavaScript verifier reimplements the existing data-only comparison contract because the installed Python could not run in the packaging environment. Its reference logic was statically reviewed in the archived `verify_complete_gate.py`, `verify_fixed_cohort.py`, `evaluate_cohort.py`, `verify_ablation.py` and `verify_capture.py`. It adds no rule execution engine. New source, tests and documentation are AI-assisted packaging work, identified as generated files in the final manifest.

The preserved `frozen-runs.json`, protocol and runtime summary contain historical preparation labels. Current conclusions use subsequent raw captures and traces, not those stale preparation statuses. The native stage's statement that ARuleCon was not run applies to that stage; the later component stage is recorded separately.
