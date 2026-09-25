import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BOX, COLOURS, DRAG, EASE, FRONT, HOVER, SPIN } from "./config";

/*
  The Naira drawer box, built from its real parts rather than a photo on a
  cube: a blush card sleeve open at both ends, a tray that slides out of the
  front, black velvet inside, and the wordmark printed on the lid with the
  flower in place of the I.

  Loaded on demand by NairaBox3D — never import this from anything in the
  main bundle, it pulls in three.js.
*/

type Built = { root: THREE.Group; tray: THREE.Group; lining: THREE.Mesh; dispose: () => void };

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

/* Rounded only where the edge is broad enough to catch light. On the thin card
   walls a rounded edge is a few facets wide, and those facets sparkled as a
   dotted line down the corners; square reads as crisper there anyway. */
function slab(w: number, h: number, d: number, material: THREE.Material, radius = 0.006) {
  const geometry = radius > 0 ? new RoundedBoxGeometry(w, h, d, 5, radius) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  // Only the floor takes shadows. The box shading itself showed as a dotted
  // line down the tray front; the lighting already separates the faces.
  return m;
}

function buildBox(print: THREE.Texture): Built {
  const { w, d, h, card, tray } = BOX;
  const grain = paperGrain();
  const geometries: THREE.BufferGeometry[] = [];

  const cardMat = new THREE.MeshPhysicalMaterial({
    color: COLOURS.card,
    roughness: 0.6,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.4,
    sheen: 0.6,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color("#fff1ec"),
    iridescence: 0.22,
    iridescenceIOR: 1.3,
    clearcoat: 0.06,
    clearcoatRoughness: 0.5,
  });
  const edgeMat = cardMat.clone();
  edgeMat.color = new THREE.Color(COLOURS.cardDeep);
  const materials: THREE.Material[] = [];

  const velvet = new THREE.MeshPhysicalMaterial({
    color: COLOURS.velvet,
    roughness: 1,
    sheen: 0.6,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#2f282b"),
    side: THREE.BackSide,
  });

  const printMat = new THREE.MeshStandardMaterial({
    map: print,
    transparent: true,
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });

  const root = new THREE.Group();
  const add = (parent: THREE.Object3D, mesh: THREE.Mesh) => {
    geometries.push(mesh.geometry);
    parent.add(mesh);
    return mesh;
  };

  // Sleeve: one extruded frame, open at the front and back, like the single
  // folded card it is. Built from separate panels it had seams and sub-pixel
  // overlaps that shimmered as dotted lines along the corners while turning.
  const outline = new THREE.Shape();
  const r = 0.01;
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
  const sleeveGeo = new THREE.ExtrudeGeometry(outline, { depth: d, bevelEnabled: false, curveSegments: 6 });
  sleeveGeo.translate(0, 0, -d / 2);
  // The card edge at each open end reads a shade lighter, as it does in the
  // photos. That rim, six pixels and up, is what outlines the drawer front.
  const rimMat = cardMat.clone();
  rimMat.color = new THREE.Color(COLOURS.rim);
  rimMat.polygonOffset = true;
  rimMat.polygonOffsetFactor = -1;
  rimMat.polygonOffsetUnits = -4;
  materials.push(rimMat);
  const sleeve = new THREE.Mesh(sleeveGeo, [rimMat, cardMat]);
  geometries.push(sleeveGeo);
  root.add(sleeve);
  sleeve.castShadow = true;

  // Lid print. Its top edge points to the back, so it reads from the drawer side.
  const printW = w * 0.62;
  const img = print.image as { width: number; height: number };
  const printH = printW * (img.height / img.width);
  const printMesh = add(root, new THREE.Mesh(new THREE.PlaneGeometry(printW, printH), printMat));
  printMesh.rotation.x = -Math.PI / 2;
  printMesh.position.y = h / 2 + 0.0005;

  // Tray: open-topped, slides out of the front (+z).
  const tw = w - card * 2 - 0.003;
  const th = h - card * 2 - 0.003;
  const trayGroup = new THREE.Group();
  add(trayGroup, slab(tw, tray, d, edgeMat, 0)).translateY(-th / 2 + tray / 2);
  // The front sits exactly in the plane of the rim and a touch larger than the
  // opening; the rim is drawn over it where they overlap (polygonOffset on the
  // rim). Cut to the opening it left a hairline crack, and set back by any
  // amount it exposed a strip of inner wall that went sub-pixel mid-turn and
  // flickered as a dashed line. The lighter rim is what marks the drawer.
  add(trayGroup, slab(w - card * 2 + 0.006, h - card * 2 + 0.006, tray, cardMat, 0)).translateZ(d / 2 - tray / 2);
  add(trayGroup, slab(tw, th, tray, edgeMat, 0)).translateZ(-d / 2 + tray / 2);
  add(trayGroup, slab(tray, th, d - tray * 2, edgeMat, 0)).translateX(tw / 2 - tray / 2);
  add(trayGroup, slab(tray, th, d - tray * 2, edgeMat, 0)).translateX(-tw / 2 + tray / 2);
  // Velvet lining, drawn from the inside only so it shows through the open
  // top. Lifted clear of the tray floor; sharing that plane flickered pink.
  const lining = add(
    trayGroup,
    new THREE.Mesh(new THREE.BoxGeometry(tw - tray * 2 - 0.002, th - tray - 0.004, d - tray * 2 - 0.002), velvet)
  );
  lining.position.y = tray / 2 + 0.002;
  // Pull tab at the front, as on the real tray.
  const tab = add(trayGroup, slab(0.16, 0.06, 0.03, edgeMat, 0.012));
  tab.position.set(0, -th / 2 + 0.07, d / 2 + 0.012);
  root.add(trayGroup);

  return {
    root,
    tray: trayGroup,
    lining,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      [cardMat, edgeMat, velvet, printMat, grain, print, ...materials].forEach((x) => x.dispose());
    },
  };
}

