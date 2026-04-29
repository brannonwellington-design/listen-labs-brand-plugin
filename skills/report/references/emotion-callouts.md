# Emotion Callouts

Emotion-coded content blocks for Listen Labs reports. These patterns are used EXCLUSIVELY when research findings reference one of the six core Ekman emotions. Never use emotion colors for general-purpose highlighting, categories, or decoration.

---

## The Six Emotions and Their Tokens

| Emotion | Primary | Secondary (10% bg) | When to Use |
|---------|---------|---------------------|-------------|
| Anger | `--emotion-anger-primary` (`#BF4040`) | `--emotion-anger-secondary` | Frustration, irritation, rage expressed toward the product or experience |
| Happiness | `--emotion-happiness-primary` (`#D99E26`) | `--emotion-happiness-secondary` | Joy, delight, satisfaction, pleasant surprise with the experience |
| Disgust | `--emotion-disgust-primary` (`#80BF40`) | `--emotion-disgust-secondary` | Aversion, rejection, strong negative aesthetic or moral reaction |
| Surprise | `--emotion-surprise-primary` (`#40BFAA`) | `--emotion-surprise-secondary` | Unexpected moments — positive or negative, astonishment, disbelief |
| Sadness | `--emotion-sadness-primary` (`#406ABF`) | `--emotion-sadness-secondary` | Disappointment, loss, unmet expectations, resignation |
| Fear | `--emotion-fear-primary` (`#9540BF`) | `--emotion-fear-secondary` | Anxiety, uncertainty, worry about consequences, hesitation from risk |

---

## Callout Pattern

Every emotion callout follows the same structure: colored left border + tinted background + emotion label + quote + attribution.

### HTML

```html
<div class="emotion-callout [emotion-name]">
  <div class="emotion-label">[Emotion Name]</div>
  <div class="emotion-text">"Participant quote expressing this emotion."</div>
  <div class="emotion-attribution">Participant ID, Role</div>
</div>
```

Replace `[emotion-name]` with one of: `anger`, `happiness`, `disgust`, `surprise`, `sadness`, `fear`.

### CSS (included in skeleton)

```css
.emotion-callout {
  margin: 24px 0;
  padding: 20px 24px;
  border-radius: 8px;
  max-width: 720px;
}
.emotion-callout .emotion-label {
  font-size: 10px;
  line-height: 16px;
  margin-bottom: 8px;
}
.emotion-callout .emotion-text {
  font-size: 16px;
  line-height: 24px;
  color: var(--content-primary);
}
.emotion-callout .emotion-attribution {
  font-size: 12px;
  line-height: 16px;
  color: var(--content-disabled);
  margin-top: 8px;
}

/* ── Per-emotion styles ─────────────────────────────── */
.emotion-callout.anger {
  background: var(--emotion-anger-secondary);
  border-left: 2px solid var(--emotion-anger-primary);
}
.emotion-callout.anger .emotion-label {
  color: var(--emotion-anger-primary);
}

.emotion-callout.happiness {
  background: var(--emotion-happiness-secondary);
  border-left: 2px solid var(--emotion-happiness-primary);
}
.emotion-callout.happiness .emotion-label {
  color: var(--emotion-happiness-primary);
}

.emotion-callout.disgust {
  background: var(--emotion-disgust-secondary);
  border-left: 2px solid var(--emotion-disgust-primary);
}
.emotion-callout.disgust .emotion-label {
  color: var(--emotion-disgust-primary);
}

.emotion-callout.surprise {
  background: var(--emotion-surprise-secondary);
  border-left: 2px solid var(--emotion-surprise-primary);
}
.emotion-callout.surprise .emotion-label {
  color: var(--emotion-surprise-primary);
}

.emotion-callout.sadness {
  background: var(--emotion-sadness-secondary);
  border-left: 2px solid var(--emotion-sadness-primary);
}
.emotion-callout.sadness .emotion-label {
  color: var(--emotion-sadness-primary);
}

.emotion-callout.fear {
  background: var(--emotion-fear-secondary);
  border-left: 2px solid var(--emotion-fear-primary);
}
.emotion-callout.fear .emotion-label {
  color: var(--emotion-fear-primary);
}
```

