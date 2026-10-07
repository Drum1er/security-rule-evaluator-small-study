# Results tied to evidence

## Native observations and the text judge

The frozen [contract](../examples/native/contract.json) maps field names, keeps exact strings and row multiplicities, and ignores element order only in `sld_set`. The declared SPL export adapter additionally accepts timezone-qualified timestamps with zero fractional seconds. The historical contract is preserved unchanged; these capture deviations are explicit.

| Case | Saved Splunk output | Saved Kusto output | Qwen3-4B verdict | Interpretation |
| --- | --- | --- | --- | --- |
| [LSASS ordinary](../results/native/lsass-ordinary/) | One group, count 2 | Same group, count 2 | not_equivalent | False rejection |
| [LSASS witness](../results/native/lsass-witness/) | Empty | One group for `lsass.exe.bak`, count 1 | equivalent | False acceptance |
| [DNS ordinary](../results/native/dns-ordinary/) | One group, qps 100, sld_cnt 3 | Same group and domain set | not_equivalent | False rejection |
| [DNS witness](../results/native/dns-witness/) | One group, qps 100, sld_cnt 3 | Empty grid | not_equivalent | Matching verdict, incorrect explanation |

Each directory contains result exports and sanitized job evidence. The verifier decodes these outputs independently of the historical [comparison summary](../results/native/comparisons.sanitized.json). It also checks all four inputs in both engines: 4, 1, 100 and 100 rows. Repeated DNS rows remain repeated. Their three domain groups have multiplicities 34/33/33. `qps` is the published name for an event count, not a measured rate.

Full prompts and actual responses are in [judge evidence](../results/judge/). LSASS ordinary's response wrongly says the SPL includes EventCode 3. LSASS witness's response wrongly says both engines return a row. Both DNS explanations invent 50 KQL input rows; the retained inputs and exports contain 100. A correct DNS witness verdict therefore does not validate its reasoning. These findings concern these inputs only.

## Record structure and selection

The [LSASS ablation](../results/ablation/) changes only the first-step execution context from `{}` to `{"total_steps":4}`. The actual model requests differ in one output-description line. The baseline response was historical and replayed; the patched response was generated once. Both raw execution paths changed from `[true,true,false,true]` to three unchanged input records, selecting indices 0, 1 and 3. The record with a benign `kernel32.dll` trace remained selected because the frozen IR omitted CallTrace. This is structural improvement, not a repaired detection rule.

The fixed [follow-up assessment](../results/cohort/assessment.json), [protocol](../results/cohort/PROTOCOL.md) and [raw traces](../results/cohort/) separate the endpoints:

| Rule | Analysis role | Baseline structure / selection | Patched structure / selection |
| --- | --- | --- | --- |
| Microsoft Security Event log cleared | Primary | Fail / correct (`r1`) | Pass / correct (`r1`) |
| MITRE CAR-2013-05-004 | Qualified supplemental | Inconclusive / incorrect (empty) | Inconclusive / incorrect (empty) |
| DNS | Excluded | No code arm | No code arm |

Microsoft and MITRE selection uses **own hand-reviewed references**, not Kusto/Splunk runs on those new fixtures. MITRE should retain indices 0 and 1 under the frozen reference. Its original code treated a wildcard literally; the patched generated regex had incorrect escaping. Both empty returns passed component validation but failed the separate selection check. Empty output is structurally inconclusive under the preregistered endpoint.

MITRE also introduced a later missing-field IR operation. A [pre-arm interpretation](../results/cohort/pre-arm-interpretation.json) allowed its first step as supplemental analysis; this qualification was made before its code arms and does not rewrite the original protocol. DNS began with source binding matching every fixture row, so both code arms were skipped without replacement. Later DNS IR changes to regex character classes and time bucketing were static observations, not full-query executions.

## Incomplete and corrected infrastructure

The [partial chain traces](../results/partial/) show four completed source steps and four of six target steps. The next target generation hit the 300-second wall limit. Witness execution and the released comparator did not occur; there is no final semantic verdict. An earlier adapter JSON-wire error, timeout retry, launcher lifetime defect and output-limit misclassification remain documented in [limitations](LIMITATIONS.md); full historical records are retained privately.

The early six-case corrected pilot is absent from this archive chain. No result count or model score from that pilot is claimed as verified here.
