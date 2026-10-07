# RulePilot article attribution and changes

Hongtai Wang, Ming Xu, Yanpei Guo, Weili Han, Hoon Wei Lim and Jin Song Dong. **RulePilot: An LLM-Powered Agent for Security Rule Generation**. Version `arXiv:2511.12224v1`; ICSE '26. Copyright 2026 held by the owner/author(s). [Version 1 PDF](https://arxiv.org/pdf/2511.12224v1); [DOI](https://doi.org/10.1145/3744916.3773249).

The first page expressly states **Creative Commons Attribution 4.0 International**. [License](https://creativecommons.org/licenses/by/4.0/); [legal code and warranty disclaimer](https://creativecommons.org/licenses/by/4.0/legalcode.en).

Included material: the upper-right **RulePilot-generated KQL** of Figure 8, page 11, transcribed in `examples/native/originals/lsass.kql`, with its synthetic wrappers and quoted portions in native, judge, ablation and partial-chain evidence. The original SPL panel has a separately established Splunk security_content source under Apache-2.0; see [source notice](Splunk-SECURITY-CONTENT-NOTICE.md). Figure 8 also contains a different Microsoft SPL2KQL output. That output is not the KQL used in this package, and a scan found no corresponding output signature in its text/data files. This notice does not claim a license for the Microsoft converter.

Changes: visual soft wrapping was collapsed during transcription; synthetic fixtures, input diagnostics and execution wrappers were added as documented; captured metadata was selectively sanitized. The evidence bytes are not changed in r3. Earlier modification notices are retained. Full paper and screenshots are not included. No author endorsement is implied.

The historical `examples/native/source-records.json` already identifies the upper-right RulePilot panel; its unresolved Microsoft-sample provenance observation is superseded by the source-specific notices here, not silently edited. Article licensing applies only to rights the article licensors have authority to grant; separately owned material retains its own terms.