export type NairaBoxHandle = {
  setDrawer: (open: boolean) => void;
  readonly drawerOpen: boolean;
  dispose: () => void;
};

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
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  // A tight near/far range: with 0.1–30 the depth buffer could not keep the
  // velvet lining behind the drawer front, and it bled through as dots.
  const camera = new THREE.PerspectiveCamera(24, 1, 1, 15);
  camera.position.set(0, 2.45, 5.15);
  // Aimed slightly forward so the opened tray stays inside the frame.
  camera.lookAt(0, -0.12, 0.22);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(2.2, 8, 1.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  scene.add(key);
  // A cool, low fill from the left so the sides separate from the lid.
  const fill = new THREE.DirectionalLight(0xf3eef3, 0.55);
  fill.position.set(-4, 1.5, 4);
  scene.add(fill);

  const floorGeo = new THREE.CircleGeometry(3.2, 64);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.82;
  floor.receiveShadow = true;
  scene.add(floor);

  const pivot = new THREE.Group();
  scene.add(pivot);

  let box: Built | null = null;
  let disposed = false;
  let angle = FRONT;
  let target = FRONT;
  let drawer = 0;
  let drawerTarget = 0;
  let dragging = false;
  let lastX = 0;
  let downAt: { x: number; y: number; t: number } | null = null;
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

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitsBox = (e: PointerEvent) => {
    if (!box) return false;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(box.root, true).length > 0;
  };

  // Opening turns the drawer to face the viewer first — opened mid-turn it slid
  // out of the far side, where it cannot be seen. The turn waits while the
  // drawer is out and resumes when it closes.
  const setDrawer = (open: boolean) => {
    drawerTarget = open ? 1 : 0;
    if (open) target = FRONT + Math.round((target - FRONT) / (Math.PI * 2)) * Math.PI * 2;
  };

  const onDown = (e: PointerEvent) => {
    if (!hitsBox(e)) return;
    dragging = true;
    lastX = e.clientX;
    downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    target += (e.clientX - lastX) * DRAG;
    lastX = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (dragging && downAt) {
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      if (moved < 6 && performance.now() - downAt.t < 350) setDrawer(drawerTarget === 0);
    }
    dragging = false;
    downAt = null;
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
    if (!dragging && !reducedMotion && drawerTarget === 0) target += SPIN * dt;
    angle += (target - angle) * k;
    pivot.rotation.y = angle;
    if (!reducedMotion) {
      hoverTime += dt;
      const phase = (hoverTime / HOVER.period) * Math.PI * 2;
      pivot.position.y = Math.sin(phase) * HOVER.lift;
      pivot.rotation.x = Math.sin(phase) * HOVER.sway;
      pivot.rotation.z = Math.cos(phase) * HOVER.sway * 0.6;
    }
    // The tray waits until the box has mostly come round to face the viewer.
    const want = Math.abs(target - angle) < 0.35 ? drawerTarget : Math.min(drawerTarget, drawer);
    drawer += (want - drawer) * (1 - Math.pow(0.92, dt * 60));
    box.tray.position.z = drawer * 0.62;
    // Nothing inside shows while the drawer is shut; not drawing the lining
    // then also rules out any trace of it through the front.
    box.lining.visible = drawer > 0.002;
    // Back by half the slide, so the open box stays centred in its frame.
    box.root.position.z = -drawer * 0.31;
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
    setDrawer,
    get drawerOpen() {
      return drawerTarget === 1;
    },
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
