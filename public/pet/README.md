Default desktop pet assets:

```text
public/pet/kaoyan-pet-exact.png
public/pet/kaoyan-pet-front.png
public/pet/kaoyan-pet-side.png
public/pet/kaoyan-pet-back.png
public/pet/reference/kaoyan-bear-reference.png
public/pet/reference/kaoyan-bear-turnaround.png
public/pet/moods/pretend-angry.jpg
public/pet/moods/happy.jpg
public/pet/moods/lazy.jpg
public/pet/moods/excited.jpg
public/pet/moods/thinking-study.png
public/pet/moods/nose-picking.png
public/pet/moods/cheer.jpg
public/pet/moods/satisfied.png
public/pet/moods/angry.png
```

The app uses the three turnaround sprites from the provided bear artwork:
`/pet/kaoyan-pet-front.png` for idle/down, `/pet/kaoyan-pet-side.png` for
left/right drag, and `/pet/kaoyan-pet-back.png` for upward/back-facing drag.
The reference images are kept for visual traceability.

The mood images are processed in the browser with a canvas flood fill that only
removes near-white background pixels connected to the image edge. This preserves
the white bear body while cutting away rectangular JPG backgrounds.
