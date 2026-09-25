import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BEVEL, BLUSH, DEPTH, FILL, FRONT, turnAngle } from "./config";
import { FLOWER_SHAPES } from "./outline";

/*
  The flower that stands as the I in the header wordmark, as blush enamel,
  turning around the I's stem.

  Loaded on demand by NairaWordmark — never import this from anything in the
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

/* axisOffset: how far the flower's centre sits from the turning axis, in
   flower heights. The flower's own centre is left of the I's stem; turning
   on the stem makes it circle the letter rather than wobble beside it. */
export function mountNairaFlower(
  canvas: HTMLCanvasElement,
  { axisOffset = 0, onReady }: { axisOffset?: number; onReady?: () => void } = {}
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
  flower.position.x = axisOffset;
  const pivot = new THREE.Group();
  pivot.add(flower);
  scene.add(pivot);

  let raf = 0;
  let last = performance.now();
  let t = 0;
  let drawn = NaN;

  const draw = (angle: number) => {
    pivot.rotation.y = FRONT + angle;
    renderer.render(scene, camera);
    drawn = angle;
  };

  const resize = () => {
    const { clientWidth: cw, clientHeight: ch } = canvas;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    draw(turnAngle(t));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  draw(0);
  onReady?.();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    const angle = turnAngle(t);
    if (angle !== drawn) draw(angle);
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
