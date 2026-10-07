# Privacy and publication-copy review

The publication candidate is the exact set in [PUBLICATION_FILES.md](PUBLICATION_FILES.md). The full source archive, read-only backup, extraction tree and private audit remain outside it.

The original archive contained account email in Kusto DOM captures. Potential credential assignments were also flagged in excluded configuration/client text; their values were not printed or copied into this candidate. Scan findings report only risk type and file location. The full original evidence was not silently edited, and no credential was changed or revoked.

Sanitization decisions:

- All screenshots, full UI DOM, browser/capture configuration, full server metadata and nested ZIPs were omitted. No image redaction or image-metadata clearance is claimed.
- Splunk job copies retain only submitted query, engine version, completion, row-count, truncation, sampling and error fields. Host/user/URI/session/job and unrelated process metadata are removed.
- The DNS empty Kusto result retains a marked result-region DOM excerpt and a sanitized observation; account and cluster UI content and the request identifier are removed. Original row absence and missing type metadata remain explicit.
- Model commands replace local executable, model, prompt and output paths with named placeholders. Synthetic query values and actual model responses remain unchanged.
- Selected function traces omit duplicate stdout and wrapper metadata while retaining raw arguments and outputs. Original and derived hashes and the exact transformation are in [provenance](../results/provenance.json).
- `host-a`, reserved `.example.test` hosts, `LAB` fixture accounts, Windows example paths, record IDs, public source commits and content hashes are deliberate data/source references. The four-part value `10.6.0.5` is the recorded Splunk version, not a private IP address.

The external final ZIP receipt `portfolio-project-2026-10-07-r4.validation.json` records fresh checks of extracted filenames and text/data, common credential/identifier patterns, excluded artifact types and Git-history presence. The original private source-email list is unavailable for this r4 review, so no fresh exact-match scan against that list is claimed. The r2 known-identifier review is historical; byte identity of all 161 transferred evidence files and inspection of changed documentation preserve its relevant context without presenting it as a new scan. The ZIP contains no `.git` directory or inherited history. Source-validation records, tests and documentation are included in the scan. The receipt also has a separate scan of its text. See [packaging](PACKAGING.md) for why final release reports stay outside the checked package. Supporting local Git metadata is a verifier exclusion, not a privacy clearance for a later Git history.

Pattern scanning and manual review do not prove absence of every possible secret. The observed review outcome applies to these exact files; adding images, logs or new captures requires a fresh check. ZIP entries contain reviewed relative filenames and normalized timestamps, with no archive comment or owner metadata. Public publication is authorized; the unresolved ADX supplemental-terms uncertainty remains disclosed in [publication status](../PUBLICATION_BLOCKERS.md). Upload verification is separate from this privacy review.
