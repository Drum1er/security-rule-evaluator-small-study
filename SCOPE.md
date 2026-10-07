# Scope

**Question:** On these selected synthetic inputs, do text-based equivalence judgments agree with saved native SPL/KQL outputs, and does passing the total number of IR steps preserve intermediate records in the adapted Python component?

The available evidence contains four native comparisons across two published SPL→KQL pairs, four text-judge responses, an incomplete LSASS component chain, one LSASS first-step intervention, and a fixed follow-up with one primary case, one qualified supplemental case and one exclusion. The follow-up used seven model calls: three IR generations and four code generations. These are historical calls; packaging performed none.

The useful result is a small auditable set of counterexamples and separate checks for record preservation and selection correctness. Offline verification reconstructs comparisons from retained exports, checks input multiplicities and query/prompt bindings, assesses raw step returns against frozen references, and preserves incomplete status.

Boundaries:

- Native engine results and hand-reviewed first-step references are distinct evidence types.
- The plain text judge did not execute ARuleCon. The later component experiments used an explicitly adapted, partial execution path.
- A structure improvement does not establish a correct predicate or full-chain equivalence.
- The supplied archive does not contain the original and corrected six-case pilot or its model rerun. Its `__row` correction remains background supported by the owner's statement and historical references.
- Four deliberately selected native cases and single generations cannot support an overall accuracy percentage, uniqueness claim, production recommendation or complete paper replication.

No new research cases, model generations, native executions or unfinished-chain continuations were added. New tests exercise the verifier itself and are not experimental observations.
