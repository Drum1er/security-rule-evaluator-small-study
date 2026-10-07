# Splunk security content attribution and changes

**Access LSASS Memory for Dump Creation**, version 2; author field **Patrick Bareiss, Splunk**; rule ID `fb4c31b0-13e8-4155-8aa5-24de4b8d6717`.

Copyright 2022 Splunk Inc.

Source: [pinned rule](https://github.com/splunk/security_content/blob/5ae53c936881937863826963846090394de7a9ed/detections/endpoint/access_lsass_memory_for_dump_creation.yml), commit `5ae53c936881937863826963846090394de7a9ed`. The original source is licensed under the **Apache License, Version 2.0**. The [included license text](Splunk-Apache-2.0.txt) was recovered from the [same commit LICENSE](https://github.com/splunk/security_content/blob/5ae53c936881937863826963846090394de7a9ed/LICENSE); terminal newline normalized. The copyright above is retained from the [same commit README](https://github.com/splunk/security_content/blob/5ae53c936881937863826963846090394de7a9ed/README.md#license). No NOTICE or separate license file was listed in the pinned root, `detections/` or `detections/endpoint/` hierarchy; this is not an exhaustive recursive repository audit.

The rule's source-query tokens match Microsoft SPL2KQL Sample 1 with whitespace differences. The original SPL panel in RulePilot Figure 8 abbreviates that query by omitting trailing macros. This package transcribes the Figure 8 excerpt as `examples/native/originals/lsass.spl`; it does not claim to reproduce the entire upstream rule. Preserve this modification notice.

Further changes: visual line wrapping was collapsed, declared synthetic sources/input diagnostics were added, and the `sysmon` source macro was replaced by the disclosed inline fixtures in executable query wrappers. The evidence contract records the source substitution; no claim of a complete production macro/index pipeline is made. Excerpts and adaptations appear in `examples/native/`, judge prompts, component requests/traces and native captures. r3 preserves all transferred evidence byte-for-byte from r2.

The paired proper KQL is RulePilot's article-generated output, separately attributed under CC BY 4.0 in [the article notice](RulePilot-ARTICLE-NOTICE.md). No Microsoft converter license is inferred. No endorsement is implied. Apache-2.0 applies to the source rule within its licensors' rights; it does not settle Splunk service terms or ADX account conditions.
