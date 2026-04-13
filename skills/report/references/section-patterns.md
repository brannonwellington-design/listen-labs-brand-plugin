# Report Section Patterns

Pre-built HTML patterns for each report section. Copy and adapt from the skeleton — never build sections from scratch.

---

## 1. Cover

Full viewport height, vertically centered title block.

```html
<section class="cover">
  <div class="overline">Usability Study</div>
  <h1 class="title">Checkout Flow Evaluation</h1>
  <p class="subtitle">Understanding friction points in the three-step purchase experience across mobile and desktop.</p>
  <div class="meta">
    <span>March 2026</span>
    <span class="divider">&middot;</span>
    <span>Brannon Wellington</span>
    <span class="divider">&middot;</span>
    <span>12 Participants</span>
  </div>
</section>
```

**Rules:**
- Overline: study type or category (10px, disabled, Title Case)
- Title: the report name (48px, primary, Title Case)
- Subtitle: one sentence describing scope (16px, secondary, sentence case)
- Meta: date, author, participant count separated by middot dividers (12px, disabled)
- Update the branded header `<span class="ll-title">` to match the report title

---

## 2. Executive Summary

3-5 key findings presented as a numbered list with brief descriptions.

```html
<section class="section">
  <h2 class="section-heading">Executive Summary</h2>
  <p class="section-intro">We conducted moderated usability sessions with 12 participants to evaluate the redesigned checkout flow. These are the top findings.</p>

  <ol class="key-findings">
    <li>
      <span class="finding-number">Finding 1</span>
      Most participants completed checkout faster, but 4 of 12 missed the shipping options step entirely.
    </li>
    <li>
      <span class="finding-number">Finding 2</span>
      The payment form generated the highest frustration, particularly around address auto-fill behavior.
    </li>
    <li>
      <span class="finding-number">Finding 3</span>
      Mobile participants showed significantly more hesitation at the order summary screen.
    </li>
  </ol>
</section>
```

**Rules:**
- Section intro is the lead paragraph (18px, secondary) — one or two sentences of context
- Key findings list: numbered items with a small finding label (12px, disabled) above each summary
- Keep summaries to 1-2 sentences each — this is the TL;DR, not the full analysis
- 3 findings minimum, 5 maximum

---

## 3. Table of Contents

Optional for reports with 5+ sections. Simple linked list.

```html
<section class="section">
  <h2 class="section-heading">Contents</h2>
  <ol class="key-findings">
    <li><span class="finding-number">01</span> Executive Summary</li>
    <li><span class="finding-number">02</span> Background</li>
    <li><span class="finding-number">03</span> Methodology</li>
    <li><span class="finding-number">04</span> Findings</li>
    <li><span class="finding-number">05</span> Emotional Analysis</li>
    <li><span class="finding-number">06</span> Recommendations</li>
  </ol>
</section>
```

Reuses the `.key-findings` list pattern. Zero-padded numbers for clean alignment.

---

## 4. Background / Context

Why this research was done. Brief, contextual.

```html
<section class="section">
  <h2 class="section-heading">Background</h2>
  <p class="section-intro">The checkout flow was redesigned in Q4 2025 to reduce cart abandonment. This study evaluates whether the new design achieves its goals.</p>
  <p>The previous checkout flow had a 68% abandonment rate, with the majority of drop-offs occurring at the payment step. The redesigned flow consolidates five steps into three and introduces progressive disclosure for shipping and payment options.</p>
  <p>This research was commissioned by the Product team to validate the design before full rollout.</p>
</section>
```

**Rules:**
- Section intro (18px) provides the one-line answer
- Body paragraphs (16px, secondary) expand with detail
- Keep brief — 2-3 paragraphs maximum. The findings section is where depth belongs.

---

## 5. Methodology

How the research was conducted. Structured data.

```html
<section class="section">
  <h2 class="section-heading">Methodology</h2>
  <p class="section-intro">Moderated remote usability sessions with think-aloud protocol.</p>

  <table class="report-table">
    <tr><th>Detail</th><th>Value</th></tr>
    <tr><td>Participants</td><td>12 (6 mobile, 6 desktop)</td></tr>
    <tr><td>Duration</td><td>45 minutes per session</td></tr>
    <tr><td>Period</td><td>February 10–21, 2026</td></tr>
    <tr><td>Method</td><td>Moderated remote usability testing</td></tr>
    <tr><td>Tools</td><td>Listen Labs platform, Zoom</td></tr>
    <tr><td>Recruitment</td><td>Existing customers, age 25-54</td></tr>
  </table>
</section>
```

**Rules:**
- Use a two-column table for structured methodology data
- Section intro names the method in one line
- Keep this factual and scannable — methodology is reference material, not narrative

---

## 6. Findings (Individual Finding)

Each finding is a subsection with evidence. This is the core of the report.

