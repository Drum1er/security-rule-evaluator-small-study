# Rights and licensing scope

The owner confirmed on 2026-10-06: attribution as **Akylbek Ongarbekov**, MIT for own materials with separate third-party licenses, and the concise human/AI contribution statement. A license grant is limited to rights the grantor holds; this document makes no claim that every AI-generated passage is copyrightable or exclusively owned.

## Original contributions under the scoped MIT license

- `src/evidence.mjs`, `src/verify.mjs`, `tests/evidence.test.mjs`, `tests/manifest.test.mjs`: newly written offline checking code and tests. Any quoted third-party strings retain their source rights.
- `examples/native/fixtures/*.json` and `examples/cohort/*.fixture.json`: original synthetic input records, to the extent protectable.
- `examples/cohort/*.oracle.json`: original reference annotations, excluding quoted source predicates.
- `.gitignore`, `README.md`, `SCOPE.md`, `PUBLICATION_BLOCKERS.md`, `RIGHTS_MAP.md`, `RELEASE.json`, `MANIFEST.json`, `docs/*.md`: original explanation, packaging metadata and documentation, excluding third-party quotations, copied license text and separately governed evidence reproduced there.

The MIT text is in [LICENSE](LICENSE). This is a mixed-rights evidence package, not a blanket relicensing of all files.

## Separately governed material

| Scope | Basis and treatment |
| --- | --- |
| `examples/upstream/*` and copied ARuleCon code/prompts in requests, rendered prompts, traces and results | ARuleCon repository MIT, with its original notice in `licenses/ARuleCon-MIT.txt` |
| `examples/cohort/microsoft-security-event-log-cleared.source.yaml`, its `.kql`, quoted source portions and dependent prompt/IR evidence | Microsoft MIT notice in `licenses/Microsoft-MIT.txt` |
| `examples/cohort/mitre-CAR-2013-05-004.source.yaml`, its `.spl`, quoted source portions and dependent prompt/IR evidence | MITRE Apache-2.0 and NOTICE retained in `licenses/` |
| LSASS original SPL and derivative wrappers/copies throughout `examples/native/`, `results/judge/`, `results/ablation/`, `results/partial/`, `results/native/` | Splunk security_content Apache-2.0; see `licenses/Splunk-SECURITY-CONTENT-NOTICE.md` and `licenses/Splunk-Apache-2.0.txt` |
| LSASS RulePilot-generated KQL and copied portions throughout the same evidence families | Article CC BY 4.0, with source, authors and changes in `licenses/RulePilot-ARTICLE-NOTICE.md`; upstream SPL rights are separately acknowledged |
| DNS article listings and derivative wrappers/copies in `examples/native/`, `examples/cohort/dns.spl`, requests, prompts and results | ARuleCon article CC BY 4.0; see `licenses/ARuleCon-ARTICLE-NOTICE.md`; separately owned third-party portions are not automatically relicensed |
| Saved native Splunk/ADX exports, job/grid metadata, derived comparisons and descriptions | Actual service terms remain separate; no blanket MIT grant. See `PUBLICATION_BLOCKERS.md` for the unavailable ADX supplemental terms and evaluated Splunk terms |
| Model responses, generated IR/code and execution traces in `results/` and `examples/*/*.ir.json` | Preserve model-output attribution and embedded third-party rights. No assertion of exclusive copyright or blanket MIT clearance |
| `results/provenance.json`, `results/validation/*`, source records and other transferred historical metadata | Preserved as evidence of the original review; hashes prove identity, not authorship, service attestation or license clearance |
| Existing license and NOTICE files | Their own texts and attribution govern; do not replace with the owner's MIT |

For mixed files, the original wrapper does not erase the license of copied text. All 161 files listed in `results/provenance.json` are unchanged from r2. Full papers, images, executables, model weights, configuration files and original private archives are not redistributed.

The historical source-record licensing observations remain intact; the current article/source notices explicitly supersede outdated interpretations without silently rewriting evidence.
