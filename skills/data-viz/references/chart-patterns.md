# Chart.js Configuration Patterns

Reference configurations for Listen Labs branded charts. Copy and adapt these — never build chart configs from scratch.

---

## Palette Mode Swap

Every chart inherits its palette from the nearest ancestor with `data-dataviz-palette`. The skeleton sets `<main data-dataviz-palette="brand">` by default. To swap a chart from brand-blue to the brand-agnostic best-practices palette, change one attribute:

```html
<!-- Brand mode: monochromatic brand-blue (default, matches existing behavior) -->
<main data-dataviz-palette="brand">
  <figure><canvas id="chart" role="img" aria-label="..."></canvas></figure>
</main>

<!-- Global mode: Okabe-Ito categorical / Viridis sequential / RdBu diverging -->
<main data-dataviz-palette="global">
  <figure><canvas id="chart" role="img" aria-label="..."></canvas></figure>
</main>
```

Mixed modes on the same page: scope `data-dataviz-palette` tighter (e.g., on each `<figure>`) — every helper resolves against the canvas's nearest scoped ancestor.

### Helpers (mode-aware)

All return colors resolved from the chart's active palette mode. Pass the canvas element so the helper finds the right scope:

```javascript
var canvas = document.getElementById('chart');

dataVizSeries(n, canvas);      // n categorical colors (slots wrap past 8; warns past soft/hard caps)
dataVizSequential(n, canvas);  // n evenly-spaced sequential stops
dataVizDiverging(canvas);      // 7 stops: neg-3, neg-2, neg-1, zero, pos-1, pos-2, pos-3
dataVizHighlight(canvas);      // { accent, neutral: [grayDark, grayMid, grayLight] }
dataVizSemantic(canvas);       // { positive, negative, neutral }
```

Use `brandShades(n)` only for legacy charts; new charts should use `dataVizSeries(n)` so they're swap-capable.

---

## Bar Chart

```javascript
{
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [120, 190, 170, 210],
      backgroundColor: brandBlue,
      borderColor: brandBlue,
      borderWidth: 1,
      borderRadius: 2,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    barPercentage: 0.9,
    categoryPercentage: 0.85,
    plugins: {
      legend: { display: false },  // hide for single series
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: 400, size: 10 },
          color: contentSecondary,
          padding: 8,
        }
      },
      y: {
        grid: { color: contentDisabled, lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: 400, size: 10 },
          color: contentSecondary,
          padding: 8,
        }
      }
    }
  }
}
```

### Multi-Series Bar Chart

Use `dataVizSeries(n, canvas)` so the chart respects the active palette mode (brand → monochromatic blue; global → Okabe-Ito):

```javascript
var canvas = document.getElementById('chart');
var colors = dataVizSeries(3, canvas);
// brand mode  → ['hsl(229,100%,40%)', 'hsl(229,100%,60%)', 'hsl(229,100%,25%)']
// global mode → ['#0072B2', '#E69F00', '#009E73']

datasets: [
  {
    label: 'Series A',
    data: [10, 20, 30],
    backgroundColor: colors[0],
    borderColor: colors[0],
    borderWidth: 1,
    borderRadius: 2,
  },
  {
    label: 'Series B',
    data: [15, 25, 20],
    backgroundColor: colors[1],
    borderColor: colors[1],
    borderWidth: 1,
    borderRadius: 2,
  },
  {
    label: 'Series C',
    data: [8, 12, 18],
    backgroundColor: colors[2],
    borderColor: colors[2],
    borderWidth: 1,
    borderRadius: 2,
  }
]
```

---

## Line Chart

```javascript
{
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sessions',
      data: [300, 450, 420, 510, 480, 600],
      borderColor: brandBlue,
      borderWidth: 1,
      fill: false,
      pointRadius: 3,
      pointBackgroundColor: brandBlue,
      pointBorderColor: brandBlue,
      pointBorderWidth: 1,
      tension: 0,  // straight lines by default
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: 400, size: 10 },
          color: contentSecondary,
          padding: 8,
        }
      },
      y: {
        grid: { color: contentDisabled, lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: 400, size: 10 },
          color: contentSecondary,
          padding: 8,
        }
      }
    }
  }
}
```

### Multi-Series Line Chart

Multi-line charts must encode redundantly (color + dash + marker) per WCAG 1.4.1:

```javascript
var canvas = document.getElementById('chart');
var colors = dataVizSeries(2, canvas);

datasets: [
  {
    label: 'This Year',
    data: [300, 450, 420, 510],
    borderColor: colors[0],
    borderWidth: 1,
    fill: false,
    pointRadius: 3,
    pointStyle: 'circle',
    pointBackgroundColor: colors[0],
    pointBorderColor: colors[0],
    pointBorderWidth: 1,
    tension: 0,
  },
  {
    label: 'Last Year',
    data: [250, 380, 400, 460],
    borderColor: colors[1],
    borderWidth: 1,
    borderDash: [4, 4],         // dashed → distinguishable in grayscale and CVD
    fill: false,
    pointRadius: 3,
    pointStyle: 'triangle',     // distinct marker shape
    pointBackgroundColor: colors[1],
    pointBorderColor: colors[1],
    pointBorderWidth: 1,
    tension: 0,
  }
]
```

---

## Sequential (ordered / continuous data)

Use for ordered bins, ramps, or anything with intrinsic order (small → large, low → high). Brand mode renders a brand-blue ramp; global mode renders Viridis.

