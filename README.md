# Security rule evaluator: a small evidence study

A compact, AI-assisted study of how a local Qwen3-4B judge and an adapted ARuleCon component behave on selected security-rule examples. The package checks **saved evidence**, including negative and incomplete results. It does not estimate general model accuracy or reproduce either paper's full system.

**Prepared public-release package r4.** The owner authorized publication to `Drum1er/security-rule-evaluator-small-study` and confirmed scoped MIT for own materials. The unavailable ADX supplemental terms remain a disclosed review uncertainty. At sealing, the r4 upload is pending verification; this package does not assert a completed upload. See [publication status](PUBLICATION_BLOCKERS.md) and [rights map](RIGHTS_MAP.md).

## One concrete example

On the saved LSASS witness containing `lsass.exe.bak`, Splunk returned no rows and Kusto returned one group. The text judge said `equivalent`. This is a false acceptance on that particular input. The SPL suffix pattern and KQL substring predicate differ; the recorded outputs, not a newly written query simulator, establish the observed difference.

## Run offline

Use Node.js 24; r2 was tested with **24.19.0** on Windows. The external r4 receipt records the current validation runtime. There are no package dependencies and no install step beyond an existing [Node.js installation](https://nodejs.org/en/download). Run from this folder:

```powershell
node --version
node --permission --allow-fs-read=. --no-addons src/verify.mjs
node --permission --allow-fs-read=. --no-addons src/verify.mjs --example lsass-witness
node --permission --allow-fs-read=. --no-addons --test --test-isolation=none tests/evidence.test.mjs
```

The commands also work in a POSIX shell. Exit 0 means the retained evidence passed the listed checks. It does **not** mean the model was correct, that the engines ran again, or that publication is cleared. The verifier writes nothing and needs no Splunk, Kusto, accounts, API keys or model weights. Its unchanged `publication: "BLOCKED"` output is a historical label, not the current owner-authorization status; see [RELEASE.json](RELEASE.json) and [publication status](PUBLICATION_BLOCKERS.md). The additional manifest regression suite uses disposable copies outside this folder; see [all test commands](docs/REPRODUCIBILITY.md). The exact final ZIP is tested after extraction, with its receipt and SHA-256 supplied alongside it as described in [packaging](docs/PACKAGING.md).

## Findings

| Retained experiment | Bounded finding |
| --- | --- |
| Two published SPL→KQL pairs, four synthetic cases | Two false rejections, one false acceptance, one matching verdict with an incorrect explanation |
| LSASS first-step context intervention | Boolean mask became complete records; the wrong selection remained |
| Fixed follow-up | Microsoft retained the correct selected record; both MITRE arms missed two expected records; DNS was excluded |
| Earlier component chain | SPL 4/4 steps, KQL 4/6; no witness execution or final comparator |

See [results and evidence links](docs/RESULTS.md), [scope](SCOPE.md), [limitations](docs/LIMITATIONS.md) and [evidence map](docs/EVIDENCE_MAP.md). The earlier `__row`→`rownum` pilot is documented as **missing evidence**, not counted in these findings.

## Contents and attribution

`src/` contains the new data verifier; `tests/` checks its failure cases; `examples/` contains frozen inputs, queries and inert upstream excerpts; `results/` retains outputs and trace derivatives; `docs/` explains interpretation and reproduction. [Provenance](results/provenance.json) records original and derivative hashes for every transferred source file. [MANIFEST.json](MANIFEST.json) covers all package files except itself. Only root `.git` metadata is excluded if a local checkout adds it; nested `.git` paths, `.gitignore` and every evidence file remain checked. This ZIP contains no Git metadata. The review version is recorded in [RELEASE.json](RELEASE.json).

The owner confirmed initiating the study, setting requirements, preparing Ubuntu/Splunk, personally running the initial SPL queries, and coordinating later automation. AI supplied most code, substantial method and analysis, automated execution and packaging. The detailed historical account retains its evidence qualifications; the initial pilot artifacts are absent. The external r4 receipt records this release’s actual offline verification status. See [AI assistance](docs/AI_ASSISTANCE.md), [third-party notices](THIRD_PARTY_NOTICES.md), [external reproduction](docs/REPRODUCIBILITY.md), the [Russian walkthrough](docs/OWNER_GUIDE_RU.md), and the [portfolio draft](docs/PORTFOLIO_DRAFT.md).
