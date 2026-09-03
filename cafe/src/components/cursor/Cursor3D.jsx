import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const FOLLOW_LERP  = 0.055;          // pixel-space trailing softness
const WORLD_LERP   = 0.09;           // 3D world position smoothing
const OFFSET_PX    = 16;             // trail distance behind cursor
const CAM_Z        = 5;
const BALL_SCALE   = 0.15;
const GOLD         = 0xD4AF37;
const GOLD_SOFT    = 0xE8C98A;
const FPS_WARMUP   = 4000;

// Particle pools
const MAX_SPARKLE  = 8;
const MAX_TRAIL    = 6;

function mkPool(n) {
  return Array.from({ length: n }, () => ({
    active: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0, maxLife: 1, scale: 1, alpha: 1,
  }));
}
function spawn(pool, idxRef, fn) {
  const idx = idxRef.v++ % pool.length;
  idxRef.v %= pool.length;
  const p = pool[idx];
  p.active = true; p.life = 0;
  fn(p);
}

// ─── Component ────────────────────────────────────────────────────────────────
const Cursor3D = () => {
  useEffect(() => {
    // Guard: desktop only, hover capable, min 768px
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
    if (!mq.matches) return;

    // ── Canvas ──────────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: '99998',
      opacity: '1',
      transition: 'opacity 0.3s ease',
    });
    document.body.appendChild(canvas);

    // ── Renderer ─────────────────────────────────────────────────────────────
    // antialias off on low-DPI screens to save GPU fill rate
    const isHiDPI = window.devicePixelRatio > 1;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: isHiDPI });
    // Cap pixel ratio at 1.0 — biggest single perf win on HiDPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // ── Scene / Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    cam.position.z = CAM_Z;

    // ── Lights ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const sun = new THREE.DirectionalLight(0xfff8ee, 2.6);
    sun.position.set(4, 6, 5);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0xe0e8ff, 0.8);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // Bottom fill — gives the ball dimension from below
    const fill = new THREE.DirectionalLight(0xffeedd, 0.4);
    fill.position.set(0, -3, 2);
    scene.add(fill);

    // Gold hover point light
    const goldPt = new THREE.PointLight(GOLD, 0, 5, 2);
    scene.add(goldPt);

    // ── Ball group ───────────────────────────────────────────────────────────
    const ballGroup = new THREE.Group();
    ballGroup.visible = false;
    scene.add(ballGroup);

    // Inner rotation group — separates rolling from position
    const rollGroup = new THREE.Group();
    ballGroup.add(rollGroup);

    // ── Drop shadow (ellipse, 3D-projected feel) ─────────────────────────────
    const shadowGeo = new THREE.CircleGeometry(BALL_SCALE * 1.15, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.14, depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    scene.add(shadowMesh);

    // ── Hover pulse ring ─────────────────────────────────────────────────────
    const ringGeo = new THREE.RingGeometry(BALL_SCALE * 1.18, BALL_SCALE * 1.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: GOLD, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
    });
    const pulseRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(pulseRing);

    // Second concentric ring (luxury double-ring effect)
    const ring2Geo = new THREE.RingGeometry(BALL_SCALE * 1.52, BALL_SCALE * 1.62, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: GOLD_SOFT, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
    });
    const pulseRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(pulseRing2);

    // ── Shockwave ring (click) ───────────────────────────────────────────────
    const shockGeo = new THREE.RingGeometry(0.01, 0.06, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: GOLD, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
    });
    const shockRing = new THREE.Mesh(shockGeo, shockMat);
    scene.add(shockRing);
    let shockLife = 0, shockActive = false;

    // ── Sparkle particles (hover + click bursts) ─────────────────────────────
    const dummy = new THREE.Object3D();
    const sparklePool = mkPool(MAX_SPARKLE);
    const sparkleIdx  = { v: 0 };
    const sparkleGeo  = new THREE.CircleGeometry(0.025, 6);
    const sparkleMat  = new THREE.MeshBasicMaterial({
      color: GOLD, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    });
    const sparkleMesh = new THREE.InstancedMesh(sparkleGeo, sparkleMat, MAX_SPARKLE);
    sparkleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(sparkleMesh);

    // ── Motion trail (soft golden dots trailing behind) ───────────────────────
    const trailPool = mkPool(MAX_TRAIL);
    const trailIdx  = { v: 0 };
    const trailGeo  = new THREE.CircleGeometry(0.018, 8);
    const trailMat  = new THREE.MeshBasicMaterial({
      color: GOLD_SOFT, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    });
    const trailMesh = new THREE.InstancedMesh(trailGeo, trailMat, MAX_TRAIL);
    trailMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(trailMesh);

    // ── Load GLB model ───────────────────────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    let modelMeshes = [];
    let modelLoaded = false;

    gltfLoader.load(
      '/models/football.glb',
      (gltf) => {
        const model = gltf.scene;

        // Normalize scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar((BALL_SCALE * 2) / maxDim);

        // Center
        box.setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));

        // Enhance materials for premium look
        model.traverse((child) => {
          if (child.isMesh) {
            modelMeshes.push(child);
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                mat.roughness = Math.max(mat.roughness ?? 0.6, 0.3);
                mat.metalness = Math.min(mat.metalness ?? 0.1, 0.18);
                mat.envMapIntensity = 0.8;
                mat.emissive = mat.emissive ?? new THREE.Color(GOLD);
                mat.emissiveIntensity = 0;
              }
            });
          }
        });

        rollGroup.add(model);
        ballGroup.visible = true;
        modelLoaded = true;
        console.log('[Cursor3D] Football loaded ✓ (premium follower)');
      },
      undefined,
      (err) => {
        console.error('[Cursor3D] GLB load failed:', err);
        const fb = new THREE.Mesh(
          new THREE.IcosahedronGeometry(BALL_SCALE, 2),
          new THREE.MeshStandardMaterial({ color: 0xF8F8F8, roughness: 0.45, metalness: 0.12 }),
        );
        rollGroup.add(fb);
        ballGroup.visible = true;
        modelLoaded = true;
      },
    );

    // ── Mouse state ──────────────────────────────────────────────────────────
    const mouse = {
      px: window.innerWidth / 2,
      py: window.innerHeight / 2,
      tx: window.innerWidth / 2,
      ty: window.innerHeight / 2,
      dx: 0, dy: 0,
      rawSpeed: 0,         // instantaneous speed
      smoothSpeed: 0,      // smoothed for animations
      angle: 0,            // movement angle in radians
      hover: false,
      click: false,
      idle: 0,             // seconds since last movement
    };
    let lastMoveT = performance.now();

    const onMove = (e) => {
      const now = performance.now();
      const dtMs = Math.max(now - lastMoveT, 1);
      mouse.dx = e.clientX - mouse.px;
      mouse.dy = e.clientY - mouse.py;
      mouse.rawSpeed = Math.sqrt(mouse.dx * mouse.dx + mouse.dy * mouse.dy) / dtMs;
      mouse.px = e.clientX;
      mouse.py = e.clientY;
      mouse.idle = 0;
      lastMoveT = now;

      const overHero = !!e.target.closest('#hero-section');
      canvas.style.opacity = overHero ? '0' : '1';

      // Movement angle
      const len = Math.sqrt(mouse.dx * mouse.dx + mouse.dy * mouse.dy);
      if (len > 0.5) {
        mouse.angle = Math.atan2(mouse.dy, mouse.dx);
        // Offset trailing behind cursor
        mouse.tx = e.clientX - (mouse.dx / len) * OFFSET_PX;
        mouse.ty = e.clientY - (mouse.dy / len) * OFFSET_PX;
      } else {
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
      }
    };

    const onDown = () => { mouse.click = true; };

    const HOVER_SEL = 'a, button, [role="button"], input, select, textarea, label, .interactive, [data-hover], .card, nav, .menu-showcase-nav';
    const onOver = (e) => { mouse.hover = !!e.target.closest(HOVER_SEL); };
    const onOut  = (e) => { if (e.target.closest(HOVER_SEL)) mouse.hover = false; };

    const onResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout',  onOut,  { passive: true });
    window.addEventListener('resize', onResize);

    // ── World coord helper ───────────────────────────────────────────────────
    const toWorld = (pxX, pxY) => {
      const nx = (pxX / window.innerWidth) * 2 - 1;
      const ny = -(pxY / window.innerHeight) * 2 + 1;
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * CAM_Z;
      return new THREE.Vector3((nx * h * cam.aspect) / 2, (ny * h) / 2, 0);
    };

    // ── Animation state ──────────────────────────────────────────────────────
    const ballPos    = new THREE.Vector3();
    const scaleVec   = new THREE.Vector3(1, 1, 1);
    let smoothPx     = mouse.tx;
    let smoothPy     = mouse.ty;
    let idleT        = 0;
    let hoverAnim    = 0;
    let pulsePhase   = 0;
    let pulse2Phase  = 0.35;     // offset so rings don't overlap
    let bounceActive = false, bounceAnim = 0;
    let squashAnim   = 0;        // squash & stretch on bounce
    let trailTimer   = 0;
    let sparkleTimer = 0;
    // Velocity-based tilt
    let tiltX = 0, tiltZ = 0;

    let raf, frames = 0, lastFpsT = performance.now(), lowCount = 0;
    const startT = performance.now();
    // Frame skip: render every frame normally, but skip render-only (not logic) if behind
    let frameSkip = 0;

    // ── RAF loop ─────────────────────────────────────────────────────────────
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - (tick._t || now)) / 1000, 0.05);
      tick._t = now;

      // FPS guard — kill cursor if consistently below 20fps after warmup
      frames++;
      if (now - lastFpsT >= 1000) {
        const fps = (frames * 1000) / (now - lastFpsT);
        frames = 0; lastFpsT = now;
        // Throttle render on sustained low fps: skip every other render call
        frameSkip = (fps < 35 && now - startT > FPS_WARMUP) ? 1 : 0;
        if (now - startT > FPS_WARMUP && fps < 20) {
          if (++lowCount > 2) { cleanup(); return; }
        } else lowCount = 0;
      }
      // Frame throttle: skip render (but not physics/logic) on low-end
      const shouldRender = (frameSkip === 0 || (frames % 2 === 0));

      idleT += dt;
      mouse.idle += dt;
      mouse.smoothSpeed = THREE.MathUtils.lerp(mouse.smoothSpeed, mouse.rawSpeed, 6 * dt);

      // ── Smooth trailing position ───────────────────────────────────────────
      // Dynamic lerp: faster when moving fast, more laggy when slow (premium feel)
      const dynLerp = FOLLOW_LERP + Math.min(mouse.smoothSpeed * 0.012, 0.06);
      smoothPx += (mouse.tx - smoothPx) * dynLerp;
      smoothPy += (mouse.ty - smoothPy) * dynLerp;

      const target = toWorld(smoothPx, smoothPy);
      ballPos.lerp(target, WORLD_LERP);

      // ── Idle micro-motions ─────────────────────────────────────────────────
      let idleOY = 0, idleOX = 0;
      if (mouse.idle > 0.8) {
        const ease = Math.min((mouse.idle - 0.8) / 1.5, 1); // ramp in
        idleOY = Math.sin(idleT * 1.3) * 0.022 * ease;
        idleOX = Math.cos(idleT * 0.9) * 0.008 * ease;
      }

      // ── Click bounce with squash & stretch ─────────────────────────────────
      let bounceOY = 0;
      if (bounceActive) {
        bounceAnim = Math.min(bounceAnim + dt * 6.5, 1);
        if (bounceAnim < 0.3) {
          // Jump up phase
          const t = bounceAnim / 0.3;
          bounceOY = Math.sin(t * Math.PI) * 0.14;
          squashAnim = -0.12 * Math.sin(t * Math.PI); // stretch vertically
        } else if (bounceAnim < 0.5) {
          // Land squash
          const t = (bounceAnim - 0.3) / 0.2;
          bounceOY = 0;
          squashAnim = 0.15 * Math.sin(t * Math.PI);  // squash on landing
        } else {
          // Recovery bounce
          const t = (bounceAnim - 0.5) / 0.5;
          bounceOY = Math.sin(t * Math.PI * 1.5) * 0.04 * (1 - t);
          squashAnim *= 0.9;
        }
        if (bounceAnim >= 1) {
          bounceActive = false; bounceAnim = 0; squashAnim = 0;
        }
      } else {
        squashAnim *= 0.92; // decay
      }

      ballGroup.position.set(
        ballPos.x + idleOX,
        ballPos.y + idleOY + bounceOY,
        0,
      );

      // ── Squash & stretch scale ─────────────────────────────────────────────
      const baseScale = 1.0 + hoverAnim * 0.28;
      const sX = baseScale * (1 + squashAnim * 0.6);
      const sY = baseScale * (1 - squashAnim * 0.8);
      const sZ = baseScale * (1 + squashAnim * 0.6);
      scaleVec.set(sX, sY, sZ);
      ballGroup.scale.lerp(scaleVec, 12 * dt);

      // ── Natural rolling rotation ───────────────────────────────────────────
      if (mouse.smoothSpeed > 0.03) {
        // Roll proportional to speed — like a real ball rolling on a surface
        const rollSpeed = Math.min(mouse.smoothSpeed * 3.5, 14) * dt;

        // Movement direction drives which axes roll
        const mdx = mouse.dx, mdy = mouse.dy;
        const mLen = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
        const normDx = mdx / mLen;
        const normDy = mdy / mLen;

        // Rolling: perpendicular axis to movement direction
        // Moving right → ball rotates around Z axis (forward roll)
        // Moving down  → ball rotates around X axis
        rollGroup.rotation.x += normDy * rollSpeed;
        rollGroup.rotation.z -= normDx * rollSpeed;
        // Slight spin on Y for visual interest
        rollGroup.rotation.y += rollSpeed * 0.3;
      } else if (mouse.idle > 1.0) {
        // Elegant idle rotation
        const idleEase = Math.min((mouse.idle - 1.0) / 2, 1);
        rollGroup.rotation.y += 0.2 * idleEase * dt;
        rollGroup.rotation.x += 0.06 * idleEase * dt;
      }

      // ── Velocity tilt (lean into movement direction) ───────────────────────
      const targetTiltZ = -mouse.dx * 0.004 * Math.min(mouse.smoothSpeed, 3);
      const targetTiltX =  mouse.dy * 0.003 * Math.min(mouse.smoothSpeed, 3);
      tiltX = THREE.MathUtils.lerp(tiltX, targetTiltX, 5 * dt);
      tiltZ = THREE.MathUtils.lerp(tiltZ, targetTiltZ, 5 * dt);
      ballGroup.rotation.x = tiltX;
      ballGroup.rotation.z = tiltZ;

      // ── Hover effects ──────────────────────────────────────────────────────
      hoverAnim = THREE.MathUtils.lerp(hoverAnim, mouse.hover ? 1 : 0, 7 * dt);

      // Gold emissive glow
      if (modelMeshes.length > 0) {
        modelMeshes.forEach((mesh) => {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (mat.emissive) {
              mat.emissive.setHex(GOLD);
              mat.emissiveIntensity = THREE.MathUtils.lerp(
                mat.emissiveIntensity, hoverAnim * 0.5, 7 * dt,
              );
            }
          });
        });
      }

      // Gold point light
      goldPt.position.copy(ballGroup.position);
      goldPt.intensity = THREE.MathUtils.lerp(goldPt.intensity, hoverAnim * 2.2, 7 * dt);

      // ── Pulse rings (double concentric, luxury feel) ───────────────────────
      pulsePhase = (pulsePhase + dt * 1.8) % 1;
      pulse2Phase = (pulse2Phase + dt * 1.4) % 1;

      pulseRing.position.copy(ballGroup.position);
      pulseRing2.position.copy(ballGroup.position);

      if (mouse.hover) {
        pulseRing.scale.setScalar(1 + pulsePhase * 0.55);
        ringMat.opacity = (1 - pulsePhase) * 0.45 * hoverAnim;

        pulseRing2.scale.setScalar(1 + pulse2Phase * 0.5);
        ring2Mat.opacity = (1 - pulse2Phase) * 0.2 * hoverAnim;
      } else {
        ringMat.opacity  = THREE.MathUtils.lerp(ringMat.opacity, 0, 8 * dt);
        ring2Mat.opacity = THREE.MathUtils.lerp(ring2Mat.opacity, 0, 8 * dt);
      }

      // ── Drop shadow (dynamic size/opacity with motion) ─────────────────────
      const shadowDist = BALL_SCALE + 0.05 + bounceOY * 0.5;
      shadowMesh.position.set(
        ballGroup.position.x + tiltZ * 0.15,
        ballGroup.position.y - shadowDist,
        -0.1,
      );
      // Shadow gets smaller & lighter when ball is "airborne"
      const shadowScale = (1 + hoverAnim * 0.2) * (1 - bounceOY * 2);
      shadowMesh.scale.setScalar(Math.max(0.3, shadowScale));
      shadowMat.opacity = THREE.MathUtils.lerp(
        0.14, 0.04, Math.max(hoverAnim, bounceOY * 4),
      );

      // ── Motion trail particles ─────────────────────────────────────────────
      trailTimer += dt;
      if (mouse.smoothSpeed > 0.15 && trailTimer > 0.04) {
        trailTimer = 0;
        spawn(trailPool, trailIdx, (p) => {
          p.pos.copy(ballGroup.position);
          // Spawn behind the ball in movement direction
          p.pos.x -= Math.cos(mouse.angle) * BALL_SCALE * 0.8;
          p.pos.y -= Math.sin(mouse.angle) * BALL_SCALE * 0.8;
          p.vel.set(
            -Math.cos(mouse.angle) * 0.3,
            -Math.sin(mouse.angle) * 0.3 + 0.1,
            0,
          );
          p.maxLife = 0.35 + Math.random() * 0.2;
          p.scale = (0.6 + Math.random() * 0.6) * Math.min(mouse.smoothSpeed, 2);
        });
      }

      // ── Hover sparkle spawn ────────────────────────────────────────────────
      sparkleTimer += dt;
      if (mouse.hover && sparkleTimer > 0.12) {
        sparkleTimer = 0;
        spawn(sparklePool, sparkleIdx, (p) => {
          const a = Math.random() * Math.PI * 2;
          const r = BALL_SCALE * (1.2 + Math.random() * 0.5);
          p.pos.set(
            ballGroup.position.x + Math.cos(a) * r,
            ballGroup.position.y + Math.sin(a) * r,
            0,
          );
          p.vel.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15 + 0.2, 0);
          p.maxLife = 0.5 + Math.random() * 0.4;
          p.scale = 0.6 + Math.random() * 0.8;
        });
      }

      // ── Click effects ──────────────────────────────────────────────────────
      if (mouse.click) {
        mouse.click = false;
        bounceActive = true;
        bounceAnim = 0;

        // Shockwave
        shockActive = true;
        shockLife = 0;
        shockRing.position.copy(ballGroup.position);
        shockMat.opacity = 0.75;
        shockRing.scale.setScalar(1);

        // Sparkle burst
        for (let i = 0; i < 10; i++) {
          spawn(sparklePool, sparkleIdx, (p) => {
            const a = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
            p.pos.copy(ballGroup.position);
            p.vel.set(Math.cos(a) * 1.8, Math.sin(a) * 1.8, 0);
            p.maxLife = 0.35 + Math.random() * 0.25;
            p.scale = 0.8 + Math.random() * 1.2;
          });
        }
      }

      // ── Shockwave update ───────────────────────────────────────────────────
      if (shockActive) {
        shockLife += dt;
        const t = shockLife / 0.5;
        shockRing.scale.setScalar(1 + t * 3.5);
        shockMat.opacity = Math.max(0, 0.75 * (1 - t));
        if (shockLife > 0.5) shockActive = false;
      }

      // ── Update sparkle particles ───────────────────────────────────────────
      let anySparkle = false;
      for (let i = 0; i < MAX_SPARKLE; i++) {
        const p = sparklePool[i];
        if (p.active) {
          p.life += dt;
          if (p.life >= p.maxLife) { p.active = false; dummy.scale.setScalar(0); }
          else {
            anySparkle = true;
            const t = p.life / p.maxLife;
            p.pos.addScaledVector(p.vel, dt);
            p.vel.y -= 0.5 * dt; // gentle gravity
            dummy.position.copy(p.pos);
            dummy.quaternion.copy(cam.quaternion);
            // Fade in then out with peak at 30%
            const alpha = t < 0.3 ? t / 0.3 : 1 - ((t - 0.3) / 0.7);
            dummy.scale.setScalar(p.scale * 0.025 * alpha);
          }
        } else { dummy.scale.setScalar(0); }
        dummy.updateMatrix();
        sparkleMesh.setMatrixAt(i, dummy.matrix);
      }
      sparkleMesh.instanceMatrix.needsUpdate = true;
      sparkleMat.opacity = anySparkle ? 0.85 : 0;

      // ── Update trail particles ─────────────────────────────────────────────
      let anyTrail = false;
      for (let i = 0; i < MAX_TRAIL; i++) {
        const p = trailPool[i];
        if (p.active) {
          p.life += dt;
          if (p.life >= p.maxLife) { p.active = false; dummy.scale.setScalar(0); }
          else {
            anyTrail = true;
            const t = p.life / p.maxLife;
            p.pos.addScaledVector(p.vel, dt);
            dummy.position.copy(p.pos);
            dummy.quaternion.copy(cam.quaternion);
            dummy.scale.setScalar(p.scale * 0.018 * (1 - t));
          }
        } else { dummy.scale.setScalar(0); }
        dummy.updateMatrix();
        trailMesh.setMatrixAt(i, dummy.matrix);
      }
      trailMesh.instanceMatrix.needsUpdate = true;
      trailMat.opacity = anyTrail ? 0.5 : 0;

      // ── Speed decay ────────────────────────────────────────────────────────
      mouse.rawSpeed *= 0.85;

      if (shouldRender) renderer.render(scene, cam);
    };

    raf = requestAnimationFrame(tick);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    const cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('resize', onResize);
      [shadowGeo, shadowMat, ringGeo, ringMat, ring2Geo, ring2Mat,
       shockGeo, shockMat, sparkleGeo, sparkleMat,
       trailGeo, trailMat].forEach((o) => o.dispose?.());
      renderer.dispose();
      canvas.remove();
    };

    return cleanup;
  }, []);

  return null;
};

export default Cursor3D;
