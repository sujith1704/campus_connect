import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Procedural texture generator for the CampusConnect chest badge ("CC" monogram)
 */
function createBadgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Gradient circle
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.65, '#2563eb');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // "CC" monogram
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 112px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CC', 128, 134);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural texture for soft radial shadow beneath each robot
 */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural texture for 3D holographic floor projector ring
 */
function createHoloRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  // Outer thin accent ring
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Dashed middle ring
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.65)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.arc(cx, cy, 212, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glowing accent ring
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 175, 0, Math.PI * 2);
  ctx.stroke();

  // Aerospace precision tick marks
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 2;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
    const x1 = cx + Math.cos(a) * 224;
    const y1 = cy + Math.sin(a) * 224;
    const x2 = cx + Math.cos(a) * 240;
    const y2 = cy + Math.sin(a) * 240;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Soft center radial aura
  const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 200);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
  grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Factory to build a CampusConnect robot instance
 */
function buildRobotInstance(scene, badgeTexture, shadowTexture, options = {}) {
  const {
    baseX = 0,
    baseY = 0,
    baseZ = 0,
    scale = 0.84,
    rotY = 0,
    accentColor = 0x38bdf8,
    capColor = 0x1e1b4b,
    tasselColor = 0xfbbf24,
    phaseOffset = 0,
  } = options;

  const mascotGroup = new THREE.Group();
  mascotGroup.position.set(baseX, baseY, baseZ);
  mascotGroup.scale.set(scale, scale, scale);
  mascotGroup.rotation.y = rotY;
  scene.add(mascotGroup);

  // Soft Contact Shadow Plane under the robot
  const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(baseX, -1.6 * scale + baseY, baseZ);
  shadowMesh.scale.set(scale, scale, scale);
  scene.add(shadowMesh);

  // Torso Group
  const bodyGroup = new THREE.Group();
  mascotGroup.add(bodyGroup);

  // Torso Capsule
  const torsoGeo = new THREE.CapsuleGeometry(0.72, 0.7, 24, 32);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.28,
    metalness: 0.08,
  });
  const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
  torsoMesh.castShadow = true;
  bodyGroup.add(torsoMesh);

  // Refined Navy Belly Plate
  const bellyGeo = new THREE.CylinderGeometry(0.73, 0.75, 0.72, 32, 1, false, -Math.PI / 3.4, Math.PI / 1.7);
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.2,
  });
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, -0.05, 0);
  bodyGroup.add(bellyMesh);

  // Monogram Badge
  const badgeGeo = new THREE.CircleGeometry(0.24, 32);
  const badgeMat = new THREE.MeshStandardMaterial({
    map: badgeTexture,
    roughness: 0.2,
    metalness: 0.2,
    transparent: true,
  });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMesh.position.set(0, 0.02, 0.74);
  bodyGroup.add(badgeMesh);

  // Chest Indicator Light
  const chestLightGeo = new THREE.SphereGeometry(0.055, 16, 16);
  const chestLightMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  const chestLight = new THREE.Mesh(chestLightGeo, chestLightMat);
  chestLight.position.set(0, -0.28, 0.73);
  bodyGroup.add(chestLight);

  // Metallic Collar Ring
  const neckGeo = new THREE.TorusGeometry(0.56, 0.065, 16, 32);
  const neckMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.5,
  });
  const neckMesh = new THREE.Mesh(neckGeo, neckMat);
  neckMesh.rotation.x = Math.PI / 2;
  neckMesh.position.y = 0.72;
  bodyGroup.add(neckMesh);

  // Head Pivot
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.24, 0);
  mascotGroup.add(headPivot);

  const headGeo = new THREE.CapsuleGeometry(0.68, 0.38, 24, 32);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.08,
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Dark Visor Plate
  const visorGeo = new THREE.CylinderGeometry(0.69, 0.69, 0.54, 32, 1, false, -Math.PI / 3.1, Math.PI / 1.55);
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.14,
    metalness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.01);
  headPivot.add(visorMesh);

  // Eyes Container
  const eyesContainer = new THREE.Group();
  eyesContainer.position.set(0, 0, 0.695);
  headPivot.add(eyesContainer);

  const eyeGeo = new THREE.CapsuleGeometry(0.07, 0.12, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.5,
    roughness: 0.1,
  });

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.24, 0, 0);
  leftEye.rotation.z = Math.PI / 2;
  eyesContainer.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.24, 0, 0);
  rightEye.rotation.z = Math.PI / 2;
  eyesContainer.add(rightEye);

  // Ear Pods
  const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24);
  const earMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.4,
  });
  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.rotation.z = Math.PI / 2;
  leftEar.position.set(-0.72, 0, 0);
  headPivot.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, earMat);
  rightEar.rotation.z = Math.PI / 2;
  rightEar.position.set(0.72, 0, 0);
  headPivot.add(rightEar);

  // Graduation Cap
  const capGroup = new THREE.Group();
  capGroup.position.set(0, 0.65, 0);
  capGroup.rotation.z = -0.07;
  capGroup.rotation.x = 0.04;
  headPivot.add(capGroup);

  const capBaseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.16, 24);
  const capMat = new THREE.MeshStandardMaterial({
    color: capColor,
    roughness: 0.35,
    metalness: 0.1,
  });
  const capBase = new THREE.Mesh(capBaseGeo, capMat);
  capBase.castShadow = true;
  capGroup.add(capBase);

  const boardGeo = new THREE.BoxGeometry(0.96, 0.04, 0.96);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.28,
    metalness: 0.15,
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.y = 0.09;
  board.rotation.y = Math.PI / 4;
  board.castShadow = true;
  capGroup.add(board);

  const btnGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.035, 16);
  const goldMat = new THREE.MeshStandardMaterial({
    color: tasselColor,
    roughness: 0.2,
    metalness: 0.7,
  });
  const button = new THREE.Mesh(btnGeo, goldMat);
  button.position.y = 0.12;
  capGroup.add(button);

  const tasselCordGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.38, 8);
  const tasselCord = new THREE.Mesh(tasselCordGeo, goldMat);
  tasselCord.position.set(0.28, -0.05, 0.28);
  tasselCord.rotation.z = -0.4;
  capGroup.add(tasselCord);

  const tasselBobGeo = new THREE.CapsuleGeometry(0.032, 0.08, 12, 12);
  const tasselBob = new THREE.Mesh(tasselBobGeo, goldMat);
  tasselBob.position.set(0.38, -0.25, 0.32);
  capGroup.add(tasselBob);

  // Floating Hands
  const handMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.08,
  });
  const handTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.5,
  });

  const leftHandGroup = new THREE.Group();
  leftHandGroup.position.set(-1.08, 0.1, 0.15);
  mascotGroup.add(leftHandGroup);

  const leftHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), handMat);
  leftHandMesh.scale.set(1.0, 1.15, 0.85);
  leftHandMesh.castShadow = true;
  leftHandGroup.add(leftHandMesh);

  const leftHandRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 12, 24), handTrimMat);
  leftHandRing.rotation.x = Math.PI / 2;
  leftHandGroup.add(leftHandRing);

  const rightHandGroup = new THREE.Group();
  rightHandGroup.position.set(1.08, 0.1, 0.15);
  mascotGroup.add(rightHandGroup);

  const rightHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), handMat);
  rightHandMesh.scale.set(1.0, 1.15, 0.85);
  rightHandMesh.castShadow = true;
  rightHandGroup.add(rightHandMesh);

  const rightHandRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 12, 24), handTrimMat);
  rightHandRing.rotation.x = Math.PI / 2;
  rightHandGroup.add(rightHandRing);

  return {
    group: mascotGroup,
    headPivot,
    eyesContainer,
    leftHandGroup,
    rightHandGroup,
    tasselCord,
    chestLightMat,
    shadowMesh,
    baseX,
    baseY,
    baseZ,
    scale,
    baseRotY: rotY,
    phaseOffset,
    // Animation state
    currentHeadRot: { x: 0, y: 0, z: 0 },
    currentEyesPos: { x: 0, y: 0 },
    currentHandShield: 0,
    currentEyeScaleY: 1.0,
    isBlinking: false,
    blinkProgress: 0,
    blinkTimer: 0,
    nextBlinkInterval: 2.8 + Math.random() * 2.5,
  };
}