```javascript
var canvas = document.getElementById('chart');
var colors = dataVizSequential(5, canvas);  // 5 evenly-spaced stops

datasets: [{
  label: 'Engagement bin',
  data: [12, 28, 44, 61, 73],
  backgroundColor: colors,    // one stop per bar, ordered low → high
  borderColor: colors,
  borderWidth: 1,
  borderRadius: 2,
}]
```

---

## Diverging (data with a meaningful midpoint)

Use for data that is symmetric around zero (gain/loss, +/− deltas, sentiment). Brand mode = vermillion ↔ brand-blue; global mode = ColorBrewer RdBu. Both are CVD-safe.

```javascript
var canvas = document.getElementById('chart');
var stops = dataVizDiverging(canvas);
// stops = [neg-3, neg-2, neg-1, zero, pos-1, pos-2, pos-3]

// Map each datum to a stop based on its bucketed value vs. midpoint.
function divergingFor(v) {
  if (v <= -20) return stops[0];
  if (v <= -10) return stops[1];
  if (v <   0)  return stops[2];
  if (v ===  0) return stops[3];
  if (v <  10)  return stops[4];
  if (v <  20)  return stops[5];
  return stops[6];
}

var values = [-25, -12, -4, 0, 6, 14, 22];

datasets: [{
  label: 'Δ vs. baseline',
  data: values,
  backgroundColor: values.map(divergingFor),
  borderColor: values.map(divergingFor),
  borderWidth: 1,
  borderRadius: 2,
}]
```

---

## Highlight ("this vs. the rest")

Use when one series is the story and the others are context. The accent comes from the active palette (brand blue or Okabe-Ito blue); de-emphasized series step through neutral grays.

```javascript
var canvas = document.getElementById('chart');
var hl = dataVizHighlight(canvas);
// hl = { accent: '#0021CC' (brand) or '#0072B2' (global), neutral: ['#525252', '#8D8D8D', '#C6C6C6'] }

var focalIndex = 2;  // which series gets the accent

datasets: rawSeries.map(function(s, i) {
  var color = (i === focalIndex) ? hl.accent : hl.neutral[Math.min(i, 2)];
  return {
    label: s.label,
    data: s.data,
    backgroundColor: color,
    borderColor: color,
    borderWidth: 1,
    borderRadius: 2,
  };
});
```

---

## Semantic (positive / negative / neutral)

Use for status data: pass/fail, positive/negative deltas, KPI direction. Same hexes in both modes — these read universally.

```javascript
var canvas = document.getElementById('chart');
var sem = dataVizSemantic(canvas);

var values = [12, -8, 0, 22, -15];

datasets: [{
  label: 'KPI delta',
  data: values,
  backgroundColor: values.map(function(v){
    if (v > 0) return sem.positive;
    if (v < 0) return sem.negative;
    return sem.neutral;
  }),
  borderWidth: 1,
  borderRadius: 2,
}]
```

---

## Emotion Data Chart

Only use when data represents Ekman emotions. Read emotion tokens from CSS variables:

```javascript
var emotionColors = {
  anger:     style.getPropertyValue('--emotion-anger-primary').trim(),
  happiness: style.getPropertyValue('--emotion-happiness-primary').trim(),
  disgust:   style.getPropertyValue('--emotion-disgust-primary').trim(),
  surprise:  style.getPropertyValue('--emotion-surprise-primary').trim(),
  sadness:   style.getPropertyValue('--emotion-sadness-primary').trim(),
  fear:      style.getPropertyValue('--emotion-fear-primary').trim(),
};

datasets: [{
  label: 'Emotion Distribution',
  data: [25, 30, 10, 15, 12, 8],
  backgroundColor: [
    emotionColors.anger,
    emotionColors.happiness,
    emotionColors.disgust,
    emotionColors.surprise,
    emotionColors.sadness,
    emotionColors.fear,
  ],
  borderWidth: 1,
  borderRadius: 2,
}]
```

---

## Common Options

### Legend (when shown)

```javascript
legend: {
  display: true,
  position: 'bottom',
  labels: {
    font: { family: "'Inter', sans-serif", weight: 400, size: 12 },
    color: contentPrimary,
    padding: 16,
    boxWidth: 12,
    boxHeight: 12,
    useBorderRadius: true,
    borderRadius: 2,
  }
}
```

### Tooltip

```javascript
tooltip: {
  backgroundColor: contentPrimary,
  titleColor: contentSecondary,
  bodyFont: { family: "'Inter', sans-serif", weight: 400, size: 12 },
  titleFont: { family: "'Inter', sans-serif", weight: 400, size: 10 },
  padding: 12,
  cornerRadius: 4,
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  boxPadding: 4,
}
```

### When to Show/Hide Elements

| Element | Show | Hide |
|---------|------|------|
| Legend | Multi-series data | Single series |
| X-axis grid | Never by default | Always |
| Y-axis grid | Always | When chart is very simple |
| Axis borders | Never | Always |
| Tick marks | Never | Always |
| Data point dots (line) | Always (3px) | Never |
| Bar borders | Only for contrast | Default |

### Choosing a palette type

| Data shape | Helper | Why |
|---|---|---|
| Distinct categories, no order | `dataVizSeries(n)` | Categorical — discrete hues |
| Ordered / continuous (low → high) | `dataVizSequential(n)` | Sequential — single ramp |
| Symmetric around a midpoint (+/−) | `dataVizDiverging()` | Diverging — two ramps |
| One focal series + context | `dataVizHighlight()` | Spotlight — accent + grays |
| Pass/fail, positive/negative status | `dataVizSemantic()` | Universal status colors |
| The 6 Ekman emotions | `--emotion-*` tokens | Reserved; orthogonal to brand/global |
