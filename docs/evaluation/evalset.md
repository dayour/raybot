---
id: evalset
title: Evaluation set
sidebar_label: Evaluation set
---

# Evaluation set

The six Ray question-and-answer pairs in `raybot-evalset.csv`, the CSV contract they satisfy, and how
to author a replacement.

## The CSV contract

```text
conversationNumber,question,response
```

| Column | Meaning |
| --- | --- |
| `conversationNumber` | Groups rows into conversations. All six rows use `1`. |
| `question` | The user turn |
| `response` | The expected agent turn, used as the reference |

All values are quoted. Quoting is not optional here — every one of the six responses contains commas,
and several contain colons and parentheses.

| Limit | Value |
| --- | --- |
| Maximum file size | 5 MB |
| Q-A pairs per conversation | 6 |
| `Reference` field maximum | 1,000 characters |

The 6-pair ceiling is **per conversation**, not per test set. `raybot-evalset.csv` uses one
conversation with six pairs, which is the maximum a single conversation holds. A larger set requires
incrementing `conversationNumber`.

## The six pairs

### 1. Minimal RayCluster on Kubernetes

**Question.** How do I create a minimal RayCluster on Kubernetes with KubeRay? Show a manifest.

**Expected response.** Install the KubeRay operator (`helm install kuberay-operator`), then apply a
`RayCluster` CR with `apiVersion ray.io/v1`, a `headGroupSpec` (`rayStartParams` with
`dashboard-host 0.0.0.0` and a `ray-head` container using a `rayproject/ray` image) and one
`workerGroupSpecs` entry with `replicas`. Apply with `kubectl apply -f` and reach the dashboard via
`kubectl port-forward` to port 8265.

### 2. Autoscaling a RayCluster

**Question.** How do I enable autoscaling on a KubeRay RayCluster?

**Expected response.** Set `enableInTreeAutoscaling: true` in the `RayCluster` spec and configure
`autoscalerOptions`. Define `minReplicas` and `maxReplicas` on each `workerGroupSpec`. The Ray
autoscaler adds or removes worker pods based on pending tasks, actors, and placement group resource
demands.

### 3. Placement groups, PACK and SPREAD

**Question.** What is a Ray placement group and what do the PACK and SPREAD strategies do?

**Expected response.** A placement group atomically reserves bundles of resources across nodes (gang
scheduling). PACK packs bundles onto as few nodes as possible for locality; SPREAD distributes bundles
across distinct nodes. STRICT_PACK and STRICT_SPREAD enforce single-node or one-bundle-per-node
placement. Create with `ray.util.placement_group` and schedule via
`PlacementGroupSchedulingStrategy`.

### 4. Object spilling

**Question.** Explain Ray object spilling and how to configure the spill directory and threshold.

**Expected response.** Ray spills objects from the in-memory Plasma store to disk when it fills,
restoring them transparently on access. Set the directory with `object_spilling_directory` in
`ray.init` or `--object-spilling-directory` on `ray start`. Tune the proactive
`object_spilling_threshold` (default 0.8) and `local_fs_capacity_threshold` (default 0.95).

### 5. Tasks versus actors

**Question.** What is the difference between a Ray task and a Ray actor?

**Expected response.** A task is a stateless function decorated with `@ray.remote` that runs once and
returns an object reference. An actor is a stateful class decorated with `@ray.remote`; Ray creates a
long-lived worker process whose methods run sequentially, preserving instance state across calls. Use
tasks for stateless parallel work and actors for stateful services.

### 6. RayJob versus RayService versus RayCluster

**Question.** When should I use RayJob versus RayService versus RayCluster in KubeRay?

**Expected response.** `RayCluster` provisions a standalone Ray cluster. `RayJob` creates a cluster,
runs a batch job to completion, and can tear the cluster down after. `RayService` manages a Ray Serve
deployment for online inference with zero-downtime upgrades and health-based restarts. Use
`RayCluster` for interactive clusters, `RayJob` for batch, and `RayService` for serving.

## Why these six

They were chosen to span the spectrum an agent grounded on `docs.ray.io` should cover, rather than to
be uniformly easy or uniformly hard.

| Pair | Type | What it tests |
| --- | --- | --- |
| 1 | Procedural with artifact | Can it produce a working manifest, not just describe one |
| 2 | Configuration | Does it name the exact fields |
| 3 | Conceptual with enumeration | Does it get all four strategies, not just the two asked about |
| 4 | Operational with defaults | Does it recall numeric defaults (0.8, 0.95) |
| 5 | Comparative | Can it draw a clean distinction |
| 6 | Decision guidance | Can it map three CRDs to three situations |

Three properties make them good reference answers:

**Verifiable.** Every claim is checkable against `docs.ray.io`. None depends on opinion.

**Specific.** They contain exact identifiers — `enableInTreeAutoscaling`, `object_spilling_threshold`,
`STRICT_SPREAD`, port 8265. A response that paraphrases correctly but omits the identifiers is
distinguishable from one that does not.

**Bounded.** Each fits inside the 1,000-character reference limit without truncation. Pair 1 is the
longest and still has headroom.

## Authoring a replacement set

**Keep answers under 1,000 characters.** The limit is enforced on the reference field. A truncated
reference silently degrades scoring, because the grader compares against the truncated text.

**Quote every field.** Commas in prose will otherwise split columns. This is the most common way a
hand-authored eval CSV breaks.

**Use one conversation per six pairs.** Increment `conversationNumber` past six. Rows sharing a
number are treated as one multi-turn conversation, which changes how context carries between them.

**Prefer answers containing exact identifiers.** They make grading discriminative. "Configure the
autoscaler" and "set `enableInTreeAutoscaling: true`" are both correct, but only the second
distinguishes a grounded answer from a plausible one.

**Write answers you can verify against the knowledge source.** A reference answer the agent could not
possibly derive from `docs.ray.io` tests nothing about the agent.

## Alternatives to authoring by hand

| Source | Behaviour |
| --- | --- |
| Upload CSV | This approach. Maximum 5 MB. |
| Quick conversation set | Auto-generates 10 from the agent's description, instructions, and topics |
| Write your own | In-product conversation editor |

The quick conversation set is faster but generates questions **from the agent's own configuration**,
which makes it a consistency check rather than a knowledge test. It cannot surface a gap the agent's
instructions do not already imply.

## The result

This set scored **0 percent, 6 of 6 Fail**.

That says nothing about the set. The evaluation runtime returned the system fallback for the draft
agent and HTTP 500 for the published one, so none of the six questions reached the agent's knowledge
configuration at all. See [results](./results.md).
