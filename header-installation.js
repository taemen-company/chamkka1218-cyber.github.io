(() => {
  const canvas = document.getElementById('headerInstallationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 940;
  const H = 132;
  const ground = 120;
  const barXs = [72, 186, 300, 414, 528, 642, 756, 870];
  const cycle = 32;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = (value) => {
    const v = clamp(value);
    return v * v * (3 - 2 * v);
  };
  const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
  const lerp = (start, end, progress) => start + (end - start) * progress;

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function line(x1, y1, x2, y2, width, color, cap = 'round') {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = cap;
    ctx.stroke();
  }

  function drawWall() {
    const night = document.documentElement.dataset.seoulNight === 'true';
    const background = ctx.createLinearGradient(0, 0, 0, H);
    background.addColorStop(0, night ? '#101d30' : '#fdfdfc');
    background.addColorStop(1, night ? '#14243a' : '#f5f6f6');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);

    const gridColor = night ? 'rgba(136,166,198,.12)' : 'rgba(128,143,154,.13)';
    for (let x = 16; x < W; x += 46) line(x, 8, x, ground, 1, gridColor, 'butt');
    for (let y = 18; y < ground; y += 32) line(0, y, W, y, 1, gridColor, 'butt');

    const floor = ctx.createLinearGradient(0, ground - 4, 0, H);
    floor.addColorStop(0, night ? '#1a2a41' : '#e4e6e5');
    floor.addColorStop(1, night ? '#101d30' : '#f2f3f2');
    ctx.fillStyle = floor;
    ctx.fillRect(0, ground, W, H - ground);
    line(0, ground, W, ground, 2, night ? 'rgba(210,225,240,.1)' : 'rgba(89,101,110,.2)', 'butt');
  }

  function drawBar(x, progress = 1) {
    const amount = easeOut(progress);
    const y = 17 + (1 - amount) * 10;
    const height = 103 * amount;
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,38,.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    const metal = ctx.createLinearGradient(x - 5, 0, x + 5, 0);
    metal.addColorStop(0, '#242a2f');
    metal.addColorStop(.42, '#758189');
    metal.addColorStop(.58, '#30383e');
    metal.addColorStop(1, '#181d21');
    ctx.fillStyle = metal;
    roundedRect(x - 5, y, 10, height, 2);
    ctx.fill();
    ctx.restore();
    if (amount > .88) {
      ctx.fillStyle = '#b6c0c6';
      [31, 55, 80, 105].forEach((holeY) => {
        ctx.beginPath();
        ctx.arc(x, holeY, 1.7, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function drawPanel(bay, row, progress = 1, xOffset = 0, angle = 0) {
    const night = document.documentElement.dataset.seoulNight === 'true';
    const left = barXs[bay];
    const right = barXs[bay + 1];
    const centerX = (left + right) / 2 + xOffset;
    const centerY = row === 0 ? 42 : 91;
    const width = right - left + 2;
    const height = 50;
    const amount = clamp(progress);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.scale(.9 + .1 * easeOut(amount), 1);
    ctx.globalAlpha *= clamp(amount * 1.8);
    ctx.shadowColor = night ? 'rgba(0,0,0,.35)' : 'rgba(45,58,68,.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    const face = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    face.addColorStop(0, night ? '#eff4f7' : '#ffffff');
    face.addColorStop(.62, night ? '#e3eaee' : '#f9faf9');
    face.addColorStop(1, night ? '#cbd5dc' : '#eceeed');
    ctx.fillStyle = face;
    ctx.strokeStyle = night ? '#93a3af' : '#c8ced2';
    ctx.lineWidth = 1.6;
    roundedRect(-width / 2, -height / 2, width, height, 4);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    const seam = night ? '#cbd5db' : '#e2e5e6';
    for (let column = 1; column < 4; column += 1) {
      line(-width / 2 + width * column / 4, -height / 2 + 2, -width / 2 + width * column / 4, height / 2 - 2, 1, seam, 'butt');
    }
    line(-width / 2 + 2, 0, width / 2 - 2, 0, 1, seam, 'butt');
    ctx.fillStyle = night ? 'rgba(91,110,122,.2)' : 'rgba(165,175,181,.17)';
    for (let rowDirection = -1; rowDirection <= 1; rowDirection += 2) {
      for (let column = 0; column < 4; column += 1) {
        ctx.beginPath();
        ctx.ellipse(-width * .375 + column * width * .25, rowDirection * 11, 5.4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawShadow(x, scale = 1) {
    ctx.save();
    ctx.globalAlpha *= .18;
    ctx.fillStyle = '#20272c';
    ctx.beginPath();
    ctx.ellipse(x, ground + 1, 22 * scale, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWorkerBase(x, pose, phase, uniform = 'blue') {
    const walking = pose === 'walk';
    const bob = walking ? Math.sin(phase * Math.PI * 2) * 2.2 : 0;
    const swing = walking ? Math.sin(phase * Math.PI * 2) * 7 : 0;
    const centerY = ground - 42 + bob;
    const colors = uniform === 'green'
      ? { dark: '#315d45', middle: '#4f8363', light: '#6b9a78', strap: '#427054' }
      : { dark: '#204b76', middle: '#326a9d', light: '#417cac', strap: '#285d8f' };

    drawShadow(x, walking ? 1.05 : .9);
    line(x - 5, centerY + 22, x - 8 - swing, ground - 7, 8, colors.dark);
    line(x + 5, centerY + 22, x + 8 + swing, ground - 7, 8, colors.middle);
    line(x - 12 - swing, ground - 5, x - 2 - swing, ground - 5, 6, '#2b3035');
    line(x + 3 + swing, ground - 5, x + 14 + swing, ground - 5, 6, '#2b3035');

    ctx.fillStyle = '#fff';
    roundedRect(x - 14, centerY - 3, 28, 29, 9);
    ctx.fill();
    const overalls = ctx.createLinearGradient(x - 11, 0, x + 11, 0);
    overalls.addColorStop(0, colors.dark);
    overalls.addColorStop(.55, colors.light);
    overalls.addColorStop(1, colors.dark);
    ctx.fillStyle = overalls;
    roundedRect(x - 11, centerY + 5, 22, 23, 5);
    ctx.fill();
    line(x - 8, centerY + 5, x - 5, centerY - 8, 3.5, colors.strap);
    line(x + 8, centerY + 5, x + 5, centerY - 8, 3.5, colors.strap);
    ctx.fillStyle = '#d59a4a';
    roundedRect(x + 3, centerY + 13, 5, 5, 1);
    ctx.fill();

    ctx.fillStyle = '#f1ad78';
    ctx.beginPath();
    ctx.arc(x, centerY - 15, 12.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef9862';
    ctx.beginPath(); ctx.arc(x - 12, centerY - 14, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 12, centerY - 14, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#352923';
    ctx.beginPath(); ctx.arc(x + 4, centerY - 16, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7e4835';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x + 2, centerY - 12, 4.5, .35, 2.4); ctx.stroke();
    return { centerY };
  }

  function drawArmsAndObject(x, pose, worker, object) {
    const centerY = worker.centerY;
    let leftHand = [x + 16, centerY + 8];
    let rightHand = [x + 18, centerY + 15];
    if (pose === 'alignBar') { leftHand = [x + 26, centerY - 4]; rightHand = [x + 26, centerY + 17]; }
    if (pose === 'drillHigh') { leftHand = [x + 20, centerY + 9]; rightHand = [x + 29, centerY - 5]; }
    if (pose === 'drillLow') { leftHand = [x + 20, centerY + 4]; rightHand = [x + 29, centerY + 18]; }
    if (pose === 'carryPanel') { leftHand = [x + 25, centerY + 3]; rightHand = [x + 25, centerY + 20]; }
    if (pose === 'pressPanel') { leftHand = [x + 26, centerY + 1]; rightHand = [x + 26, centerY + 18]; }

    if (object?.type === 'bar') drawBar(object.x, object.progress);
    if (object?.type === 'panel') drawPanel(object.bay, object.row, object.progress, object.xOffset, object.angle);

    line(x - 9, centerY, leftHand[0], leftHand[1], 7, '#f1ad78');
    line(x + 9, centerY, rightHand[0], rightHand[1], 7, '#f1ad78');
    ctx.fillStyle = '#f1ad78';
    [leftHand, rightHand].forEach(([handX, handY]) => {
      ctx.beginPath();
      ctx.arc(handX, handY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    if (object?.type === 'drill') {
      const recoil = Math.sin(object.pulse * Math.PI * 8) * 1.4;
      ctx.save();
      ctx.translate(rightHand[0] + recoil, rightHand[1]);
      ctx.fillStyle = '#f1a800'; roundedRect(-2, -5, 14, 9, 2); ctx.fill();
      ctx.fillStyle = '#31383c'; ctx.fillRect(10, -2, 11, 3); roundedRect(1, 2, 5, 10, 1); ctx.fill();
      ctx.restore();
      if (object.pulse > .42 && object.pulse < .92) {
        for (let spark = 0; spark < 3; spark += 1) {
          const angle = -1 + spark * .8;
          line(rightHand[0] + 21, rightHand[1], rightHand[0] + 27 + Math.cos(angle) * 4, rightHand[1] + Math.sin(angle) * 5, 1.4, 'rgba(237,148,0,.82)');
        }
      }
    }
  }

  function render(milliseconds) {
    const time = (milliseconds / 1000) % cycle;
    drawWall();
    const fade = time < .7 ? smooth(time / .7) : time > 30.8 ? 1 - smooth((time - 30.8) / 1.2) : 1;
    ctx.save();
    ctx.globalAlpha = fade;

    let fixedBars = 0;
    let fixedPanels = 0;
    let workerX = -30;
    let pose = 'walk';
    let object = null;
    let uniform = 'blue';
    let showWorker = true;
    const walkPhase = time * 1.65;

    if (time < 1) {
      workerX = lerp(-34, 36, smooth(time));
    } else if (time < 14) {
      const elapsed = time - 1;
      const index = Math.min(barXs.length - 1, Math.floor(elapsed / 1.625));
      const progress = (elapsed - index * 1.625) / 1.625;
      fixedBars = index;
      const startX = index === 0 ? 36 : barXs[index - 1] - 30;
      const targetX = barXs[index] - 30;
      workerX = progress < .32 ? lerp(startX, targetX, smooth(progress / .32)) : targetX;
      if (progress < .32) {
        object = { type: 'bar', x: workerX + 30, progress: .95 };
      } else if (progress < .5) {
        pose = 'alignBar';
        object = { type: 'bar', x: barXs[index], progress: easeOut((progress - .32) / .18) };
      } else if (progress < .73) {
        pose = 'drillHigh';
        object = { type: 'drill', pulse: (progress - .5) / .23 };
      } else if (progress < .94) {
        pose = 'drillLow';
        object = { type: 'drill', pulse: (progress - .73) / .21 };
      } else {
        fixedBars = index + 1;
        pose = 'idle';
      }
      if (progress >= .5) drawBar(barXs[index]);
    } else if (time < 15.2) {
      fixedBars = barXs.length;
      workerX = lerp(barXs[barXs.length - 1] - 30, W + 38, smooth((time - 14) / 1.2));
    } else if (time < 15.7) {
      fixedBars = barXs.length;
      showWorker = false;
    } else if (time < 29) {
      fixedBars = barXs.length;
      uniform = 'green';
      const elapsed = time - 15.7;
      const duration = 13.3 / 14;
      const index = Math.min(13, Math.floor(elapsed / duration));
      const progress = (elapsed - index * duration) / duration;
      fixedPanels = index;
      const bay = Math.floor(index / 2);
      const row = index % 2;
      const panelCenter = (barXs[bay] + barXs[bay + 1]) / 2;
      const targetX = panelCenter - 72;
      const previousBay = Math.floor((index - 1) / 2);
      const previousX = index === 0 ? -38 : (barXs[previousBay] + barXs[previousBay + 1]) / 2 - 72;
      workerX = progress < .35 ? lerp(previousX, targetX, smooth(progress / .35)) : targetX;
      if (progress < .35) {
        object = { type: 'panel', bay, row, progress: .92, xOffset: workerX + 50 - panelCenter, angle: .08 };
      } else if (progress < .58) {
        pose = 'carryPanel';
        object = { type: 'panel', bay, row, progress: 1, xOffset: lerp(-22, -8, smooth((progress - .35) / .23)), angle: lerp(.08, -.035, smooth((progress - .35) / .23)) };
      } else if (progress < .9) {
        pose = 'pressPanel';
        const press = smooth((progress - .58) / .32);
        object = { type: 'panel', bay, row, progress: .97 + .03 * press, xOffset: lerp(-8, 0, press), angle: lerp(-.035, 0, press) };
      } else {
        fixedPanels = index + 1;
        pose = 'idle';
      }
    } else {
      fixedBars = barXs.length;
      fixedPanels = 14;
      uniform = 'green';
      workerX = lerp(barXs[barXs.length - 1] - 34, W + 36, smooth((time - 29) / 1.8));
      if (time > 30.8) showWorker = false;
    }

    for (let index = 0; index < fixedBars; index += 1) drawBar(barXs[index]);
    for (let index = 0; index < fixedPanels; index += 1) drawPanel(Math.floor(index / 2), index % 2);
    if (showWorker) {
      const worker = drawWorkerBase(workerX, pose, walkPhase, uniform);
      drawArmsAndObject(workerX, pose, worker, object);
    }
    ctx.restore();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
