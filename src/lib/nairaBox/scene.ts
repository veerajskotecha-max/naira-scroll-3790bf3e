import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BOX, COLOURS, DRAG, EASE, FRONT, HOVER, REVEAL, RING_SIZE, SPIN, TAP_MS, TAP_PX, TILT } from "./config";

/*
  The Naira drawer box, built from its real parts rather than a photo on a
  cube: a blush card sleeve with a lighter rim at each open end, a drawer with
  a pull tab and black velvet inside, and the wordmark printed on the lid with
  the flower in place of the I. Tap it and the drawer slides out and the
  solitaire from the homepage's ring turn rises from a velvet cushion.

  Loaded on demand by NairaBox3D — never import this from anything in the
  main bundle, it pulls in three.js.
*/

type Built = {
  root: THREE.Group;
  drawer: THREE.Group;
  inner: THREE.Object3D[];
  ring: THREE.Sprite | null;
  ringRest: number;
  glint: THREE.Sprite | null;
  clip: { slot: THREE.Plane; sleeve: THREE.Plane; slotY: number; sleeveZ: number };
  dispose: () => void;
};

function paperGrain(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 20;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

const UP = new THREE.Vector3(0, 1, 0);
const OUT = new THREE.Vector3(0, 0, 1);
const tmp = new THREE.Vector3();
// Deep enough that the whole ring, stone included, sits below the slot.
const RING_SINK = 0.9;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/* A soft four-point star for the glint on the stone, drawn once on a canvas. */
function sparkleTexture(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  const halo = g.createRadialGradient(m, m, 0, m, m, m);
  halo.addColorStop(0, "rgba(255,255,255,0.9)");
  halo.addColorStop(0.15, "rgba(255,250,240,0.35)");
  halo.addColorStop(1, "rgba(255,250,240,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size);
  g.fillStyle = "rgba(255,255,255,0.85)";
  for (const [w, h] of [[size * 0.035, size * 0.48], [size * 0.48, size * 0.035]]) {
    g.beginPath();
    g.ellipse(m, m, w, h, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildBox(print: THREE.Texture, ringTex: THREE.Texture | null): Built {
  const { w, d, h, card, tray } = BOX;
  const grain = paperGrain();
  const geometries: THREE.BufferGeometry[] = [];

  const cardMat = new THREE.MeshPhysicalMaterial({
    color: COLOURS.card,
    // Satin card, not gloss: tilted towards the camera, a shinier lid caught
    // the key light as a hot spot that washed out the print.
    roughness: 0.7,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.35,
    sheen: 0.3,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#fff1ec"),
    iridescence: 0.15,
    iridescenceIOR: 1.3,
  });
  // The card edge at each open end reads a shade lighter, as in the photos;
  // that rim is what outlines the drawer front. It is drawn over the front
  // where the two overlap (polygonOffset), which keeps the join clean.
  const rimMat = cardMat.clone();
  rimMat.color = new THREE.Color(COLOURS.rim);
  rimMat.polygonOffset = true;
  rimMat.polygonOffsetFactor = -1;
  rimMat.polygonOffsetUnits = -4;

  const printMat = new THREE.MeshStandardMaterial({
    map: print,
    transparent: true,
    // Matte ink: a glossier print reflected the room and read as grey.
    roughness: 0.9,
    envMapIntensity: 0.2,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });

  const root = new THREE.Group();
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[]) => {
    geometries.push(geometry);
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    root.add(m);
    return m;
  };

  // Sleeve: one extruded frame, open at both ends, like the single folded card
  // it is. Built from separate panels it had seams and sub-pixel overlaps that
  // shimmered as dotted lines along the corners while turning.
  const outline = new THREE.Shape();
  // Square folds. Rounded, the long edges were a few pixels of facets that
  // caught the light unevenly and dashed whenever a side turned edge-on.
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -h / 2, h / 2];
  outline.moveTo(x0, y0);
  outline.lineTo(x1, y0);
  outline.lineTo(x1, y1);
  outline.lineTo(x0, y1);
  outline.lineTo(x0, y0);
  const opening = new THREE.Path();
  opening.moveTo(x0 + card, y0 + card);
  opening.lineTo(x0 + card, y1 - card);
  opening.lineTo(x1 - card, y1 - card);
  opening.lineTo(x1 - card, y0 + card);
  opening.lineTo(x0 + card, y0 + card);
  outline.holes.push(opening);
  const sleeveGeo = new THREE.ExtrudeGeometry(outline, { depth: d, bevelEnabled: false, curveSegments: 8 });
  sleeveGeo.translate(0, 0, -d / 2);
  mesh(sleeveGeo, [rimMat, cardMat]);

  const velvet = new THREE.MeshPhysicalMaterial({
    color: COLOURS.velvet,
    roughness: 1,
    sheen: 0.6,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#2f282b"),
  });
  // The lining is drawn from the inside only, so it shows through the open top.
  const lining = velvet.clone();
  lining.side = THREE.BackSide;
  const edgeMat = cardMat.clone();
  edgeMat.color = new THREE.Color(COLOURS.cardDeep);
  const extras: { dispose: () => void }[] = [velvet, lining, edgeMat];

  // The back of the sleeve: a panel in the plane of the rim, a touch larger
  // than the opening so the rim covers its edges. Cut to the opening it left a
  // hairline crack; set back by any amount it exposed a strip of inner wall
  // that went sub-pixel mid-turn and flickered.
  const panelW = w - card * 2 + 0.006;
  const panelH = h - card * 2 + 0.006;
  mesh(new THREE.BoxGeometry(panelW, panelH, tray), cardMat).position.z = -d / 2 + tray / 2;

  // The drawer. Its front is the same kind of panel in the front rim plane, so
  // the closed box keeps the clean edge; the body behind it stops short of the
  // back panel so the two never meet.
  const drawer = new THREE.Group();
  root.add(drawer);
  const part = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    geometries.push(geometry);
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    drawer.add(m);
    return m;
  };
  const tw = w - card * 2 - 0.003;
  const th = h - card * 2 - 0.003;
  const front = d / 2 - tray; // back face of the drawer front
  const back = -d / 2 + 0.03;
  const len = front - back;
  const mid = (front + back) / 2;
  part(new THREE.BoxGeometry(panelW, panelH, tray), cardMat).position.z = d / 2 - tray / 2;
  // The body sits a hair inside the sleeve; drawn while the box is shut, its
  // walls showed through near the edges as dashes whenever a side turned
  // almost edge-on. It is only drawn while the drawer is out.
  const body = [
    part(new THREE.BoxGeometry(tw, tray, len), edgeMat),
    part(new THREE.BoxGeometry(tw, th, tray), edgeMat),
    part(new THREE.BoxGeometry(tray, th, len), edgeMat),
    part(new THREE.BoxGeometry(tray, th, len), edgeMat),
  ];
  body[0].position.set(0, -th / 2 + tray / 2, mid);
  body[1].position.z = back + tray / 2;
  body[2].position.set(tw / 2 - tray / 2, 0, mid);
  body[3].position.set(-tw / 2 + tray / 2, 0, mid);
  const liningLen = front - (back + tray) - 0.002;
  const liningMesh = part(new THREE.BoxGeometry(tw - tray * 2 - 0.002, th - tray - 0.004, liningLen), lining);
  liningMesh.castShadow = false;
  liningMesh.position.set(0, tray / 2 + 0.002, back + tray + 0.001 + liningLen / 2);

  // The ring cushion sits towards the front, so the ring clears the lid once
  // the drawer is out.
  const cushionH = 0.3;
  const cushionZ = front - 0.26;
  const cushion = part(new RoundedBoxGeometry(tw - tray * 2 - 0.12, cushionH, 0.36, 4, 0.12), velvet);
  cushion.position.set(0, -th / 2 + tray + cushionH / 2, cushionZ);

  // Pull tab at the front, as on the real tray.
  const tab = part(new RoundedBoxGeometry(0.16, 0.055, 0.028, 3, 0.012), cardMat);
  tab.position.set(0, -panelH / 2 + 0.085, d / 2 + 0.01);

  // The solitaire from the homepage's ring turn, standing in the cushion's
  // slot. A camera-facing sprite reads as the real ring because the box always
  // turns to face the viewer before the drawer opens.
  const cushionTop = -th / 2 + tray + cushionH;
  let ring: THREE.Sprite | null = null;
  let glint: THREE.Sprite | null = null;
  // The box hides the ring the way a real one does, with two cuts updated each
  // frame: nothing below the cushion's slot, and nothing inside the sleeve.
  // Fading it instead left a ghost of the ring floating over the lid while the
  // drawer slid home.
  const clip = { slot: new THREE.Plane(), sleeve: new THREE.Plane(), slotY: cushionTop, sleeveZ: d / 2 };
  if (ringTex) {
    const ringMat = new THREE.SpriteMaterial({ map: ringTex, transparent: true, clippingPlanes: [clip.slot, clip.sleeve] });
    extras.push(ringMat);
    ring = new THREE.Sprite(ringMat);
    // The band's foot sits 18% up the image; anchoring a little above it sinks
    // the band into the slot.
    ring.center.set(0.5, 0.21);
    ring.scale.set(RING_SIZE, RING_SIZE, 1);
    ring.position.set(0, cushionTop, cushionZ);
    drawer.add(ring);

    const glintTex = sparkleTexture();
    const glintMat = new THREE.SpriteMaterial({
      map: glintTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      clippingPlanes: [clip.slot, clip.sleeve],
    });
    extras.push(glintMat, glintTex);
    glint = new THREE.Sprite(glintMat);
    glint.scale.set(0.22, 0.22, 1);
    drawer.add(glint);
  }

  // Lid print. Its top edge points to the back, so it reads from the drawer side.
  const img = print.image as { width: number; height: number };
  const printW = w * 0.62;
  const printMesh = mesh(new THREE.PlaneGeometry(printW, printW * (img.height / img.width)), printMat);
  printMesh.castShadow = false;
  printMesh.rotation.x = -Math.PI / 2;
  printMesh.position.y = h / 2 + 0.0005;

  return {
    root,
    drawer,
    // Nothing inside shows while the drawer is shut; not drawing it then also
    // rules out any trace of it through the front.
    inner: [...body, liningMesh, cushion, ...(ring ? [ring] : []), ...(glint ? [glint] : [])],
    ring,
    ringRest: cushionTop,
    glint,
    clip,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      [cardMat, rimMat, printMat, grain, print, ...extras].forEach((x) => x.dispose());
      ringTex?.dispose();
    },
  };
}

export type NairaBoxHandle = { toggle: () => void; dispose: () => void };

export function mountNairaBox(
  canvas: HTMLCanvasElement,
  {
    printUrl,
    ringUrl,
    reducedMotion = false,
    onReady,
    onOpen,
  }: { printUrl: string; ringUrl?: string; reducedMotion?: boolean; onReady?: () => void; onOpen?: () => void }
): NairaBoxHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  // Crisp on 3x phones; the canvas is small enough that full density is cheap.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.setClearColor(0xffffff, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.4;

  // A tight near/far range keeps the depth buffer exact on thin card edges.
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 15);
  // Lower than a flat-lay: the box leans towards the camera (TILT) instead, so
  // the lid still reads while the front and side carry the form.
  camera.position.set(0, 1.55, 5.3);
  // Aimed below the box so it sits in the upper middle, with its shadow under it.
  camera.lookAt(0, -0.28, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(2.2, 8, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 20;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  scene.add(key);
  // A cool fill from the front left: with the lid leaning forward the drawer
  // front faces slightly down and went muddy without it.
  const fill = new THREE.DirectionalLight(0xf3eef3, 0.95);
  fill.position.set(-3, 2, 5);
  scene.add(fill);
  // A faint back light that picks out the lid's far edge against the ground.
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
  rimLight.position.set(0, 3, -6);
  scene.add(rimLight);

  const floorGeo = new THREE.CircleGeometry(3.2, 64);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.95;
  floor.receiveShadow = true;
  scene.add(floor);

  // Tilt on an outer group, turn on an inner one, so the lean stays towards
  // the viewer while the box spins.
  const lean = new THREE.Group();
  lean.rotation.x = TILT;
  scene.add(lean);
  const pivot = new THREE.Group();
  lean.add(pivot);

  let box: Built | null = null;
  let disposed = false;
  let angle = FRONT;
  let target = FRONT;
  let press: { x: number; y: number; t: number } | null = null;
  let dragging = false;
  let lastX = 0;
  let raf = 0;
  let visible = true;
  let last = performance.now();
  let hoverTime = 0;

  // "turn" is the Bluorng spin, a full 360 that nothing interrupts on its own.
  // A tap runs "face" (round to the three-quarter view) and "open"; the box
  // then holds, ring up, until the next tap or a drag closes it.
  type Phase = "turn" | "face" | "open" | "hold" | "close";
  let phase: Phase = "turn";
  let phaseTime = 0;
  let faceFrom = 0;
  let faceTo = 0;
  let faceFor = 1;
  let drawer = 0;
  let drawerFrom = 0;
  const go = (next: Phase) => {
    phase = next;
    phaseTime = 0;
    drawerFrom = drawer;
  };

  const loader = new THREE.TextureLoader();
  const load = (url: string) =>
    new Promise<THREE.Texture | null>((resolve) => loader.load(url, resolve, undefined, () => resolve(null)));
  Promise.all([load(printUrl), ringUrl ? load(ringUrl) : Promise.resolve(null)]).then(([tex, ringTex]) => {
    if (disposed || !tex) {
      tex?.dispose();
      ringTex?.dispose();
      return;
    }
    for (const t of [tex, ringTex]) {
      if (!t) continue;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    // Without the ring photo there is nothing to reveal, so the box just turns.
    // Reduced motion keeps the reveal: it only ever runs when asked for.
    box = buildBox(tex, ringTex);
    pivot.add(box.root);
    pivot.rotation.y = angle;
    box.inner.forEach((o) => (o.visible = false));
    renderer.render(scene, camera);
    onReady?.();
  });

  const resize = () => {
    const { clientWidth: cw, clientHeight: ch } = canvas;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Drag to spin, as on Bluorng; tap to open. Only a press that lands on the
  // box counts, so a swipe across the empty stage still scrolls the page.
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitsBox = (e: PointerEvent) => {
    if (!box) return false;
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(box.root, true).length > 0;
  };

  const toggle = () => {
    if (!box?.ring) return;
    if (phase === "turn") {
      // Round to the NEAREST front-facing angle, so the box never swings more
      // than half a turn to present the drawer.
      faceFrom = angle;
      faceTo = FRONT + Math.round((angle - FRONT) / (Math.PI * 2)) * Math.PI * 2;
      faceFor = Math.max(0.35, Math.abs(faceTo - faceFrom) / REVEAL.faceSpeed);
      go("face");
      onOpen?.();
    } else if (phase === "close") {
      go("open");
    } else {
      target = angle;
      go(drawer > 0 ? "close" : "turn");
    }
  };

  const onDown = (e: PointerEvent) => {
    if (!hitsBox(e)) return;
    press = { x: e.clientX, y: e.clientY, t: performance.now() };
    lastX = e.clientX;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!press) {
      if (e.pointerType === "mouse") canvas.style.cursor = hitsBox(e) ? "pointer" : "";
      return;
    }
    if (!dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) >= TAP_PX) {
      dragging = true;
      canvas.style.cursor = "grabbing";
      // A drag takes over: an open box closes and the turn resumes from
      // wherever the shopper leaves it.
      if (phase !== "turn") {
        target = angle;
        go(drawer > 0 ? "close" : "turn");
      }
    }
    if (!dragging) return;
    target += (e.clientX - lastX) * DRAG;
    lastX = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (press && !dragging && performance.now() - press.t < TAP_MS) toggle();
    onCancel(e);
  };
  const onCancel = (e: PointerEvent) => {
    press = null;
    dragging = false;
    canvas.style.cursor = e.pointerType === "mouse" && hitsBox(e) ? "pointer" : "";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || !box) return;
    // Easing is tuned per 60fps frame; scale it so 120Hz screens feel the same.
    const k = 1 - Math.pow(1 - EASE, dt * 60);
    phaseTime += dt;

    if (phase === "turn") {
      if (!dragging && !reducedMotion) target += SPIN * dt;
      angle += (target - angle) * k;
    } else if (phase === "face") {
      const t = Math.min(phaseTime / faceFor, 1);
      angle = faceFrom + (faceTo - faceFrom) * easeInOut(t);
      target = angle;
      if (t >= 1) go("open");
    } else {
      angle += (target - angle) * k;
      if (phase === "open") {
        const t = Math.min(phaseTime / REVEAL.open, 1);
        drawer = drawerFrom + (1 - drawerFrom) * easeOut(t);
        if (t >= 1) go("hold");
      } else if (phase === "close") {
        const t = Math.min(phaseTime / REVEAL.close, 1);
        drawer = drawerFrom * (1 - easeInOut(t));
        if (t >= 1) {
          drawer = 0;
          go("turn");
        }
      }
    }
    pivot.rotation.y = angle;

    box.drawer.position.z = drawer * REVEAL.slide;
    // Back by half the slide, so the open box stays centred in its frame.
    box.root.position.z = -drawer * REVEAL.slide * 0.5;
    const open = drawer > 0.002;
    box.inner.forEach((o) => (o.visible = open));
    if (box.ring) {
      // The ring waits down in its slot until the drawer is nearly out, then
      // lifts into view; closing, it sinks back before the drawer slides home.
      // SINK takes the whole ring below the slot, so the clip hides it fully.
      const rise = smoothstep(0.72, 1, drawer);
      box.ring.position.y = box.ringRest - RING_SINK * (1 - rise);
      box.root.updateMatrixWorld(true);
      const up = UP.clone().transformDirection(box.root.matrixWorld);
      const out = OUT.clone().transformDirection(box.root.matrixWorld);
      box.clip.slot.setFromNormalAndCoplanarPoint(up, box.drawer.localToWorld(tmp.set(0, box.clip.slotY, 0)));
      box.clip.sleeve.setFromNormalAndCoplanarPoint(out, box.root.localToWorld(tmp.set(0, 0, box.clip.sleeveZ)));
      if (box.glint) {
        // A glint on the stone every few seconds while the ring is up.
        const g = phase === "hold" ? Math.sin(Math.min((phaseTime % REVEAL.glintEvery) / 1.2, 1) * Math.PI) : 0;
        box.glint.material.opacity = g * 0.9;
        box.glint.material.rotation = phaseTime * 0.8;
        // The stone sits 76% up the photo; the sprite is anchored at 21%.
        box.glint.position.set(box.ring.position.x, box.ring.position.y + RING_SIZE * (0.76 - 0.21), box.ring.position.z + 0.01);
      }
    }
    if (!reducedMotion) {
      hoverTime += dt;
      const phase = (hoverTime / HOVER.period) * Math.PI * 2;
      lean.position.y = Math.sin(phase) * HOVER.lift;
      lean.rotation.x = TILT + Math.sin(phase) * HOVER.sway;
      lean.rotation.z = Math.cos(phase) * HOVER.sway * 0.6;
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  // Nothing to draw while it is off screen.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = performance.now();
  });
  io.observe(canvas);

  return {
    toggle,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      box?.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
