/**
 * Canvas preview, including a small orthographic 3D renderer.
 * The 3D view draws the same triangles that go into the STL, not a mock model.
 * Keeping this on Canvas 2D avoids WebGL, CDN libraries, and GPU requirements.
 */
const PanelPreview = (() => {
  const COLORS = { cyan: '#45f4ef', violet: '#ad8aff', amber: '#ffbf66' };

  class Preview {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.pattern = null;
      this.mesh = null;
      this.mode = 'light';
      this.color = 'cyan';
      this.yaw = -0.28;
      this.tilt = 0.65;
      this.zoom = 1;
      this.frame = null;
      this.drag = null;
      this.resizeObserver = new ResizeObserver(() => this.scheduleDraw());
      this.resizeObserver.observe(canvas);
      this.bindPointerEvents();
    }

    update(pattern, mesh) {
      this.pattern = pattern;
      this.mesh = mesh;
      this.scheduleDraw();
    }

    setMode(mode) {
      this.mode = mode;
      this.canvas.classList.toggle('draggable', mode === '3d');
      this.canvas.setAttribute('aria-label', mode === '3d' ?
        '3D preview of the exported panel. Drag to rotate; scroll to zoom.' :
        `${mode === 'light' ? 'Backlit' : 'Cutout'} preview of the generated panel.`);
      this.scheduleDraw();
    }

    resetView() {
      this.yaw = -0.28;
      this.tilt = 0.65;
      this.zoom = 1;
      this.scheduleDraw();
    }

    bindPointerEvents() {
      this.canvas.addEventListener('pointerdown', event => {
        if (this.mode !== '3d') return;
        this.drag = { x: event.clientX, y: event.clientY };
        this.canvas.setPointerCapture(event.pointerId);
      });
      this.canvas.addEventListener('pointermove', event => {
        if (!this.drag) return;
        this.yaw += (event.clientX - this.drag.x) * 0.007;
        this.tilt = Math.max(0.1, Math.min(1.25, this.tilt + (event.clientY - this.drag.y) * 0.007));
        this.drag = { x: event.clientX, y: event.clientY };
        this.scheduleDraw();
      });
      for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        this.canvas.addEventListener(name, () => { this.drag = null; });
      }
      this.canvas.addEventListener('wheel', event => {
        if (this.mode !== '3d') return;
        event.preventDefault();
        this.zoom = Math.max(0.5, Math.min(2.5, this.zoom * Math.exp(-event.deltaY * 0.001)));
        this.scheduleDraw();
      }, { passive: false });
    }

    scheduleDraw() {
      if (this.frame !== null) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.draw();
      });
    }

    draw() {
      const rect = this.canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(rect.width * ratio);
      this.canvas.height = Math.round(rect.height * ratio);
      const ctx = this.context;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const gradient = ctx.createRadialGradient(rect.width / 2, rect.height / 2, 0,
        rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height) * 0.6);
      gradient.addColorStop(0, '#15272d');
      gradient.addColorStop(1, '#080f13');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      // A quiet workbench grid, independent of display scale.
      ctx.strokeStyle = '#8caab909';
      ctx.lineWidth = 1;
      for (let x = 0; x < rect.width; x += 28) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 28) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }
      if (!this.pattern) return;
      if (this.mode === '3d') this.draw3D(rect.width, rect.height);
      else this.drawFlat(rect.width, rect.height);
    }

    drawFlat(viewWidth, viewHeight) {
      const ctx = this.context;
      const { length, width } = this.pattern.settings;
      const scale = Math.min((viewWidth - 90) / length, (viewHeight - 105) / width);
      const x = (viewWidth - length * scale) / 2;
      const y = (viewHeight - width * scale) / 2 - 6;
      const holes = new Path2D();
      for (const polygon of this.pattern.holes) {
        polygon.forEach((p, i) => {
          const method = i === 0 ? 'moveTo' : 'lineTo';
          holes[method](x + p.x * scale, y + p.y * scale);
        });
        holes.closePath();
      }
      ctx.save();
      ctx.shadowColor = '#0009';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = this.mode === 'light' ? '#11191d' : '#738c96';
      ctx.fillRect(x, y, length * scale, width * scale);
      ctx.restore();
      ctx.strokeStyle = this.mode === 'light' ? '#2d4149' : '#aac2cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, length * scale, width * scale);

      if (this.mode === 'light') {
        ctx.save();
        ctx.fillStyle = COLORS[this.color];
        ctx.shadowColor = COLORS[this.color];
        ctx.shadowBlur = 16;
        ctx.fill(holes);
        ctx.shadowBlur = 7;
        ctx.fill(holes);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#d8fffa';
        ctx.globalAlpha = 0.7;
        ctx.fill(holes);
        ctx.restore();
      } else {
        ctx.fillStyle = '#0a141a';
        ctx.fill(holes);
      }

      ctx.fillStyle = '#78949f';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      const units = this.pattern.settings.units;
      const dimension = value => `${Number((units === 'in' ? value / 25.4 : value).toFixed(2))} ${units}`;
      ctx.fillText(dimension(length), viewWidth / 2, y + width * scale + 23);
      ctx.save();
      ctx.translate(x - 17, y + width * scale / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(dimension(width), 0, 0);
      ctx.restore();
    }

    draw3D(viewWidth, viewHeight) {
      if (!this.mesh) return;
      const ctx = this.context;
      const { length, width, thickness } = this.pattern.settings;
      const cosYaw = Math.cos(this.yaw), sinYaw = Math.sin(this.yaw);
      const cosTilt = Math.cos(this.tilt), sinTilt = Math.sin(this.tilt);
      const projectedWidth = Math.abs(length * cosYaw) + Math.abs(width * sinYaw);
      const projectedHeight = (Math.abs(length * sinYaw) + Math.abs(width * cosYaw)) *
        cosTilt + thickness * sinTilt;
      const scale = Math.min((viewWidth - 95) / projectedWidth,
        (viewHeight - 115) / projectedHeight) * this.zoom;
      const origin = { x: viewWidth / 2, y: viewHeight / 2 - 8 };

      const project = (x, y, z) => {
        x -= length / 2;
        y -= width / 2;
        z -= thickness / 2;
        const rotatedX = x * cosYaw - y * sinYaw;
        const rotatedY = x * sinYaw + y * cosYaw;
        return {
          x: origin.x + rotatedX * scale,
          y: origin.y + (rotatedY * cosTilt - z * sinTilt) * scale,
          depth: rotatedY * sinTilt + z * cosTilt
        };
      };
      const faces = [];
      const topSurface = new Path2D();
      const positions = this.mesh.positions;
      for (let i = 0; i < positions.length; i += 9) {
        const normal = MeshBuilder.normalAt(positions, i);
        const rotatedNormalY = normal[0] * sinYaw + normal[1] * cosYaw;
        if (rotatedNormalY * sinTilt + normal[2] * cosTilt <= 0) continue;
        const points = [0, 3, 6].map(j => project(positions[i + j], positions[i + j + 1], positions[i + j + 2]));
        if (normal[2] > 0.99) {
          // Fill all coplanar triangles together so antialiasing does not expose
          // their internal edges. Hole/exterior walls remain separate below.
          points.forEach((p, j) => j === 0 ? topSurface.moveTo(p.x, p.y) : topSurface.lineTo(p.x, p.y));
          topSurface.closePath();
          continue;
        }
        const shade = Math.max(0, normal[0] * -0.25 + normal[1] * -0.4 + normal[2] * 0.85);
        faces.push({ points, depth: points.reduce((sum, p) => sum + p.depth, 0) / 3,
          color: `rgb(${Math.round(54 + shade * 77)},${Math.round(74 + shade * 95)},${Math.round(81 + shade * 99)})` });
      }
      faces.sort((a, b) => a.depth - b.depth);
      ctx.lineWidth = 0.55;
      for (const face of faces) {
        ctx.beginPath();
        face.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = face.color;
        ctx.strokeStyle = face.color;
        ctx.fill();
        ctx.stroke(); // Same-color stroke covers subpixel cracks between triangles.
      }
      ctx.fillStyle = 'rgb(119,155,165)';
      ctx.fill(topSurface);
    }
  }

  return { Preview, COLORS };
})();