const ThreeLoginExperience = ({ focusTarget = null }) => {
  const containerRef = useRef(null);
  const stateRef = useRef({
    focusTarget,
    targetPointer: { x: 0, y: 0 },
    isMobile: false,
    isVisible: true,
  });

  useEffect(() => {
    stateRef.current.focusTarget = focusTarget;
  }, [focusTarget]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrameId = null;
    const clock = new THREE.Clock();

    const checkMobile = () => {
      stateRef.current.isMobile = window.innerWidth < 768;
    };
    checkMobile();

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );

    const updateCameraPos = () => {
      if (stateRef.current.isMobile) {
        camera.position.set(0, 0.15, 7.2);
      } else {
        camera.position.set(0, 0.2, 6.8);
      }
      camera.lookAt(0, 0.05, 0);
    };
    updateCameraPos();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // Refined Studio Lighting
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.35);
    keyLight.position.set(4.5, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.65);
    fillLight.position.set(-4.5, 2, 3.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 0.85, 12);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    // Shared Textures
    const badgeTexture = createBadgeTexture();
    const shadowTexture = createContactShadowTexture();
    const holoTexture = createHoloRingTexture();

    // -------------------------------------------------------------
    // 3D Holographic Stage Pedestal Disc
    // -------------------------------------------------------------
    const holoGeo = new THREE.PlaneGeometry(6.4, 6.4);
    const holoMat = new THREE.MeshBasicMaterial({
      map: holoTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.rotation.x = -Math.PI / 2;
    holoMesh.position.set(0, -1.38, 0);
    scene.add(holoMesh);

    // -------------------------------------------------------------
    // Build 3 Mascot Robots Trio
    // -------------------------------------------------------------
    const robots = [
      // 1. Center Robot (Leader)
      buildRobotInstance(scene, badgeTexture, shadowTexture, {
        baseX: 0,
        baseY: 0,
        baseZ: 0.35,
        scale: 0.84,
        rotY: 0,
        accentColor: 0x38bdf8,
        capColor: 0x1e1b4b,
        tasselColor: 0xfbbf24,
        phaseOffset: 0,
      }),
      // 2. Left Companion Robot
      buildRobotInstance(scene, badgeTexture, shadowTexture, {
        baseX: -1.55,
        baseY: -0.06,
        baseZ: -0.3,
        scale: 0.7,
        rotY: 0.16,
        accentColor: 0x818cf8,
        capColor: 0x1e1b4b,
        tasselColor: 0x38bdf8,
        phaseOffset: 1.4,
      }),
      // 3. Right Companion Robot
      buildRobotInstance(scene, badgeTexture, shadowTexture, {
        baseX: 1.55,
        baseY: -0.06,
        baseZ: -0.3,
        scale: 0.7,
        rotY: -0.16,
        accentColor: 0x38bdf8,
        capColor: 0x1e1b4b,
        tasselColor: 0xfbbf24,
        phaseOffset: 2.7,
      }),
    ];

    // -------------------------------------------------------------
    // Subtle Animated Ambient Cyber-Dust Particles in 3D Space
    // -------------------------------------------------------------
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleMeta = [];

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 8.5;
      const py = (Math.random() - 0.5) * 6;
      const pz = -0.5 - Math.random() * 3.5;
      particlePos[i * 3] = px;
      particlePos[i * 3 + 1] = py;
      particlePos[i * 3 + 2] = pz;
      particleMeta.push({
        baseX: px,
        baseY: py,
        baseZ: pz,
        speed: 0.12 + Math.random() * 0.2,
        sway: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Procedural soft circle sprite for particles
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 32;
    dotCanvas.height = 32;
    const dotCtx = dotCanvas.getContext('2d');
    const dotGrad = dotCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
    dotGrad.addColorStop(0, 'rgba(125, 211, 252, 0.85)');
    dotGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
    dotGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    dotCtx.fillStyle = dotGrad;
    dotCtx.fillRect(0, 0, 32, 32);
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      map: dotTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // -------------------------------------------------------------
    // Mouse Interaction
    // -------------------------------------------------------------
    const onMouseMove = (e) => {
      if (stateRef.current.isMobile) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetPointer.x = Math.max(-1.3, Math.min(1.3, nx));
      stateRef.current.targetPointer.y = Math.max(-1.3, Math.min(1.3, ny));
    };

    const onMouseLeave = () => {
      stateRef.current.targetPointer.x = 0;
      stateRef.current.targetPointer.y = 0;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      if (!container) return;
      checkMobile();
      const w = container.clientWidth;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      updateCameraPos();
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onVisibilityChange = () => {
      stateRef.current.isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        stateRef.current.isVisible = entry.isIntersecting && !document.hidden;
      });
    });
    intersectionObserver.observe(container);

    // -------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------
    let currentPointer = { x: 0, y: 0 };

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      if (!stateRef.current.isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const { focusTarget, isMobile } = stateRef.current;

      const lerpSpeed = 0.07;
      currentPointer.x += (stateRef.current.targetPointer.x - currentPointer.x) * lerpSpeed;
      currentPointer.y += (stateRef.current.targetPointer.y - currentPointer.y) * lerpSpeed;

      // Animate all 3 robots in synchronized harmony
      robots.forEach((r) => {
        // Individual Blinking
        r.blinkTimer += delta;
        if (!r.isBlinking && r.blinkTimer > r.nextBlinkInterval) {
          r.isBlinking = true;
          r.blinkProgress = 0;
          r.blinkTimer = 0;
          r.nextBlinkInterval = 2.8 + Math.random() * 2.8;
        }

        let naturalEyeScaleY = 1.0;
        if (r.isBlinking) {
          r.blinkProgress += delta * 7;
          if (r.blinkProgress >= Math.PI) {
            r.isBlinking = false;
            naturalEyeScaleY = 1.0;
          } else {
            naturalEyeScaleY = Math.max(0.08, 1 - Math.sin(r.blinkProgress));
          }
        }

        // Focus State Calculations
        let targetHeadX = 0;
        let targetHeadY = 0;
        let targetHeadZ = 0;
        let targetEyesX = 0;
        let targetEyesY = 0;
        let targetEyeClose = naturalEyeScaleY;
        let targetShield = 0;

        if (focusTarget === 'password') {
          // Privacy Mode: All robots turn away politely to the left, tilt down, close eyes, and raise shielding hand
          targetHeadY = -0.56;
          targetHeadX = 0.2;
          targetHeadZ = -0.05;
          targetEyeClose = 0.08;
          targetEyesX = 0;
          targetEyesY = 0;
          targetShield = 1.0;
        } else if (focusTarget === 'email') {
          // Email Focus: Alert, perked up looking towards login form on right
          const px = isMobile ? 0 : currentPointer.x;
          const py = isMobile ? 0 : currentPointer.y;
          targetHeadY = px * 0.38 + 0.16 + r.baseRotY;
          targetHeadX = -py * 0.28;
          targetHeadZ = px * 0.05;
          targetEyesX = px * 0.07 + 0.03;
          targetEyesY = py * 0.04;
          targetShield = 0;
        } else {
          // Normal cursor tracking
          const px = isMobile ? Math.sin(time * 0.7 + r.phaseOffset) * 0.15 : currentPointer.x;
          const py = isMobile ? Math.cos(time * 0.8 + r.phaseOffset) * 0.08 : currentPointer.y;
          targetHeadY = px * 0.38 + r.baseRotY;
          targetHeadX = -py * 0.28;
          targetHeadZ = px * 0.04;
          targetEyesX = px * 0.06;
          targetEyesY = py * 0.035;
          targetShield = 0;
        }

        // Smooth Lerp
        const headLerp = 0.08;
        r.currentHeadRot.x += (targetHeadX - r.currentHeadRot.x) * headLerp;
        r.currentHeadRot.y += (targetHeadY - r.currentHeadRot.y) * headLerp;
        r.currentHeadRot.z += (targetHeadZ - r.currentHeadRot.z) * headLerp;
        r.headPivot.rotation.set(r.currentHeadRot.x, r.currentHeadRot.y, r.currentHeadRot.z);

        r.currentEyesPos.x += (targetEyesX - r.currentEyesPos.x) * headLerp;
        r.currentEyesPos.y += (targetEyesY - r.currentEyesPos.y) * headLerp;
        r.eyesContainer.position.x = r.currentEyesPos.x;
        r.eyesContainer.position.y = r.currentEyesPos.y;

        r.currentEyeScaleY += (targetEyeClose - r.currentEyeScaleY) * 0.18;
        r.eyesContainer.scale.y = Math.max(0.06, r.currentEyeScaleY);

        r.currentHandShield += (targetShield - r.currentHandShield) * 0.09;

        // Idle Floating
        const idleBob = Math.sin(time * 1.6 + r.phaseOffset) * 0.08;
        r.group.position.y = r.baseY + idleBob;
        r.group.position.x = r.baseX + (isMobile ? 0 : currentPointer.x * 0.08);

        // Chest Indicator Pulse
        r.chestLightMat.emissiveIntensity = 1.1 + Math.sin(time * 2.8 + r.phaseOffset) * 0.35;

        // Privacy Hand Shield
        r.leftHandGroup.position.y = 0.1 + Math.sin(time * 1.6 + 1 + r.phaseOffset) * 0.05 + r.currentHandShield * 0.85;
        r.leftHandGroup.position.z = 0.15 + r.currentHandShield * 0.52;
        r.leftHandGroup.position.x = -1.08 + r.currentHandShield * 0.65;
        r.leftHandGroup.rotation.z = r.currentHandShield * 0.6;

        r.rightHandGroup.position.y = 0.1 + Math.sin(time * 1.6 + 2.5 + r.phaseOffset) * 0.05;
        r.rightHandGroup.position.x = 1.08;

        r.tasselCord.rotation.z = -0.38 + Math.sin(time * 2 + r.phaseOffset) * 0.06 + r.currentHeadRot.y * 0.15;
      });

      // Animate background floating cyber particles
      const pArray = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const pm = particleMeta[i];
        const curY = ((pm.baseY + time * pm.speed + 3) % 6) - 3;
        const curX = pm.baseX + Math.sin(time * 0.7 + pm.phase) * pm.sway;
        pArray[i * 3] = curX;
        pArray[i * 3 + 1] = curY;
        pArray[i * 3 + 2] = pm.baseZ;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Rotate 3D holographic stage disc
      holoMesh.rotation.z = time * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver.disconnect();

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      badgeTexture.dispose();
      shadowTexture.dispose();
      dotTexture.dispose();
      holoTexture.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-login-canvas-container"
      aria-label="CampusConnect 3D Mascots"
      role="img"
    />
  );
};

export default ThreeLoginExperience;