```html
<div class="finding">
  <h3 class="finding-heading">Shipping Step Is Easily Overlooked</h3>
  <p>4 of 12 participants skipped the shipping options step without realizing they had defaulted to standard shipping. The progressive disclosure pattern collapsed shipping into a single line that read "Standard Shipping — Free" with no visible indicator that other options existed.</p>

  <div class="participant-quote">
    <div class="text">"I didn't even see that there was an express option. I would have picked that if I knew."</div>
    <div class="attribution">Participant 4, Mobile User</div>
  </div>

  <p>Participants who did expand the shipping options took an average of 8 additional seconds, but reported higher confidence in their choice.</p>

  <div class="stat-block">
    <div class="number">4 / 12</div>
    <div class="label">participants missed the shipping options entirely</div>
  </div>
</div>
```

**Rules:**
- Finding heading: a clear, declarative statement — not a question, not a topic label (24px, primary)
- Body text provides context and analysis (16px, secondary)
- Every finding must include at least one piece of evidence: a participant quote, a stat, or both
- Stat blocks appear once per finding maximum
- Order findings by importance, not by session order

---

## 7. Emotional Analysis

Dedicated section for emotion-coded data. Uses emotion callouts.

```html
<section class="section">
  <h2 class="section-heading">Emotional Analysis</h2>
  <p class="section-intro">Emotional responses across sessions, coded to the six core Ekman emotions.</p>

  <!-- Emotion distribution chart would go here -->
  <figure class="chart-container">
    <canvas id="emotion-chart" role="img" aria-label="Emotion distribution across 12 participants"></canvas>
    <figcaption class="chart-caption">Figure 1: Emotion distribution across all sessions (n=12)</figcaption>
  </figure>

  <div class="finding">
    <h3 class="finding-heading">Frustration Peaked at Payment Entry</h3>
    <p>Anger-coded moments clustered heavily around the payment form, particularly when auto-fill failed or address validation rejected entries.</p>

    <div class="emotion-callout anger">
      <div class="emotion-label">Anger</div>
      <div class="emotion-text">"Why won't it accept my address? I've typed it three times now."</div>
      <div class="emotion-attribution">Participant 9, Desktop User</div>
    </div>
  </div>

  <div class="finding">
    <h3 class="finding-heading">Delight at Order Confirmation</h3>
    <p>Happiness-coded moments concentrated at the confirmation screen, especially the delivery estimate and order summary animation.</p>

    <div class="emotion-callout happiness">
      <div class="emotion-label">Happiness</div>
      <div class="emotion-text">"Oh nice, it shows exactly when it's arriving. That's really helpful."</div>
      <div class="emotion-attribution">Participant 2, Mobile User</div>
    </div>
  </div>
</section>
```

**Rules:**
- Use emotion callouts only in this section (or when a finding is directly about emotional response)
- Always include the emotion label (10px, emotion primary color)
- Pair each callout with context explaining the emotional trigger
- If including an emotion distribution chart, use emotion token colors for the chart data series

---

## 8. Recommendations

What to do with the findings. Action-oriented.

```html
<section class="section">
  <h2 class="section-heading">Recommendations</h2>
  <p class="section-intro">Prioritized actions based on the findings above.</p>

  <div class="finding">
    <h3 class="finding-heading">Make Shipping Options Visible by Default</h3>
    <p>Expand the shipping options section by default rather than collapsing it. The progressive disclosure pattern saves space but costs discoverability. The 8-second interaction cost of viewing options is acceptable compared to the cost of missed upsell.</p>
  </div>

  <div class="finding">
    <h3 class="finding-heading">Improve Address Auto-Fill Error States</h3>
    <p>When address validation fails, provide specific inline guidance about what's wrong rather than a generic error banner. Consider accepting partially validated addresses with a confirmation prompt.</p>
  </div>
</section>
```

**Rules:**
- Each recommendation is a subsection with a declarative heading
- State what to do and why — connect back to specific findings
- Keep actionable — recommendations should be implementable decisions, not vague suggestions
- Order by priority (highest impact first)

---

## 9. Appendix

Raw data, full participant roster, complete quote log, or extended methodology detail.

```html
<section class="section">
  <h2 class="section-heading">Appendix</h2>

  <div class="finding">
    <h3 class="finding-heading">Participant Overview</h3>
    <table class="report-table">
      <tr><th>ID</th><th>Role</th><th>Device</th><th>Duration</th></tr>
      <tr><td>P1</td><td>Marketing Manager</td><td>Desktop</td><td>42 min</td></tr>
      <tr><td>P2</td><td>Product Manager</td><td>Mobile</td><td>38 min</td></tr>
      <tr><td>P3</td><td>Software Engineer</td><td>Desktop</td><td>47 min</td></tr>
    </table>
  </div>
</section>
```

**Rules:**
- Tables for structured data
- Use finding-heading (24px) for appendix subsections
- This is reference material — factual, no narrative needed
