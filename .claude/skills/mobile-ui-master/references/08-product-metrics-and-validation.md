# Product Metrics and Design Validation

## Purpose

Use this reference when a design decision should be framed as a product hypothesis and validated through evidence. Not every UI change needs an experiment, but consequential changes should have an explicit expected outcome and a way to detect harm.

## Design hypothesis

Use:

```text
If [experience change] for [user segment],
then [expected behavior] will increase/decrease because [observed reason].
Measure with [primary metric] and protect with [guardrail metrics].
```

Example from the source material:

```text
If onboarding is reduced to three steps and value is explained before permission,
completion should increase without reducing D7 retention.
```

## Non-negotiable rules

### MUST

- Define the metric denominator explicitly for conversion/funnel claims.
- Connect UI metrics to a user or business outcome rather than optimizing clicks in isolation.
- Choose a primary metric and relevant guardrails for consequential changes.
- Define event taxonomy, properties, segment, funnel, and source of truth before relying on analytics.
- Segment analysis where platform, locale, app version, cohort, or user maturity could hide meaningful differences.
- Combine qualitative and quantitative methods when both “why” and “how much” matter.
- Fix clear usability/accessibility failures directly rather than A/B testing whether harming users performs better.

### MUST NOT

- Treat DAU/MAU alone as proof of satisfaction or product value.
- Optimize time spent when longer time may represent confusion or task friction.
- Run an experiment with no valid activation/audience definition.
- Declare a winner from an average metric when major cohorts move in opposite directions without investigation.
- Add analytics events merely because a control is clickable; track decisions/outcomes that answer a product question.

## Metric selection

Common metrics from the source material:

- **Conversion rate:** completed target event / eligible users entering the flow.
- **Retention:** cohort returning and performing a meaningful behavior at D1/D7/D30 or a product-appropriate interval.
- **DAU/MAU:** repeat-use indicator, not direct proof of value/satisfaction.
- **Churn:** users who stop performing defined value behavior during a chosen interval.
- **Task success:** completion of a specific user task.
- **Time on task:** useful only when faster/slower has a clear interpretation.
- **Error rate:** mistakes, failed submissions, invalid states, or another defined failure.

## Validation decision framework

```text
Is this a clear usability, accessibility, or correctness defect?
├─ yes -> fix; do not A/B test the defect itself
└─ no
   ↓
Is the design decision based on an uncertain behavior/product hypothesis?
├─ no -> validate through review/usability checks as appropriate
└─ yes
   ↓
Can qualitative research explain the uncertainty efficiently?
├─ yes -> prototype/usability/interview first
└─ no / still uncertain
   ↓
Can a controlled quantitative experiment isolate the change safely?
├─ yes -> define experiment
└─ no -> use observational metrics/research and state the limitation
```

## Qualitative vs quantitative

### Qualitative

Use to understand *why* and *how to improve*:

- usability testing;
- interviews;
- field observation.

### Quantitative

Use to understand *how much* and *how broadly*:

- analytics;
- structured surveys;
- experiments.

User statements and observed behavior may differ; triangulate when important.

## Experiment readiness

Before A/B testing, define:

```text
Hypothesis:
Baseline:
Audience/segment:
Activation event:
Control:
Variant:
Primary metric:
Guardrails:
Known confounders:
Duration/sample rule:
Success condition:
Failure condition:
Decision after result:
```

Do not invent statistical certainty when the available evidence is insufficient.

## Business/user trade-off statement

A senior design recommendation should state:

- user benefit;
- business benefit;
- trade-offs in scope, engineering, time, risk, and UX debt;
- smallest viable version that can ship and teach something useful;
- success/failure conditions;
- what decision follows the result.

## Anti-patterns

- “increase engagement” with no defined behavior;
- event names with no source-of-truth or property definitions;
- measuring clicks on a CTA but not completion/error/cancel;
- optimizing onboarding completion while ignoring downstream retention/quality;
- interpreting longer session duration as automatically positive;
- A/B testing obvious accessibility defects;
- shipping multiple large changes in one experiment and attributing the result to one UI decision.

## Validation checklist

- [ ] Design hypothesis is explicit when uncertainty warrants it.
- [ ] Primary metric represents the intended outcome.
- [ ] Denominator/eligibility is defined.
- [ ] Guardrail metrics protect against obvious harm.
- [ ] Event taxonomy/source of truth is defined before release.
- [ ] Relevant cohorts/segments are considered.
- [ ] Qualitative vs quantitative method matches the question.
- [ ] Clear usability/accessibility defects are fixed rather than experimented on.
- [ ] Next decision is defined for success and failure.

## Expected agent output

When validation is relevant, return:

```text
Design hypothesis:
Evidence currently available:
Primary metric:
Metric denominator:
Guardrails:
Events/properties required:
Segments/cohorts:
Recommended research/experiment method:
Success/failure criteria:
Trade-offs:
Next product decision:
```

## Related references

- `01-mobile-ux-principles.md` for task outcomes.
- `09-design-leadership-and-dev-collaboration.md` for decision communication.
- `11-deliverable-and-review-protocol.md` for acceptance criteria.

## Sources

- [NN/G — When to use which UX research methods](https://www.nngroup.com/articles/which-ux-research-methods/)
- [Firebase — Create Remote Config A/B experiments](https://firebase.google.com/docs/ab-testing/abtest-config)
