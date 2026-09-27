(() => {
  const canvas = document.getElementById('headerInstallationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 940;
  const H = 132;
  const ground = 119;
  const barXs = [70, 170, 270, 370, 470, 570, 670, 770, 870];
  const cycle = 68;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, t) => a + (b - a) * t;

  function line(a, b, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.stroke();
  }

  function wall() {
    const night = document.documentElement.dataset.seoulNight === 'true';
    ctx.fillStyle = night ? '#101d30' : '#fbfbfa';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = night ? '#172840' : '#f0f0ee';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 70) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
    }
    for (let j = 18; j < H; j += 34) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
    }
    ctx.fillStyle = night ? '#162338' : '#e7e5e0';
    ctx.fillRect(0, ground, W, H - ground);
  }

  function fixedBar(px) {
    ctx.fillStyle = '#3f464b';
    ctx.fillRect(px - 4, 19, 8, 100);
    ctx.fillStyle = '#758087';
    for (let y = 29; y < 111; y += 21) ctx.fillRect(px - 1, y, 2, 7);
  }

  function panel(i, row) {
    const l = barXs[i];
    const r = barXs[i + 1];
    const t = row ? 19 : 69;
    const b = t + 50;
    ctx.fillStyle = '#fafafa';
    ctx.strokeStyle = '#c9cccf';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(l, t, r - l, b - t, 3); ctx.fill(); ctx.stroke();
    for (let q = 1; q < 4; q += 1) line([l + (r - l) * q / 4, t], [l + (r - l) * q / 4, b], 1, '#e1e3e4');
    line([l, (t + b) / 2], [r, (t + b) / 2], 1, '#e1e3e4');
  }

  function looseBar(px, py) {
    ctx.fillStyle = '#3f464b';
    ctx.fillRect(px - 4, py - 48, 8, 96);
  }

  function loosePanel(px, py, angle = 0, press = 1) {
    ctx.save();
    ctx.translate(px, py); ctx.rotate(angle); ctx.scale(press, 1);
    ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#c9cccf'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-50, -25, 100, 50, 3); ctx.fill(); ctx.stroke();
    for (let q = 1; q < 4; q += 1) line([-50 + 25 * q, -25], [-50 + 25 * q, 25], 1, '#e1e3e4');
    line([-50, 0], [50, 0], 1, '#e1e3e4');
    ctx.restore();
  }

  function worker(px, pose, walk, withDrill) {
    const bob = pose === 'walk' ? Math.sin(walk * Math.PI * 2) * 2 : 0;
    const cy = ground - 41 + bob;
    const swing = pose === 'walk' ? Math.sin(walk * Math.PI * 2) * 7 : 0;
    line([px - 5, cy + 21], [px - 7 - swing, ground - 7], 8, '#24558a');
    line([px + 5, cy + 21], [px + 7 + swing, ground - 7], 8, '#24558a');
    line([px - 11 - swing, ground - 5], [px - 2 - swing, ground - 5], 6, '#30343a');
    line([px + 3 + swing, ground - 5], [px + 13 + swing, ground - 5], 6, '#30343a');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(px - 13, cy - 3, 26, 28, 8); ctx.fill();
    ctx.fillStyle = '#285b91'; ctx.beginPath(); ctx.roundRect(px - 11, cy + 4, 22, 23, 5); ctx.fill();
    line([px - 8, cy + 4], [px - 5, cy - 8], 3, '#285b91');
    line([px + 8, cy + 4], [px + 5, cy - 8], 3, '#285b91');
    ctx.fillStyle = '#f3b27e'; ctx.beginPath(); ctx.arc(px, cy - 15, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#402c24'; ctx.beginPath(); ctx.arc(px + 4, cy - 16, 1.4, 0, Math.PI * 2); ctx.fill();
    let lh = [px + 16, cy + 7]; let rh = [px + 18, cy + 13];
    if (pose === 'carryBar') { lh = [px + 21, cy - 2]; rh = [px + 22, cy + 17]; }
    if (pose === 'placeBar') { lh = [px + 25, cy - 5]; rh = [px + 25, cy + 17]; }
    if (pose === 'drillTop') { lh = [px + 22, cy + 9]; rh = [px + 28, cy - 5]; }
    if (pose === 'drillLow') { lh = [px + 21, cy + 3]; rh = [px + 28, cy + 18]; }
    if (pose === 'carryPanel') { lh = [px + 23, cy + 5]; rh = [px + 21, cy + 20]; }
    if (pose === 'pressPanel') { lh = [px + 24, cy + 1]; rh = [px + 24, cy + 17]; }
    line([px - 9, cy - 1], lh, 7, '#f3b27e'); line([px + 9, cy], rh, 7, '#f3b27e');
    ctx.fillStyle = '#f3b27e';
    [lh, rh].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill(); });
    if (withDrill) {
      ctx.fillStyle = '#e6a300'; ctx.fillRect(rh[0] - 1, rh[1] - 5, 12, 8);
      ctx.fillStyle = '#333'; ctx.fillRect(rh[0] + 10, rh[1] - 2, 10, 3); ctx.fillRect(rh[0] + 1, rh[1] + 2, 4, 9);
    }
  }

  function render(ms) {
    const t = (ms / 1000) % cycle;
    wall();
    let bars = 0; let panels = 0; let wx = -35; let pose = 'walk'; let obj = null;
    let target = null; let targetBay = null; let targetRow = 0; let panelAngle = 0; let panelPress = 1;
    const walk = t * 2;
    if (t < 1.5) { wx = -35; pose = 'idle'; }
    else if (t < 28.5) {
      const z = t - 1.5; const i = Math.min(8, Math.floor(z / 3)); const u = (z - i * 3) / 3;
      bars = i; const from = i ? barXs[i - 1] - 31 : -35; const to = barXs[i] - 31;
      if (u < .28) { wx = lerp(from, to, ease(u / .28)); pose = 'walk'; obj = 'bar'; }
      else if (u < .48) { wx = to; pose = 'carryBar'; obj = 'bar'; }
      else if (u < .65) { wx = to; pose = 'placeBar'; obj = 'bar'; target = barXs[i]; }
      else if (u < .80) { wx = to; pose = 'drillTop'; obj = 'drill'; target = barXs[i]; }
      else if (u < .95) { wx = to; pose = 'drillLow'; obj = 'drill'; target = barXs[i]; }
      else { wx = to; pose = 'idle'; bars = i + 1; }
    } else if (t < 31) { bars = 9; wx = lerp(barXs[8] - 31, barXs[0] - 42, ease((t - 28.5) / 2.5)); pose = 'walk'; }
    else if (t < 66) {
      bars = 9;
      const z = t - 31; const i = Math.min(15, Math.floor(z / 2.18)); const u = (z - i * 2.18) / 2.18;
      panels = i; const bay = Math.floor(i / 2); const row = i % 2;
      const from = i ? barXs[Math.floor((i - 1) / 2)] - 25 : barXs[0] - 42;
      const to = (barXs[bay] + barXs[bay + 1]) / 2 - 19;
      targetBay = bay; targetRow = row;
      if (u < .25) { wx = lerp(from, to, ease(u / .25)); pose = 'walk'; obj = 'panel'; }
      else if (u < .43) { wx = to; pose = 'carryPanel'; obj = 'panel'; panelAngle = .09; }
      else if (u < .60) { wx = to; pose = 'pressPanel'; obj = 'panel'; panelAngle = lerp(.09, -.05, ease((u - .43) / .17)); panelPress = .96; }
      else if (u < .80) { wx = to; pose = 'pressPanel'; obj = 'panel'; panelAngle = lerp(-.05, 0, ease((u - .60) / .20)); panelPress = lerp(.96, 1, ease((u - .60) / .20)); }
      else { wx = to; pose = 'idle'; panels = i + 1; }
    } else { bars = 9; panels = 16; wx = barXs[8] + 25; pose = 'idle'; }

    for (let i = 0; i < bars; i += 1) fixedBar(barXs[i]);
    if (obj === 'drill' && target !== null) fixedBar(target);
    for (let i = 0; i < panels; i += 1) panel(Math.floor(i / 2), i % 2);
    const actorCy = ground - 41 + (pose === 'walk' ? Math.sin(walk * Math.PI * 2) * 2 : 0);
    if (obj === 'bar') looseBar(target ?? wx + 26, target !== null ? 67 : actorCy + 7);
    if (obj === 'panel') {
      const attached = targetBay !== null && pose === 'pressPanel';
      const px = attached ? (barXs[targetBay] + barXs[targetBay + 1]) / 2 : wx + 45;
      const py = attached ? (targetRow ? 44 : 94) : actorCy + 12;
      loosePanel(px, py, panelAngle, panelPress);
    }
    worker(wx, pose, walk, obj === 'drill');
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
