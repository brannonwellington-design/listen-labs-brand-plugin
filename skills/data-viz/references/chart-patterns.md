# Chart.js Configuration Patterns

Reference configurations for Listen Labs branded charts. Copy and adapt these — never build chart configs from scratch.

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

For multiple data series, use monochromatic brand shades:

```javascript
var colors = brandShades(3);
// colors = ['hsl(229, 100%, 42.5%)', 'hsl(229, 100%, 55%)', 'hsl(229, 100%, 67.5%)']

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

```javascript
var colors = brandShades(2);

datasets: [
  {
    label: 'This Year',
    data: [300, 450, 420, 510],
    borderColor: colors[0],
    borderWidth: 1,
    fill: false,
    pointRadius: 3,
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
    fill: false,
    pointRadius: 3,
    pointBackgroundColor: colors[1],
    pointBorderColor: colors[1],
    pointBorderWidth: 1,
    tension: 0,
  }
]
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
