---
id: results
title: Evaluation results
sidebar_label: Results
---

# Evaluation results

The full run record, and the Preview transcript that reframes it.

**The headline is 0 percent with 6 of 6 Fail. The conclusion is that the evaluation runtime failed,
not the agent.**

## Run record

| Field | Value |
| --- | --- |
| Test set | Ray Knowledge Eval - 6Q |
| Test method | General quality |
| Date | 2026-06-07, 12:47 PM |
| Tested by | Darbot |
| Duration | Approximately 31 seconds |
| Cases | 6 of 6 |
| Score | 0 percent |
| Result | 6 Fail, 0 Pass |
| Agent version | Current draft |

## What each version returned

| Agent version | Behaviour |
| --- | --- |
| Current draft | The system fallback response, not a grounded answer |
| Published | HTTP 500 |

Neither path reached the agent's knowledge configuration. The draft returned a canned fallback — the
string an agent emits when it has no answer path — and the published version did not return at all.

Six identical failures in 31 seconds is itself a signal. A genuine knowledge failure would vary: some
questions harder than others, some partial credit, some near-misses. Uniform failure at uniform speed
is characteristic of a path that terminates before reaching the thing being tested.

## The Preview transcript

The same agent, the same session, minutes apart.

Preview grounded correctly and returned **four `docs.ray.io` citations**.

| Surface | Knowledge grounding | Citations |
| --- | --- | --- |
| Preview | Correct | 4 from `docs.ray.io` |
| Evaluate, draft | System fallback | None |
| Evaluate, published | HTTP 500 | None |

That contrast is the entire argument. One agent, one configuration, one session. One surface grounds;
another does not. The variable is the surface, not the agent.

## Why this is safe to publish

An agent that scores 0 percent looks bad. Publishing the score without the Preview comparison would
be misleading in one direction; suppressing the score entirely would be misleading in the other.

Publishing both is the only honest option, and it produces a more useful finding than either would
alone: **the evaluation harness does not exercise the knowledge path.**

That is a defect in the tooling, discovered by accident, and worth more to a reader than a passing
score would have been.

## What would falsify this

Stating the counter-evidence, since the conclusion is load-bearing:

**If Preview also failed**, the agent would be the problem. It did not.

**If only some cases failed**, partial knowledge coverage would be the likelier explanation. All six
failed.

**If the published version returned a wrong answer rather than HTTP 500**, that would be an agent
result. A 500 is an infrastructure result.

**If a later run on the same configuration passed**, the original run would be transient. No such run
was performed, and this is the weakest point in the chain — a single run is a single observation.

## The evidence chain

| Evidence | Source |
| --- | --- |
| 0 percent, 6 Fail | `37_evaluate_results.png` |
| Preview grounding with 4 citations | `22_iq_verified-preview.png` |
| Draft returns system fallback | Evaluation results grid |
| Published returns HTTP 500 | Network capture |

The two captures are the load-bearing pair described on the
[capture analysis](../screenshots/analysis.md) page. Neither supports the conclusion alone.

## What the score does not measure

**It does not measure the evaluation set.** The six pairs are on [evaluation set](./evalset.md) and
are individually verifiable against `docs.ray.io`.

**It does not measure the knowledge configuration.** The Foundry IQ knowledge base `raybot-kb`
demonstrably works — Preview cites it.

**It does not measure the model.** Claude Sonnet 4.6 never received the questions.

**It measures the evaluation runtime**, and the runtime returned a fallback and a 500.

## Practical guidance

Before concluding an agent evaluated badly:

1. Run two or three of the same questions through **Preview**.
2. If Preview grounds and Evaluate does not, the harness is the problem.
3. Check whether the failures are uniform. Uniform failure at uniform speed points at a terminated
   path, not at knowledge gaps.
4. Check the published version separately from the draft. They fail differently, and the difference
   is diagnostic.

Step 1 costs about a minute and would have saved the time spent assuming the agent was broken.

## Reproducibility

Not reproducible from this repository. The run targeted a live agent in the Cypherdyne environment
under the `darbot@timelarp.com` identity, and both the agent and the evaluation runtime have changed
since 2026-06-07.

The record is preserved as an observation, not as a repeatable test. The
[constraints](../reference/constraints.md) and
[troubleshooting](../reference/troubleshooting.md) pages carry the transferable parts.
