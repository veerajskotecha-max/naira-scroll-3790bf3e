import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BEVEL, DEPTH, FILL, FRONT, BLUSH, HOVER, SPIN } from "./config";
import { FLOWER_SHAPES } from "./outline";

/*
  The brand-deck flower as a small blush enamel charm beside the header wordmark,
  turning at the Naira box's pace.

  Loaded on demand by NairaFlower3D — never import this from anything in the
  main bundle, it pulls in three.js. It shares that chunk with the box scene.
*/

export type NairaFlowerHandle = { dispose: () => void };

function buildFlower() {
  const shapes = FLOWER_SHAPES.map((pts) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) s.lineTo(pts[i], pts[i + 1]);
    s.closePath();
    return s;
  });
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: DEPTH,
    // A rounded edge is what catches the light as it turns; a flat-cut edge
    // went dark and the flower vanished for a beat at each quarter-turn.
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL * 0.7,
    bevelSegments: 3,
    curveSegments: 4,
  });
  geometry.translate(0, 0, -DEPTH / 2);
  geometry.computeVertexNormals();
  return geometry;
}

export function mountNairaFlower(
  canvas: HTMLCanvasElement,
  { onReady }: { onReady?: () => void } = {}
): NairaFlowerHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  // The canvas is a few dozen CSS pixels; full density keeps the petals crisp
  // and still costs next to nothing.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.setClearColor(0xffffff, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  // A soft room for the glaze to reflect, so the bevels pick out the shape.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  scene.environmentIntensity = 1.1;

  // Tight near/far, as for the box, so the bevels do not fight in depth.
  const FOV = 22;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10);
  // Distance at which the 1-unit-tall flower fills FILL of the frame.
  camera.position.set(0, 0, 1 / FILL / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
  camera.lookAt(0, 0, 0);

  // Key from high and to the side: from the front it glared straight back off
  // the flat face and the flower read pale cream when face-on.
  const key = new THREE.DirectionalLight(0xfff4e6, 1.6);
  key.position.set(4, 4, 1.2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(-3, 1, -3);
  scene.add(rim);

  const geometry = buildFlower();
  const material = new THREE.MeshPhysicalMaterial({
    color: BLUSH.base,
    metalness: 0,
    roughness: BLUSH.roughness,
    // The glaze: a clear coat that keeps a crisp glint on the bevels.
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });
  const flower = new THREE.Mesh(geometry, material);

  // Float on the outer group, turn on the inner one.
  const float = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.add(flower);
  float.add(pivot);
  scene.add(float);

  let angle = FRONT;
  let raf = 0;
  let last = performance.now();
  let t = 0;

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

  const draw = () => {
    pivot.rotation.y = angle;
    const phase = (t / HOVER.period) * Math.PI * 2;
    float.position.y = Math.sin(phase) * HOVER.lift;
    float.rotation.z = Math.cos(phase) * HOVER.sway;
    renderer.render(scene, camera);
  };
  draw();
  onReady?.();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    angle += SPIN * dt;
    t += dt;
    draw();
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