---

## Examples

### Anger
```html
<div class="emotion-callout anger">
  <div class="emotion-label">Anger</div>
  <div class="emotion-text">"Why won't it accept my address? I've typed it three times now and it keeps rejecting it."</div>
  <div class="emotion-attribution">Participant 9, Desktop User</div>
</div>
```

### Happiness
```html
<div class="emotion-callout happiness">
  <div class="emotion-label">Happiness</div>
  <div class="emotion-text">"Oh this is really nice. I love that it remembers my preferences from last time."</div>
  <div class="emotion-attribution">Participant 2, Mobile User</div>
</div>
```

### Disgust
```html
<div class="emotion-callout disgust">
  <div class="emotion-label">Disgust</div>
  <div class="emotion-text">"This interface feels really cluttered and cheap. I wouldn't trust putting my card details in here."</div>
  <div class="emotion-attribution">Participant 11, Desktop User</div>
</div>
```

### Surprise
```html
<div class="emotion-callout surprise">
  <div class="emotion-label">Surprise</div>
  <div class="emotion-text">"Wait, it already filled in my shipping info? I didn't expect that. That's actually really fast."</div>
  <div class="emotion-attribution">Participant 3, Mobile User</div>
</div>
```

### Sadness
```html
<div class="emotion-callout sadness">
  <div class="emotion-label">Sadness</div>
  <div class="emotion-text">"I was hoping there'd be a way to save this for later. I guess I'll just have to start over next time."</div>
  <div class="emotion-attribution">Participant 6, Mobile User</div>
</div>
```

### Fear
```html
<div class="emotion-callout fear">
  <div class="emotion-label">Fear</div>
  <div class="emotion-text">"I'm not sure if I should click this. What if it charges me twice? There's no confirmation step."</div>
  <div class="emotion-attribution">Participant 8, Desktop User</div>
</div>
```

---

## Emotion Chart Pattern

When visualizing emotion distribution across a study, use emotion primary colors for chart data series. This is the ONE exception to the monochromatic brand-blue rule in `/data-viz`.

```javascript
var emotionColors = {
  anger:     style.getPropertyValue('--emotion-anger-primary').trim(),
  happiness: style.getPropertyValue('--emotion-happiness-primary').trim(),
  disgust:   style.getPropertyValue('--emotion-disgust-primary').trim(),
  surprise:  style.getPropertyValue('--emotion-surprise-primary').trim(),
  sadness:   style.getPropertyValue('--emotion-sadness-primary').trim(),
  fear:      style.getPropertyValue('--emotion-fear-primary').trim(),
};

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Anger', 'Happiness', 'Disgust', 'Surprise', 'Sadness', 'Fear'],
    datasets: [{
      data: [18, 32, 5, 22, 14, 9],
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
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif", weight: 400, size: 10 }, color: contentSecondary, padding: 8 }
      },
      y: {
        grid: { color: contentDisabled, lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif", weight: 400, size: 10 }, color: contentSecondary, padding: 8 }
      }
    }
  }
});
```

---

## Rules

1. **Emotion callouts are ONLY for the 6 Ekman emotions.** Never use them for general highlighting, positive/negative sentiment, or status indicators.
2. **One emotion per callout.** If a quote expresses multiple emotions, choose the dominant one.
3. **Always include the emotion label.** The label (10px, emotion primary color) makes the coding explicit.
4. **Always include attribution.** Participant ID and role at minimum.
5. **Quote text uses `content-primary`** — the quote is the important content. The emotion color appears only on the label and the left border/background.
6. **Emotion callouts appear within findings**, not as standalone elements. They are evidence supporting a narrative point.
7. **The Emotional Analysis section** is the primary home for emotion callouts, but they can appear in individual findings if the finding is directly about an emotional response.
8. **Emotion charts use emotion token colors** — this is the only context where chart data series use non-brand-blue colors.
