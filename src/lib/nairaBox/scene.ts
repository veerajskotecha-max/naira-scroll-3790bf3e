import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BOX, COLOURS, DRAG, EASE, FRONT, HOVER, SPIN, TILT } from "./config";

/*
  The Naira drawer box, closed, built from its real parts rather than a photo
  on a cube: a blush card sleeve with a lighter rim at each open end, the
  drawer's front and back showing through those ends, a pull tab, and the
  wordmark printed on the lid with the flower in place of the I.

  Loaded on demand by NairaBox3D — never import this from anything in the
  main bundle, it pulls in three.js.
*/

type Built = { root: THREE.Group; dispose: () => void };

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

function buildBox(print: THREE.Texture): Built {
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
  const r = 0.012;
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -h / 2, h / 2];
  outline.moveTo(x0 + r, y0);
  outline.lineTo(x1 - r, y0);
  outline.quadraticCurveTo(x1, y0, x1, y0 + r);
  outline.lineTo(x1, y1 - r);
  outline.quadraticCurveTo(x1, y1, x1 - r, y1);
  outline.lineTo(x0 + r, y1);
  outline.quadraticCurveTo(x0, y1, x0, y1 - r);
  outline.lineTo(x0, y0 + r);
  outline.quadraticCurveTo(x0, y0, x0 + r, y0);
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

  // The drawer, seen only through the two open ends: a front and a back panel
  // in the plane of the rim, a touch larger than the opening so the rim
  // covers their edges. Cut to the opening they left a hairline crack; set
  // back by any amount they exposed a strip of inner wall that went sub-pixel
  // mid-turn and flickered.
  const panelW = w - card * 2 + 0.006;
  const panelH = h - card * 2 + 0.006;
  mesh(new THREE.BoxGeometry(panelW, panelH, tray), cardMat).position.z = d / 2 - tray / 2;
  mesh(new THREE.BoxGeometry(panelW, panelH, tray), cardMat).position.z = -d / 2 + tray / 2;

  // Pull tab at the front, as on the real tray.
  const tab = mesh(new RoundedBoxGeometry(0.16, 0.055, 0.028, 3, 0.012), cardMat);
  tab.position.set(0, -panelH / 2 + 0.085, d / 2 + 0.01);

  // Lid print. Its top edge points to the back, so it reads from the drawer side.
  const img = print.image as { width: number; height: number };
  const printW = w * 0.62;
  const printMesh = mesh(new THREE.PlaneGeometry(printW, printW * (img.height / img.width)), printMat);
  printMesh.castShadow = false;
  printMesh.rotation.x = -Math.PI / 2;
  printMesh.position.y = h / 2 + 0.0005;

  return {
    root,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      [cardMat, rimMat, printMat, grain, print].forEach((x) => x.dispose());
    },
  };
}

export type NairaBoxHandle = { dispose: () => void };

export function mountNairaBox(
  canvas: HTMLCanvasElement,
  { printUrl, reducedMotion = false, onReady }: { printUrl: string; reducedMotion?: boolean; onReady?: () => void }
): NairaBoxHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  // Crisp on 3x phones; the canvas is small enough that full density is cheap.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.setClearColor(0xffffff, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;

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
  let dragging = false;
  let lastX = 0;
  let raf = 0;
  let visible = true;
  let last = performance.now();
  let hoverTime = 0;

  new THREE.TextureLoader().load(printUrl, (tex) => {
    if (disposed) return tex.dispose();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    box = buildBox(tex);
    pivot.add(box.root);
    pivot.rotation.y = angle;
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

  // Drag to spin, as on Bluorng: only a press that lands on the box starts it,
  // so a swipe across the empty stage still scrolls the page.
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitsBox = (e: PointerEvent) => {
    if (!box) return false;
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(box.root, true).length > 0;
  };
  const onDown = (e: PointerEvent) => {
    if (!hitsBox(e)) return;
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    target += (e.clientX - lastX) * DRAG;
    lastX = e.clientX;
  };
  const onUp = () => {
    dragging = false;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || !box) return;
    // Easing is tuned per 60fps frame; scale it so 120Hz screens feel the same.
    const k = 1 - Math.pow(1 - EASE, dt * 60);
    if (!dragging && !reducedMotion) target += SPIN * dt;
    angle += (target - angle) * k;
    pivot.rotation.y = angle;
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
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      box?.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
