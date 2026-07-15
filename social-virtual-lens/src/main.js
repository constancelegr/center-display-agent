import "./styles.css";
import * as THREE from "three";
import { createIcons, icons } from "lucide";

const canvas = document.querySelector("#simulator");
const speedReadout = document.querySelector("#speedReadout");
const comfortReadout = document.querySelector("#comfortReadout");
const scenarioList = document.querySelector("#scenarioList");
const scenarioCounter = document.querySelector("#scenarioCounter");
const intentLabel = document.querySelector("#intentLabel");
const intentCopy = document.querySelector("#intentCopy");
const nextMove = document.querySelector("#nextMove");
const signalDot = document.querySelector("#signalDot");
const guidanceStatus = document.querySelector("#guidanceStatus");
const steeringWheel = document.querySelector(".wheel");
const interpretationPanel = document.querySelector(".interpretation");
const decisionPanel = document.querySelector("#decisionPanel");
const stopChoice = document.querySelector("#stopChoice");
const pathChoice = document.querySelector("#pathChoice");
const rearAlert = document.querySelector("#rearAlert");
const wheelStatus = document.querySelector("#wheelStatus");
const wheelStatusValue = wheelStatus?.querySelector("strong");
const steeringReadout = document.querySelector("#steeringReadout");
const gamepadHint = document.querySelector("#gamepadHint");
const keyboardMode = document.querySelector("#keyboardMode");
const g29Mode = document.querySelector("#g29Mode");

const lensToggle = document.querySelector("#lensToggle");
const guidanceToggle = document.querySelector("#guidanceToggle");
const soundToggle = document.querySelector("#soundToggle");
const pauseToggle = document.querySelector("#pauseToggle");
const speedUp = document.querySelector("#speedUp");
const speedDown = document.querySelector("#speedDown");
const steerLeft = document.querySelector("#steerLeft");
const steerRight = document.querySelector("#steerRight");

const scenarioDefinitions = [
  {
    id: "yielding",
    icon: "move-diagonal",
    title: "Yielding Merge",
    micro: "Space opening",
    intent: "Merging car",
    copy: "Right-lane car is moving into the opening.",
    next: "Hold course; the gap is forming.",
    color: "#97f6b0",
    comfort: 88,
    recommendedSpeed: 26,
    introDistance: 20,
    introDelay: 2.4,
    promptDelay: 2.4,
    loopDuration: 12.2,
    vehicles: [
      { name: "lead", lane: 0, z: -74, speed: 0.02, color: "#44525a", accent: "#e84f4a" },
      { name: "yield", lane: -0.78, z: -24, speed: 0.02, color: "#526163", accent: "#e84f4a", glow: "green" },
      {
        name: "merge",
        lane: 1,
        z: -36,
        speed: 0.02,
        mergeToLane: 0,
        mergeToZ: -50,
        mergeStart: 0.5,
        mergeEnd: 4.4,
        mergeYaw: -0.16,
        color: "#38474f",
        accent: "#f5d46e",
        glow: "green"
      }
    ],
    overlays: [
      { type: "vehicle-outline", target: "merge", color: "#97f6b0", yieldingCue: "merge-focus" },
      { type: "wait-aura", target: "merge", color: "#97f6b0", yieldingCue: "merge-focus" },
      { type: "merge-icon", target: "merge", color: "#97f6b0", yieldingCue: "merge-icon" },
      {
        type: "opening",
        lane: 0,
        z: -40,
        target: "merge",
        color: "#97f6b0",
        choice: "yield",
        yieldingCue: "opening",
        followTargetZOffset: 7.5,
        label: "Hold space"
      },
      { type: "trail", target: "merge", color: "#7df6e8", side: -1, yieldingCue: "merge-trail" },
      { type: "continuous-path", lane: 0, color: "#97f6b0", choice: "proceed", yieldingCue: "forward-path" }
    ]
  },
  {
    id: "emergency",
    icon: "siren",
    title: "Emergency Vehicle",
    micro: "Make way",
    intent: "Emergency vehicle behind you",
    copy: "Passing left, merging center.",
    next: "Follow the guide right and slow down.",
    color: "#7df6e8",
    comfort: 61,
    recommendedSpeed: 22,
    introDistance: 19,
    introDelay: 2.5,
    loopDuration: 18.2,
    vehicles: [
      { name: "traffic-left", lane: -1, z: -28, speed: -0.02, color: "#3f4d56", accent: "#e84f4a" },
      { name: "traffic-center", lane: 0, z: -40, speed: 0.03, color: "#46535a", accent: "#e84f4a" },
      { name: "traffic-right", lane: 1, z: -36, speed: -0.01, color: "#34424b", accent: "#f5d46e" },
      {
        name: "emergency",
        lane: -1,
        z: -42,
        speed: 0,
        color: "#ffffff",
        accent: "#7df6e8",
        glow: "blue",
        emergency: true,
        approachFromBehind: true,
        approachStart: 0.62,
        approachEnd: 12,
        approachStartLane: -1.34,
        approachStartZ: 3.15,
        approachEndZ: -42,
        mergeToLane: 0,
        mergeStart: 1.35,
        mergeEnd: 5.2,
        mergeYaw: 0.24
      }
    ],
    overlays: [
      { type: "vehicle-outline", target: "emergency", color: "#7df6e8", style: "glow" },
      { type: "emergency-icon", target: "emergency", color: "#7df6e8" },
      { type: "trail", target: "emergency", color: "#7df6e8", side: 0 },
      { type: "guide", lane: 0, toLane: 1, z: -5, color: "#97f6b0" }
    ]
  },
  {
    id: "compression",
    icon: "align-vertical-space-around",
    title: "Traffic Compression",
    micro: "Accident ahead",
    intent: "Accident ahead - right lane",
    copy: "Right lane blocked about 200 ft ahead.",
    next: "Reduce speed; follow the left guide.",
    color: "#ff7e78",
    comfort: 48,
    recommendedSpeed: 16,
    introDistance: 23,
    loopDuration: 36,
    vehicles: [
      { name: "near", lane: 0, z: -30, trafficFlow: 0.82, color: "#46535a", accent: "#ff3832", brake: true },
      { name: "mid", lane: 0, z: -47, trafficFlow: 0.76, color: "#303d45", accent: "#ff3832", brake: true },
      { name: "left", lane: -1, z: -39, trafficFlow: 0.96, color: "#4e5961", accent: "#e84f4a" },
      { name: "right", lane: 1, z: -54, trafficFlow: 0.72, color: "#3c484f", accent: "#ff3832", brake: true },
      { name: "accident", lane: 1.06, z: -62, trafficFlow: 0, yaw: -0.52, color: "#293239", accent: "#ff3832", brake: true, glow: "red" },
      { name: "blocked", lane: 1.42, z: -67, trafficFlow: 0, yaw: 0.36, color: "#586268", accent: "#ff7e78", brake: true, glow: "red" }
    ],
    overlays: [
      { type: "vehicle-outline", target: "accident", color: "#ff7e78", style: "glow", halo: false },
      { type: "accident-marker", target: "accident", color: "#ff7e78", label: "Accident 200 ft right", ring: false },
      { type: "distance-cue", lane: 1, z: -13.2, color: "#7df6e8", label: "200 ft right lane", ring: false },
      { type: "speed-cue", lane: 0, z: -5.8, color: "#97f6b0", label: "Traffic pace" },
      { type: "guide", lane: 0, toLane: -1, z: -6.2, color: "#97f6b0" }
    ]
  },
  {
    id: "right-of-way",
    icon: "badge-help",
    title: "Unclear Right of Way",
    micro: "Waiting signal",
    intent: "Waiting vehicle",
    copy: "Cross-traffic is holding.",
    next: "Choose: stop or continue.",
    color: "#8fb5ff",
    comfort: 76,
    recommendedSpeed: 30,
    introDistance: 21,
    introDelay: 2,
    loopDuration: 17.5,
    vehicles: [
      { name: "waiter", lane: 1.55, z: -38, speed: 0.0, yaw: Math.PI / 2, color: "#485863", accent: "#f5d46e", glow: "blue" },
      { name: "lead", lane: 0, z: -60, speed: 0.08, color: "#34424b", accent: "#e84f4a" }
    ],
    overlays: [
      { type: "vehicle-outline", target: "waiter", color: "#8fb5ff" },
      { type: "wait-aura", target: "waiter", color: "#8fb5ff" },
      { type: "wait-icon", target: "waiter", color: "#8fb5ff" },
      { type: "hold-zone", lane: 0, z: -31.8, color: "#ffd166", choice: "stop" },
      { type: "continuous-path", lane: 0, color: "#97f6b0", choice: "follow", rightOfWayCue: "proceed-path" },
      { type: "crosswalk", z: -34, color: "#b99cff" },
    ]
  },
  {
    id: "hazard",
    icon: "construction",
    title: "Road Surface Hazard",
    micro: "Cone ahead",
    intent: "Road condition exposed",
    copy: "Hazard ahead in the right wheel path.",
    next: "Steer left around the cone.",
    color: "#ffc863",
    comfort: 58,
    recommendedSpeed: 18,
    introDistance: 20,
    loopDuration: 18.5,
    vehicles: [
      { name: "lead", lane: -1, z: -48, speed: 0.02, color: "#48575e", accent: "#e84f4a" },
      { name: "right", lane: 1, z: -35, speed: 0.02, color: "#36454d", accent: "#f5d46e" }
    ],
    overlays: [
      { type: "hazard", lane: 0.26, z: -22, color: "#ffc863" },
      { type: "guide", lane: 0, toLane: -1, z: -4.8, color: "#97f6b0" },
      { type: "vehicle-outline", target: "right", color: "#7df6e8" }
    ]
  }
];

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false
  });
} catch (error) {
  showWebGLFallback(error);
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9eadac, 0.009);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 260);
camera.position.set(0, 1.58, 4.7);
camera.rotation.set(THREE.MathUtils.degToRad(-3.2), 0, 0);

const clock = new THREE.Clock();
const world = new THREE.Group();
const trafficGroup = new THREE.Group();
const overlayGroup = new THREE.Group();
const hazardGroup = new THREE.Group();
const roadMarkGroup = new THREE.Group();
const roadsideGroup = new THREE.Group();
scene.add(world, trafficGroup, overlayGroup, hazardGroup);

const state = {
  scenarioIndex: 0,
  speed: 0,
  targetSpeed: 0,
  roadOffset: 0,
  lateral: 0,
  targetLateral: 0,
  wheelAngle: 0,
  decisionChoice: "follow",
  decisionMade: false,
  rightOfWayStopZ: null,
  rightOfWayStopMarkerStartZ: null,
  stopStartSpeed: 0,
  stopDecisionTime: 0,
  rightOfWayYieldTime: null,
  scenarioElapsed: 0,
  scenarioStartTime: 0,
  holdCompleteTime: null,
  spaceHeld: false,
  keyboardSpaceHeld: false,
  keyboardGasHeld: false,
  wheelBrakeHeld: false,
  holdStartTime: null,
  holdStartSpeed: 0,
  inputMode: "g29",
  compressionTrafficReleased: false,
  yieldingChoiceTime: 0,
  yieldingMergeReadyTime: null,
  lensOn: true,
  guidanceOn: true,
  soundOn: true,
  paused: false,
  time: 0,
  steeringImpulse: 0
};

const laneWidth = 3.55;
const lateralLeftLimit = 4.7;
const lateralRightLimit = 4.45;
const rightOfWayStopPointLocalZ = 0;
const rightOfWayStopPointTargetZ = 2.35;
const emergencySirenVolume = 0.085;
const wheelDeadzone = 0.055;
const wheelResponseCurve = 0.44;
const holdStopDuration = 3;
const brakePressThreshold = 0.18;
const brakeReleaseThreshold = 0.1;
const wheelLeftLimit = 4.65;
const wheelRightLimit = 4.4;
const maxVehicleSpeed = 80;
const g29DevicePattern = /g29|driving force racing wheel|vendor:\s*046d product:\s*c24f/i;
const wheelDevicePattern = /logitech|g29|g920|g923|driving force|steering|wheel/i;
const g29BrakeAxis = 5;
const g29GasAxis = 2;
const g29BrakeAxisCandidates = [g29BrakeAxis, 3, 4, 6, 7, 1];
const g29GasAxisCandidates = [g29GasAxis, 1, 3, 4, 6, 7];
const brakeAxisCandidates = [5, 3, 4, 6, 7, 1, 2];
const gasAxisCandidates = [2, 1, 3, 4, 6, 7, 5];
const gasPressThreshold = 0.08;
const proceedButtonCandidates = [0, 1, 2, 3];
const proceedButtonPressThreshold = 0.55;
const centerDisplayChannelName = "social-lens:center-display";
const centerDisplayConeSyncEnabled = false;
const centerDisplayConePassZ = 7.5;
const centerDisplayTelemetryMinInterval = 90;
const visibleVehicleMap = new Map();
const siren = {
  context: null,
  oscillator: null,
  gain: null,
  lfo: null,
  lfoGain: null,
  audio: null,
  active: false
};
const wheelInput = {
  index: null,
  axis: 0,
  connected: false,
  axisRest: [],
  brakeAxis: null,
  brakeButton: null,
  brakeHeld: false,
  brakeAmount: 0,
  gasAxis: null,
  gasAmount: 0,
  proceedButtonHeld: false,
  lastProceedButton: null,
  lastAxis: 0
};
let wheelScanTimer = null;
let wheelScanActive = false;

const materials = {};
let centerDisplayCone = null;
let centerDisplayChannel = null;
let centerDisplaySocket = null;
let centerDisplaySocketRetry = 0;
let lastCenterDisplayTelemetryTime = 0;
let centerDisplayTelemetrySentCount = 0;
createScene();
createScenarioButtons();
createIcons({ icons });
bindCenterDisplayConeEvents();
activateScenario(0);
bindControls();
resize();
animate();
window.setInterval(publishCenterDisplayTelemetry, centerDisplayTelemetryMinInterval);

function showWebGLFallback(error) {
  document.body.classList.add("webgl-unavailable");
  const fallback = document.createElement("section");
  fallback.className = "webgl-fallback";
  fallback.innerHTML = `
    <strong>Chrome graphics is blocking the simulator</strong>
    <p>Open Chrome settings and turn on graphics acceleration, then relaunch Chrome. You can also try the fresh Chrome window I opened.</p>
    <small>${error?.message || "WebGL context could not be created."}</small>
  `;
  document.querySelector("#app")?.appendChild(fallback);
}

function createScene() {
  scene.background = createSkyTexture();

  const hemi = new THREE.HemisphereLight(0xdceff2, 0x364044, 1.05);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff2d2, 3.9);
  sun.position.set(-11, 18, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 75;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x8fb5ff, 0.58);
  fill.position.set(9, 7, 8);
  scene.add(fill);

  materials.road = new THREE.MeshStandardMaterial({
    map: createAsphaltTexture(),
    color: 0x555d5c,
    roughness: 0.92,
    metalness: 0.02
  });
  materials.road.map.wrapS = THREE.RepeatWrapping;
  materials.road.map.wrapT = THREE.RepeatWrapping;
  materials.road.map.repeat.set(4.2, 28);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(13.8, 260, 12, 80), materials.road);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -82;
  road.receiveShadow = true;
  world.add(road);

  const shoulderTexture = createShoulderTexture();
  shoulderTexture.wrapS = THREE.RepeatWrapping;
  shoulderTexture.wrapT = THREE.RepeatWrapping;
  shoulderTexture.repeat.set(1.1, 26);
  const shoulderMaterial = new THREE.MeshStandardMaterial({
    map: shoulderTexture,
    color: 0x596461,
    roughness: 0.9
  });
  materials.shoulder = shoulderMaterial;

  [-1, 1].forEach((side) => {
    const shoulder = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 260), shoulderMaterial);
    shoulder.rotation.x = -Math.PI / 2;
    shoulder.position.set(side * 8.3, 0.006, -82);
    shoulder.receiveShadow = true;
    world.add(shoulder);
  });

  const groundTexture = createGroundTexture();
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(12, 22);
  materials.ground = new THREE.MeshStandardMaterial({ map: groundTexture, color: 0x8f937d, roughness: 0.98 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(170, 260), materials.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.035, -82);
  ground.receiveShadow = true;
  world.add(ground);
  ground.renderOrder = -1;
  world.add(roadsideGroup);

  createLaneMarks();
  createRoadside();
  createIntersectionDetails();
  createCabinReflections();
}

function createLaneMarks() {
  const laneMaterial = new THREE.MeshBasicMaterial({
    color: 0xf1f3e9,
    transparent: true,
    opacity: 0.82
  });
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4d35e,
    transparent: true,
    opacity: 0.7
  });
  const rumbleMaterial = new THREE.MeshBasicMaterial({
    color: 0xd7d2b7,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  });
  const reflectorMaterial = new THREE.MeshBasicMaterial({
    color: 0x95fff0,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });

  [-laneWidth / 2, laneWidth / 2].forEach((x) => {
    for (let i = 0; i < 34; i += 1) {
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 4.4), laneMaterial);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(x, 0.018, -i * 8 - 4);
      roadMarkGroup.add(mark);
    }
  });

  [-6.4, 6.4].forEach((x) => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 260), edgeMaterial);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.02, -82);
    roadMarkGroup.add(edge);
  });

  [-6.05, 6.05].forEach((x) => {
    for (let i = 0; i < 42; i += 1) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.075), rumbleMaterial);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(x, 0.027, -i * 6.2 - 3.2);
      roadMarkGroup.add(strip);
    }
  });

  [-6.28, 6.28].forEach((x) => {
    for (let i = 0; i < 30; i += 1) {
      const reflector = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.28), reflectorMaterial);
      reflector.rotation.x = -Math.PI / 2;
      reflector.position.set(x, 0.03, -i * 8.8 - 6.6);
      roadMarkGroup.add(reflector);
    }
  });

  for (let i = 0; i < 28; i += 1) {
    const leftTrack = -0.72 + (randomUnit(i, 17) - 0.5) * 0.18;
    const rightTrack = 0.72 + (randomUnit(i, 23) - 0.5) * 0.18;
    [leftTrack, rightTrack].forEach((x, sideIndex) => {
      const scuffMaterial = new THREE.MeshBasicMaterial({
        color: 0x1e2524,
        transparent: true,
        opacity: 0.07 + randomUnit(i, 29 + sideIndex) * 0.07,
        depthWrite: false
      });
      const scuff = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18 + randomUnit(i, 31 + sideIndex) * 0.16, 3.2 + randomUnit(i, 37 + sideIndex) * 4.2),
        scuffMaterial
      );
      scuff.rotation.x = -Math.PI / 2;
      scuff.rotation.z = THREE.MathUtils.degToRad((randomUnit(i, 41 + sideIndex) - 0.5) * 3);
      scuff.position.set(x, 0.024, -i * 9.4 - 8 + randomUnit(i, 43 + sideIndex) * 2.8);
      roadMarkGroup.add(scuff);
    });
  }

  world.add(roadMarkGroup);
}

function createRoadside() {
  roadsideGroup.clear();
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x424b4a, roughness: 0.78, metalness: 0.2 });
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0x273c3e, roughness: 0.58, metalness: 0.1 });
  const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.78 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3528, roughness: 0.9 });
  const shrubMaterial = new THREE.MeshStandardMaterial({ color: 0x3f6752, roughness: 0.96 });
  const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x6f7771, roughness: 0.82 });
  const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x788681, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x8a8178, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x6d777e, roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0x596965, roughness: 0.88 })
  ];
  const treeMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x527965, roughness: 0.92 }),
    new THREE.MeshStandardMaterial({ color: 0x496d59, roughness: 0.94 }),
    new THREE.MeshStandardMaterial({ color: 0x5f8065, roughness: 0.92 })
  ];
  const loopLength = 286;

  const addSceneryCluster = (cluster, z, loopResetZ = 22) => {
    cluster.userData.loopLength = loopLength;
    cluster.userData.loopResetZ = loopResetZ;
    cluster.position.z = z;
    roadsideGroup.add(cluster);
  };

  for (let i = 0; i < 32; i += 1) {
    const z = -i * 9.4 - 18 + randomUnit(i, 5) * 2.1;
    [-1, 1].forEach((side) => {
      const cluster = new THREE.Group();
      cluster.position.x = side * (8.75 + randomUnit(i, side) * 0.62);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 2.8, 10), poleMaterial);
      pole.position.set(0, 1.38, 0);
      pole.castShadow = true;
      cluster.add(pole);

      if (i % 2 === 0) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.055, 0.055), poleMaterial);
        arm.position.set(side * 0.32, 2.72, -0.16);
        arm.rotation.z = side * THREE.MathUtils.degToRad(4);
        cluster.add(arm);

        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 10), lampMaterial);
        lamp.position.set(side * 0.72, 2.68, -0.16);
        cluster.add(lamp);
      }

      if (i % 3 === 0) {
        const sign = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.52, 0.04), signMaterial);
        sign.position.set(side * 0.08, 2.48, 0.64);
        sign.rotation.y = side * THREE.MathUtils.degToRad(10);
        sign.castShadow = true;
        cluster.add(sign);
      }

      addSceneryCluster(cluster, z + randomUnit(side, i) * 1.4, 20 + randomUnit(i, 29) * 3);
    });
  }

  for (let i = 0; i < 30; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const width = 5 + randomUnit(i, 7) * 5.5;
    const height = 3.4 + randomUnit(i, 11) * 7.5;
    const depth = 3 + randomUnit(i, 13) * 5;
    const cluster = new THREE.Group();
    cluster.position.x = side * (15.2 + randomUnit(i, 17) * 6.6);

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMaterials[i % buildingMaterials.length]
    );
    building.position.set(0, height / 2 - 0.02, 0);
    building.castShadow = true;
    building.receiveShadow = true;
    cluster.add(building);

    const windowMat = new THREE.MeshBasicMaterial({ color: 0xd7efe8, transparent: true, opacity: 0.28 });
    const rows = Math.max(1, Math.floor(height / 2));
    const cols = Math.max(2, Math.floor(width / 1.6));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if ((r + c + i) % 3 === 0) continue;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.36), windowMat);
        win.position.set(
          -side * (width / 2 + 0.012),
          1.25 + r * 1.4,
          -depth / 2 + 0.75 + c * (depth / Math.max(cols, 1))
        );
        win.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        cluster.add(win);
      }
    }

    if (i % 4 !== 1) {
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(width * 0.7, 4.6), 0.14, 0.58),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x31585c : 0x784f56, roughness: 0.7 })
      );
      awning.position.set(-side * (width / 2 + 0.08), 1.35, -depth * 0.14);
      awning.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      awning.castShadow = true;
      cluster.add(awning);
    }

    const frontage = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, depth + 1.5), curbMaterial);
    frontage.position.set(-side * (width / 2 + 0.42), 0.15, 0.1);
    frontage.castShadow = true;
    frontage.receiveShadow = true;
    cluster.add(frontage);

    addSceneryCluster(cluster, -i * 9.2 - 24 + randomUnit(i, 23) * 3.4, 24 + randomUnit(i, 31) * 4);
  }

  for (let i = 0; i < 58; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const cluster = new THREE.Group();
    cluster.position.x = side * (10.2 + randomUnit(i, 31) * 3.2);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.75, 8), trunkMaterial);
    trunk.position.set(0, 0.88, 0);
    trunk.castShadow = true;
    cluster.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.82 + randomUnit(i, 37) * 0.54, 0),
      treeMaterials[i % treeMaterials.length]
    );
    crown.position.set(0, 2.05 + randomUnit(i, 41) * 0.48, randomUnit(i, 43) * 0.24);
    crown.castShadow = true;
    cluster.add(crown);

    if (i % 3 === 0) {
      const lowerCrown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.54 + randomUnit(i, 47) * 0.28, 0),
        treeMaterials[(i + 1) % treeMaterials.length]
      );
      lowerCrown.position.set(side * 0.34, 1.75, -0.24);
      lowerCrown.castShadow = true;
      cluster.add(lowerCrown);
    }

    if (i % 4 === 0) {
      const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36 + randomUnit(i, 53) * 0.28, 0), shrubMaterial);
      shrub.position.set(-side * 0.62, 0.36, 0.5);
      shrub.castShadow = true;
      cluster.add(shrub);
    }

    addSceneryCluster(cluster, -i * 5.2 - 20 + randomUnit(i, 59) * 2.2, 21 + randomUnit(i, 61) * 3);
  }
}

function createIntersectionDetails() {
  const stopBarMaterial = new THREE.MeshBasicMaterial({
    color: 0xf7f5e8,
    transparent: true,
    opacity: 0.0
  });
  const stopBar = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 0.26), stopBarMaterial);
  stopBar.rotation.x = -Math.PI / 2;
  stopBar.position.set(0, 0.029, -25.5);
  stopBar.name = "intersectionStopBar";
  hazardGroup.add(stopBar);
}

function createCabinReflections() {
  const glassGlint = new THREE.Group();
  const glintMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false
  });

  for (let i = 0; i < 5; i += 1) {
    const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.22 + i * 0.06, 0.012), glintMaterial);
    glint.position.set(-2.7 + i * 1.4, 1.82 - i * 0.05, -1.9 - i * 0.08);
    glint.rotation.set(-0.18, 0.12, THREE.MathUtils.degToRad(-17));
    glassGlint.add(glint);
  }
  camera.add(glassGlint);
  scene.add(camera);
}

function createScenarioButtons() {
  scenarioDefinitions.forEach((scenario, index) => {
    const button = document.createElement("button");
    button.className = "scenario-button";
    button.type = "button";
    button.dataset.scenario = scenario.id;
    button.innerHTML = `
      <i data-lucide="${scenario.icon}"></i>
      <span class="scenario-copy">
        <span class="scenario-name">${scenario.title}</span>
        <small>${scenario.micro}</small>
      </span>
      <b class="scenario-index">${String(index + 1).padStart(2, "0")}</b>
    `;
    button.addEventListener("click", () => activateScenario(index));
    scenarioList.appendChild(button);
  });
}

function activateScenario(index) {
  state.scenarioIndex = index;
  const scenario = scenarioDefinitions[index];
  state.targetSpeed = Math.min(state.targetSpeed, state.speed);
  guidanceStatus.textContent =
    scenario.id === "hazard"
      ? "Steer left"
      : scenario.id === "emergency"
        ? "Move right"
        : scenario.id === "compression"
          ? "Reduce speed"
          : "Monitoring";
  state.decisionChoice = "";
  state.decisionMade = false;
  state.rightOfWayStopZ = null;
  state.rightOfWayStopMarkerStartZ = null;
  state.stopStartSpeed = 0;
  state.stopDecisionTime = 0;
  state.rightOfWayYieldTime = null;
  state.scenarioElapsed = 0;
  state.scenarioStartTime = state.time;
  state.holdCompleteTime = null;
  state.spaceHeld = false;
  state.keyboardSpaceHeld = false;
  state.keyboardGasHeld = false;
  state.wheelBrakeHeld = false;
  state.holdStartTime = null;
  state.holdStartSpeed = 0;
  state.compressionTrafficReleased = false;
  state.yieldingMergeReadyTime = null;
  wheelInput.brakeHeld = false;
  wheelInput.brakeAmount = 0;
  wheelInput.gasAmount = 0;
  state.yieldingChoiceTime = 0;
  scenarioCounter.textContent = String(index + 1).padStart(2, "0");
  intentLabel.textContent = scenario.intent;
  intentCopy.textContent = scenario.copy;
  nextMove.textContent = scenario.next;
  signalDot.style.background = scenario.color;
  signalDot.style.boxShadow = `0 0 18px ${scenario.color}`;
  if (comfortReadout) comfortReadout.textContent = scenario.comfort;
  rearAlert?.classList.toggle("is-active", scenario.id === "emergency");
  rearAlert?.setAttribute("aria-hidden", String(scenario.id !== "emergency"));
  setEmergencySirenActive(scenario.id === "emergency");

  [...scenarioList.children].forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });

  rebuildTraffic(scenario);
  rebuildOverlays(scenario);
  updateDecisionControls();
}

function shiftScenarioTime(value, scenario) {
  return typeof value === "number" ? value + (scenario.introDelay ?? 0) : value;
}

function prepareScenarioVehicle(vehicle, scenario) {
  const introDistance = scenario.introDistance ?? 0;
  const zShift = vehicle.approachFromBehind ? 0 : introDistance;
  return {
    ...vehicle,
    z: typeof vehicle.z === "number" ? vehicle.z - zShift : vehicle.z,
    mergeToZ: typeof vehicle.mergeToZ === "number" ? vehicle.mergeToZ - zShift : vehicle.mergeToZ,
    mergeStart: shiftScenarioTime(vehicle.mergeStart, scenario),
    mergeEnd: shiftScenarioTime(vehicle.mergeEnd, scenario),
    approachStart: shiftScenarioTime(vehicle.approachStart, scenario),
    approachEnd: shiftScenarioTime(vehicle.approachEnd, scenario)
  };
}

function prepareScenarioOverlay(overlay, scenario) {
  const introDistance = scenario.introDistance ?? 0;
  return {
    ...overlay,
    z: typeof overlay.z === "number" ? overlay.z - introDistance : overlay.z
  };
}

function rebuildTraffic(scenario) {
  trafficGroup.clear();
  visibleVehicleMap.clear();

  scenario.vehicles.forEach((vehicle, index) => {
    const vehicleData = prepareScenarioVehicle(vehicle, scenario);
    const mesh = createVehicle(vehicleData);
    const initialLane = vehicleData.approachFromBehind ? (vehicleData.approachStartLane ?? vehicleData.lane) : vehicleData.lane;
    const initialZ = vehicleData.approachFromBehind ? (vehicleData.approachStartZ ?? vehicleData.z) : vehicleData.z;
    mesh.position.set(initialLane * laneWidth, 0.08, initialZ);
    mesh.rotation.y = vehicleData.yaw || 0;
    mesh.visible = !vehicleData.approachFromBehind;
    mesh.userData = {
      ...vehicleData,
      baseLane: vehicleData.lane,
      baseZ: vehicleData.z,
      phase: index * 0.7 + randomUnit(index, 99) * 2
    };
    visibleVehicleMap.set(vehicle.name, mesh);
    trafficGroup.add(mesh);
  });
}

function createVehicle(vehicle) {
  const group = new THREE.Group();
  const carColor = new THREE.Color(vehicle.color || "#4a5660");
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: carColor,
    roughness: 0.46,
    metalness: 0.26,
    clearcoat: 0.42,
    clearcoatRoughness: 0.45
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1014,
    roughness: 0.55,
    metalness: 0.1
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x89a7b2,
    roughness: 0.1,
    metalness: 0,
    transmission: 0.2,
    transparent: true,
    opacity: 0.48
  });
  const lightMaterial = new THREE.MeshBasicMaterial({
    color: vehicle.accent || "#ff564c"
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: vehicle.accent || "#ff564c",
    transparent: true,
    opacity: vehicle.brake ? 0.72 : 0.26,
    depthWrite: false
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.58, 4.08), bodyMaterial);
  body.position.y = 0.52;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.3, 1.1), bodyMaterial);
  hood.position.set(0, 0.72, -1.3);
  hood.castShadow = true;
  group.add(hood);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.72, 1.42), glassMaterial);
  cabin.position.set(0, 1.06, 0.16);
  cabin.castShadow = true;
  group.add(cabin);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.13, 1.1), bodyMaterial);
  roof.position.set(0, 1.48, 0.18);
  roof.castShadow = true;
  group.add(roof);

  if (vehicle.emergency) {
    const barBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.12, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x172026, transparent: true, opacity: 0.84 })
    );
    barBase.position.set(0, 1.6, -0.16);
    group.add(barBase);

    [
      [-0.24, 0xff3b3b, "red"],
      [0.24, 0x4da3ff, "blue"]
    ].forEach(([x, color, side]) => {
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.15, 0.24),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        })
      );
      light.position.set(x, 1.68, -0.16);
      light.userData.emergencyLight = side;
      group.add(light);
    });
  }

  [-0.98, 0.98].forEach((x) => {
    [-1.35, 1.25].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.33, z);
      wheel.userData.vehicleWheel = true;
      wheel.userData.spin = 0;
      wheel.castShadow = true;
      group.add(wheel);
    });
  });

  [-0.48, 0.48].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.04), lightMaterial);
    tail.position.set(x, 0.61, 2.07);
    group.add(tail);

    const tailGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.38), glowMaterial);
    tailGlow.position.set(x, 0.62, 2.102);
    tailGlow.rotation.x = 0;
    group.add(tailGlow);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.12, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xf2f0d4, transparent: true, opacity: 0.76 })
    );
    head.position.set(x, 0.58, -2.07);
    group.add(head);
  });

  const underGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.45, 4.9),
    new THREE.MeshBasicMaterial({
      color: vehicle.glow === "red" ? 0xff7770 : vehicle.glow === "amber" ? 0xffc863 : vehicle.glow === "blue" ? 0x8fb5ff : 0x97f6b0,
      transparent: true,
      opacity: vehicle.glow ? 0.09 : 0,
      depthWrite: false
    })
  );
  underGlow.rotation.x = -Math.PI / 2;
  underGlow.position.y = 0.025;
  group.add(underGlow);

  return group;
}

function rebuildOverlays(scenario) {
  overlayGroup.clear();
  hazardGroup.children.forEach((child) => {
    if (child.name === "intersectionStopBar") {
      child.material.opacity = scenario.id === "right-of-way" ? 0.74 : 0.0;
    }
  });

  scenario.overlays.forEach((overlayConfig) => {
    const overlay = prepareScenarioOverlay(overlayConfig, scenario);
    if (overlay.type === "vehicle-outline") overlayGroup.add(createVehicleOutline(overlay));
    if (overlay.type === "opening") overlayGroup.add(createOpeningSpace(overlay));
    if (overlay.type === "trail") overlayGroup.add(createMotionTrail(overlay));
    if (overlay.type === "pressure") overlayGroup.add(createPressureZone(overlay));
    if (overlay.type === "brake-wave") overlayGroup.add(createBrakeWaveCue(overlay));
    if (overlay.type === "accident-marker") overlayGroup.add(createAccidentMarker(overlay));
    if (overlay.type === "distance-cue") overlayGroup.add(createDistanceCue(overlay));
    if (overlay.type === "speed-cue") overlayGroup.add(createSpeedCue(overlay));
    if (overlay.type === "lateral-arrow") overlayGroup.add(createLateralArrow(overlay));
    if (overlay.type === "event-trace") overlayGroup.add(createEventTrace(overlay));
    if (overlay.type === "wait-aura") overlayGroup.add(createWaitAura(overlay));
    if (overlay.type === "wait-icon") overlayGroup.add(createWaitIcon(overlay));
    if (overlay.type === "merge-icon") overlayGroup.add(createMergeIcon(overlay));
    if (overlay.type === "emergency-icon") overlayGroup.add(createEmergencyIcon(overlay));
    if (overlay.type === "hold-zone") overlayGroup.add(createHoldZone(overlay));
    if (overlay.type === "space-gap") overlayGroup.add(createSpaceGap(overlay));
    if (overlay.type === "calm-forward") overlayGroup.add(createCalmForwardCue(overlay));
    if (overlay.type === "crosswalk") overlayGroup.add(createCrosswalk(overlay));
    if (overlay.type === "hazard") overlayGroup.add(createRoadHazard(overlay));
    if (overlay.type === "guide") overlayGroup.add(createGuidingLight(overlay));
    if (overlay.type === "continuous-path") overlayGroup.add(createContinuousForwardPath(overlay));
  });
}

function createVehicleOutline(overlay) {
  const target = visibleVehicleMap.get(overlay.target);
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.yieldingCue = overlay.yieldingCue;
  const isSoftGlow = overlay.yieldingCue === "merge-focus" || overlay.style === "glow";
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: isSoftGlow ? 0.15 : 0.34,
    wireframe: !isSoftGlow,
    depthWrite: false,
    depthTest: !isSoftGlow,
    side: THREE.DoubleSide,
    blending: isSoftGlow ? THREE.AdditiveBlending : THREE.NormalBlending
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(isSoftGlow ? 2.45 : 2.2, isSoftGlow ? 1.88 : 1.75, isSoftGlow ? 5.05 : 4.75), material);
  box.position.y = 0.82;
  box.renderOrder = isSoftGlow ? 8 : 0;
  group.add(box);
  if (overlay.halo !== false) {
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(isSoftGlow ? 1.52 : 1.4, isSoftGlow ? 1.95 : 1.66, 80),
      new THREE.MeshBasicMaterial({
        color: overlay.color,
        transparent: true,
        opacity: isSoftGlow ? 0.34 : 0.22,
        depthWrite: false,
        depthTest: !isSoftGlow,
        blending: THREE.AdditiveBlending
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.06;
    halo.renderOrder = isSoftGlow ? 8 : 0;
    group.add(halo);
  }
  if (target) {
    group.position.copy(target.position);
    group.rotation.y = target.rotation.y;
  }
  return group;
}

function createOpeningSpace(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.choice = overlay.choice;
  group.userData.yieldingCue = overlay.yieldingCue;
  group.userData.openingCue = true;
  group.userData.target = overlay.target;
  group.userData.laneX = overlay.lane * laneWidth;
  group.userData.followTargetZOffset = overlay.followTargetZOffset ?? 0;
  group.position.set(overlay.lane * laneWidth, 0, overlay.z);
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const geometry = new THREE.PlaneGeometry(2.35, 5.8, 1, 8);
  const space = new THREE.Mesh(geometry, material);
  space.rotation.x = -Math.PI / 2;
  space.position.set(0, 0.048, 0);
  space.renderOrder = 8;
  group.add(space);

  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  [-1, 1].forEach((side) => {
    for (let segment = 0; segment < 3; segment += 1) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.95), edgeMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(side * 1.24, 0.058, -1.85 + segment * 1.85);
      line.renderOrder = 9;
      group.add(line);
    }
  });

  if (overlay.label) {
    const label = createTextSprite(overlay.label, overlay.color);
    label.position.set(0.72, 0.72, -1.95);
    label.scale.set(1.15, 0.3, 1);
    label.renderOrder = 11;
    group.add(label);
  }

  return group;
}

function createMotionTrail(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.yieldingCue = overlay.yieldingCue;
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i += 1) {
    const trail = new THREE.Mesh(new THREE.PlaneGeometry(0.34 + i * 0.1, 2.2), material);
    trail.rotation.x = -Math.PI / 2;
    trail.position.set((overlay.side || 0) * (0.38 + i * 0.09), 0.065, 1.8 + i * 1.15);
    group.add(trail);
  }
  const target = visibleVehicleMap.get(overlay.target);
  if (target) group.position.copy(target.position);
  return group;
}

function createPressureZone(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  const scale = overlay.scale || 1;
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.7 * scale, 84), material);
  disc.rotation.x = -Math.PI / 2;
  disc.scale.z = 1.55;
  disc.position.set(overlay.lane * laneWidth, 0.072, overlay.z);
  group.add(disc);

  const ring = new THREE.Mesh(new THREE.RingGeometry(2.62 * scale, 2.72 * scale, 84), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.scale.z = 1.55;
  ring.position.copy(disc.position);
  group.add(ring);

  return group;
}

function createBrakeWaveCue(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;

  const target = visibleVehicleMap.get(overlay.target);
  const waveMaterial = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.2 + i * 0.46, 1.32 + i * 0.46, 72), waveMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.scale.z = 1.65;
    ring.position.set(0, 0.072 + i * 0.006, 0.15 - i * 0.42);
    ring.renderOrder = 8;
    group.add(ring);
  }

  if (overlay.label) {
    const label = createTextSprite(overlay.label, overlay.color);
    label.position.set(2.25, 2.28, -0.2);
    label.scale.set(2.35, 0.54, 1);
    label.renderOrder = 14;
    group.add(label);
  }

  if (target) {
    group.position.copy(target.position);
    group.rotation.y = target.rotation.y;
  }
  return group;
}

function createAccidentMarker(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.billboard = true;

  const target = visibleVehicleMap.get(overlay.target);
  const color = new THREE.Color(overlay.color);
  const groundMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const blockedLane = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 5.9), groundMaterial);
  blockedLane.rotation.x = -Math.PI / 2;
  blockedLane.position.set(0, 0.07, 0.2);
  blockedLane.renderOrder = 8;
  group.add(blockedLane);

  if (overlay.ring !== false) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.28, 1.58, 96),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.scale.z = 1.32;
    ring.position.set(0, 0.09, 0.1);
    ring.renderOrder = 9;
    group.add(ring);
  }

  const iconPlate = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  iconPlate.position.set(-0.56, 2.46, -0.08);
  iconPlate.renderOrder = 13;
  group.add(iconPlate);

  const markMaterial = new THREE.MeshBasicMaterial({
    color: 0x161208,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    depthTest: false
  });
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.04), markMaterial);
  stem.position.set(-0.56, 2.53, -0.04);
  stem.renderOrder = 14;
  group.add(stem);

  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), markMaterial);
  dot.position.set(-0.56, 2.17, -0.035);
  dot.renderOrder = 14;
  group.add(dot);

  const label = createTextSprite(overlay.label || "Accident ahead", overlay.color);
  label.position.set(-2.15, 2.47, -0.06);
  label.scale.set(3.2, 0.64, 1);
  label.renderOrder = 14;
  group.add(label);

  if (target) group.position.copy(target.position);
  return group;
}

function createDistanceCue(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  const laneX = (overlay.lane ?? 0) * laneWidth;

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const pointer = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(laneX) + 0.75, 0.09), lineMaterial);
  pointer.rotation.x = -Math.PI / 2;
  pointer.position.set(laneX / 2, 0.075, overlay.z);
  pointer.renderOrder = 9;
  group.add(pointer);

  if (overlay.ring !== false) {
    const laneRing = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.94, 72),
      new THREE.MeshBasicMaterial({
        color: overlay.color,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    laneRing.rotation.x = -Math.PI / 2;
    laneRing.scale.z = 1.28;
    laneRing.position.set(laneX, 0.08, overlay.z);
    laneRing.renderOrder = 9;
    group.add(laneRing);
  }

  const label = createTextSprite(overlay.label || "160 ft right lane", overlay.color);
  label.position.set(laneX * 0.42, 1.42, overlay.z - 1.35);
  label.scale.set(2.35, 0.5, 1);
  label.renderOrder = 14;
  group.add(label);

  return group;
}

function createSpeedCue(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "guidance";

  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 4; i += 1) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.45 - i * 0.22, 0.18), material);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set((overlay.lane ?? 0) * laneWidth, 0.075, overlay.z - i * 1.55);
    bar.renderOrder = 9;
    group.add(bar);
  }

  const label = createTextSprite(overlay.label || "Reduce speed", overlay.color);
  label.position.set((overlay.lane ?? 0) * laneWidth, 0.86, overlay.z - 3.05);
  label.scale.set(2.35, 0.54, 1);
  label.renderOrder = 14;
  group.add(label);

  return group;
}

function createLateralArrow(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  const color = new THREE.Color(overlay.color);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.58,
    depthWrite: false
  });

  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.045, 0.09), material);
  shaft.position.set(overlay.direction * -0.65, 1.78, 0.35);
  group.add(shaft);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 3), material);
  head.rotation.z = overlay.direction < 0 ? Math.PI / 2 : -Math.PI / 2;
  head.position.set(overlay.direction * -1.58, 1.78, 0.35);
  group.add(head);

  const target = visibleVehicleMap.get(overlay.target);
  if (target) group.position.copy(target.position);
  return group;
}

function createEventTrace(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  });
  for (let i = 0; i < 6; i += 1) {
    const trace = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.2 + i * 0.1), material);
    trace.rotation.x = -Math.PI / 2;
    trace.rotation.z = THREE.MathUtils.degToRad(6);
    trace.position.set(-0.62 + i * 0.1, 0.062, 1.5 + i * 0.8);
    group.add(trace);
  }
  const target = visibleVehicleMap.get(overlay.target);
  if (target) group.position.copy(target.position);
  return group;
}

function createWaitAura(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.yieldingCue = overlay.yieldingCue;
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.8 + i * 0.55, 1.9 + i * 0.55, 72), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.07 + i * 0.01;
    group.add(ring);
  }
  const target = visibleVehicleMap.get(overlay.target);
  if (target) group.position.copy(target.position);
  return group;
}

function createWaitIcon(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.billboard = true;

  const color = new THREE.Color(overlay.color);
  const backplate = new THREE.Mesh(
    new THREE.CircleGeometry(0.58, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  backplate.position.set(0, 2.35, -0.08);
  backplate.rotation.x = -0.18;
  group.add(backplate);

  const barMaterial = new THREE.MeshBasicMaterial({
    color: 0xe6f3ff,
    transparent: true,
    opacity: 0.86,
    depthWrite: false
  });
  [-0.12, 0.12].forEach((x) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.04), barMaterial);
    bar.position.set(x, 2.35, -0.04);
    group.add(bar);
  });

  const label = createTextSprite("Driver waiting", overlay.color);
  label.position.set(1.55, 2.38, -0.04);
  label.scale.set(2.45, 0.54, 1);
  group.add(label);

  const target = visibleVehicleMap.get(overlay.target);
  if (target) group.position.copy(target.position);
  return group;
}

function createMergeIcon(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.billboard = true;
  group.userData.yieldingCue = overlay.yieldingCue;

  const color = new THREE.Color(overlay.color);
  const backplate = new THREE.Mesh(
    new THREE.CircleGeometry(0.64, 56),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  backplate.position.set(0, 2.54, -0.08);
  backplate.rotation.x = -0.18;
  backplate.renderOrder = 12;
  group.add(backplate);

  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: 0x10221d,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    depthTest: false
  });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.04), arrowMaterial);
  shaft.position.set(0.08, 2.54, -0.035);
  shaft.renderOrder = 13;
  group.add(shaft);

  const arrowHeadShape = new THREE.Shape();
  arrowHeadShape.moveTo(-0.26, 0);
  arrowHeadShape.lineTo(0.2, 0.28);
  arrowHeadShape.lineTo(0.2, -0.28);
  arrowHeadShape.lineTo(-0.26, 0);
  const head = new THREE.Mesh(new THREE.ShapeGeometry(arrowHeadShape), arrowMaterial);
  head.position.set(-0.44, 2.54, -0.03);
  head.renderOrder = 13;
  group.add(head);

  const label = createTextSprite("Merging", overlay.color);
  label.position.set(2.36, 2.6, -0.04);
  label.scale.set(3.2, 0.74, 1);
  label.renderOrder = 14;
  group.add(label);

  const target = visibleVehicleMap.get(overlay.target);
  group.scale.setScalar(1.18);
  if (target) group.position.copy(target.position);
  return group;
}

function createEmergencyIcon(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.target = overlay.target;
  group.userData.billboard = true;

  const redPlate = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xff4f5a,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  redPlate.position.set(-0.2, 2.58, -0.08);
  redPlate.renderOrder = 12;
  group.add(redPlate);

  const bluePlate = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x5bb8ff,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  bluePlate.position.set(0.2, 2.58, -0.08);
  bluePlate.renderOrder = 12;
  group.add(bluePlate);

  const markMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    depthTest: false
  });
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.04), markMaterial);
  stem.position.set(0, 2.64, -0.035);
  stem.renderOrder = 13;
  group.add(stem);

  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), markMaterial);
  dot.position.set(0, 2.28, -0.03);
  dot.renderOrder = 13;
  group.add(dot);

  const label = createTextSprite("Emergency", overlay.color);
  label.position.set(1.94, 2.62, -0.04);
  label.scale.set(3.25, 0.7, 1);
  label.renderOrder = 14;
  group.add(label);

  const target = visibleVehicleMap.get(overlay.target);
  group.scale.setScalar(1.24);
  if (target) group.position.copy(target.position);
  return group;
}

function createTextSprite(text, color) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const ctx = labelCanvas.getContext("2d");
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = "rgba(7, 12, 16, 0.72)";
  roundRect(ctx, 18, 26, 476, 76, 22);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.58;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#eef7f4";
  ctx.font = "700 34px Inter, system-ui, sans-serif";
  ctx.fillText(text, 48, 76);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
  );
  sprite.renderOrder = 10;
  return sprite;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createHoldZone(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.choice = overlay.choice;
  group.userData.rightOfWayCue = "hold-zone";
  group.userData.roadFixed = true;
  group.userData.laneX = overlay.lane * laneWidth;
  group.userData.stopPointLocalZ = rightOfWayStopPointLocalZ;
  group.position.set(overlay.lane * laneWidth, 0, overlay.z);

  const square = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  square.rotation.x = -Math.PI / 2;
  square.position.set(0, 0.055, rightOfWayStopPointLocalZ);
  group.add(square);

  const squareBorderMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff1b3,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  [
    [0, 1.1, 2.2, 0.07],
    [0, -1.1, 2.2, 0.07],
    [-1.1, 0, 0.07, 2.2],
    [1.1, 0, 0.07, 2.2]
  ].forEach(([x, z, width, height]) => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(width, height), squareBorderMaterial);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.072, rightOfWayStopPointLocalZ + z);
    group.add(edge);
  });

  const circle = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 96),
    new THREE.MeshBasicMaterial({
      color: 0xfff4bd,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  circle.rotation.x = -Math.PI / 2;
  circle.position.set(0, 0.06, rightOfWayStopPointLocalZ);
  group.add(circle);

  const outline = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1.15, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  outline.rotation.x = -Math.PI / 2;
  outline.position.set(0, 0.07, rightOfWayStopPointLocalZ);
  group.add(outline);

  const label = createTextSprite("Stop point", overlay.color);
  label.position.set(0, 0.82, rightOfWayStopPointLocalZ - 1.35);
  label.scale.set(1.95, 0.5, 1);
  group.add(label);

  return group;
}

function createSpaceGap(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.choice = overlay.choice;
  group.userData.rightOfWayCue = "space-gap";

  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 6.8), material);
  core.rotation.x = -Math.PI / 2;
  core.position.set(overlay.lane * laneWidth, 0.055, overlay.z);
  group.add(core);

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.34, 72),
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  rim.rotation.x = -Math.PI / 2;
  rim.scale.set(1.02, 2.55, 1);
  rim.position.set(overlay.lane * laneWidth, 0.068, overlay.z);
  group.add(rim);

  return group;
}

function createCalmForwardCue(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.choice = overlay.choice;
  group.userData.rightOfWayCue = "calm-forward";

  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 3; i += 1) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.18 - i * 0.12, 1.75), material);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(overlay.lane * laneWidth, 0.062, overlay.z - i * 2.55);
    group.add(pad);
  }

  return group;
}

function createCrosswalk(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  const material = new THREE.MeshBasicMaterial({
    color: overlay.color,
    transparent: true,
    opacity: 0.42,
    depthWrite: false
  });
  for (let i = 0; i < 8; i += 1) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 11.2), material);
    stripe.rotation.x = -Math.PI / 2;
    stripe.rotation.z = Math.PI / 2;
    stripe.position.set(-4.9 + i * 1.4, 0.052, overlay.z);
    group.add(stripe);
  }
  return group;
}

function createRoadHazard(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "lens";
  group.userData.loopDistance = 60;
  group.userData.loopResetZ = 30;
  const asphalt = new THREE.Mesh(
    new THREE.CircleGeometry(0.68, 18),
    new THREE.MeshStandardMaterial({ color: 0x1c1b19, roughness: 0.98 })
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.scale.set(1.38, 0.74, 1);
  asphalt.position.set(overlay.lane * laneWidth, 0.041, overlay.z);
  group.add(asphalt);

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.79, 32),
    new THREE.MeshBasicMaterial({ color: overlay.color, transparent: true, opacity: 0.68, depthWrite: false })
  );
  rim.rotation.x = -Math.PI / 2;
  rim.scale.set(1.38, 0.74, 1);
  rim.position.set(overlay.lane * laneWidth, 0.058, overlay.z);
  group.add(rim);

  const coneX = overlay.lane * laneWidth + 0.42;
  const coneGeometry = new THREE.ConeGeometry(0.5, 1.38, 32, 1, true);
  const cone = new THREE.Mesh(
    coneGeometry,
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  cone.position.set(coneX, 0.72, overlay.z - 0.78);
  group.add(cone);

  const coneWire = new THREE.Mesh(
    coneGeometry,
    new THREE.MeshBasicMaterial({
      color: 0xfff0a8,
      transparent: true,
      opacity: 0.78,
      wireframe: true,
      depthWrite: false
    })
  );
  coneWire.position.copy(cone.position);
  group.add(coneWire);

  return group;
}

function createCenterDisplayTrafficCone() {
  const group = new THREE.Group();
  group.name = "centerDisplayTrafficCone";

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.98, 40),
    new THREE.MeshBasicMaterial({
      color: 0xffc863,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.018;
  group.add(glow);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.58, 0.12, 4),
    new THREE.MeshStandardMaterial({ color: 0x24201b, roughness: 0.84 })
  );
  base.position.y = 0.08;
  base.rotation.y = Math.PI / 4;
  base.castShadow = true;
  group.add(base);

  const coneMaterial = new THREE.MeshStandardMaterial({
    color: 0xff9f2e,
    roughness: 0.72,
    emissive: 0x5a2100,
    emissiveIntensity: 0.18
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.24, 36), coneMaterial);
  cone.position.y = 0.74;
  cone.castShadow = true;
  group.add(cone);

  [0.48, 0.78].forEach((height, index) => {
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3 - index * 0.06, 0.36 - index * 0.06, 0.045, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfff0c6,
        transparent: true,
        opacity: 0.86,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    stripe.position.y = height;
    group.add(stripe);
  });

  group.visible = false;
  return group;
}

function createContinuousForwardPath(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "guidance";
  group.userData.choice = overlay.choice;
  group.userData.yieldingCue = overlay.yieldingCue;
  group.userData.rightOfWayCue = overlay.rightOfWayCue;
  group.userData.driverAnchored = true;
  group.userData.continuousPath = true;

  const laneX = (overlay.lane ?? 0) * laneWidth;
  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(laneX, 0.07, -3.2),
    new THREE.Vector3(laneX, 0.07, -12.5),
    new THREE.Vector3(laneX, 0.07, -25.5),
    new THREE.Vector3(laneX, 0.07, -41.5),
    new THREE.Vector3(laneX, 0.07, -58.5)
  ]);

  const glowRibbon = new THREE.Mesh(
    createRouteRibbonGeometry(route, 1.42, 82),
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  glowRibbon.renderOrder = 8;
  group.add(glowRibbon);

  const pathRibbon = new THREE.Mesh(
    createRouteRibbonGeometry(route, 0.72, 82),
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  pathRibbon.renderOrder = 9;
  group.add(pathRibbon);

  const centerLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 52),
    new THREE.MeshBasicMaterial({
      color: 0xeafff4,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.set(laneX, 0.082, -29.5);
  centerLine.renderOrder = 10;
  group.add(centerLine);

  [-1, 1].forEach((side) => {
    const rail = new THREE.Mesh(
      new THREE.PlaneGeometry(0.045, 47),
      new THREE.MeshBasicMaterial({
        color: overlay.color,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    rail.rotation.x = -Math.PI / 2;
    rail.position.set(laneX + side * 0.68, 0.079, -28.2);
    rail.renderOrder = 9;
    group.add(rail);
  });

  return group;
}

function createGuidingLight(overlay) {
  const group = new THREE.Group();
  group.userData.overlayType = "guidance";
  group.userData.choice = overlay.choice;
  group.userData.yieldingCue = overlay.yieldingCue;
  group.userData.loopDistance = 60;
  group.userData.loopResetZ = 30;
  const fromLane = overlay.lane ?? 0;
  const toLane = overlay.toLane ?? fromLane;
  const direction = Math.sign(toLane - fromLane) || -1;

  const route = overlay.straight
    ? new THREE.CatmullRomCurve3([
        new THREE.Vector3(fromLane * laneWidth, 0.066, -3.4),
        new THREE.Vector3(fromLane * laneWidth, 0.066, -10.4),
        new THREE.Vector3(fromLane * laneWidth, 0.066, -18.6),
        new THREE.Vector3(fromLane * laneWidth, 0.066, -29.6)
      ])
    : new THREE.CatmullRomCurve3([
        new THREE.Vector3(fromLane * laneWidth, 0.066, -3.4),
        new THREE.Vector3(fromLane * laneWidth, 0.066, -8.4),
        new THREE.Vector3(direction * 0.28 * laneWidth, 0.066, -12.5),
        new THREE.Vector3(direction * 0.78 * laneWidth, 0.066, -17.2),
        new THREE.Vector3(toLane * laneWidth, 0.066, -22.7),
        new THREE.Vector3(toLane * laneWidth, 0.066, -29.6)
      ]);

  const glowGeometry = createRouteRibbonGeometry(route, overlay.straight ? 1.05 : 2.05, 56);
  const glowRibbon = new THREE.Mesh(
    glowGeometry,
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: overlay.straight ? 0.18 : 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  glowRibbon.position.z = overlay.z;
  group.add(glowRibbon);

  const ribbonGeometry = createRouteRibbonGeometry(route, overlay.straight ? 0.26 : 0.62, 56);
  const coreRibbon = new THREE.Mesh(
    ribbonGeometry,
    new THREE.MeshBasicMaterial({
      color: overlay.color,
      transparent: true,
      opacity: overlay.straight ? 0.72 : 0.58,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  coreRibbon.position.z = overlay.z;
  group.add(coreRibbon);

  return group;
}

function createRouteRibbonGeometry(curve, width, segments) {
  const positions = [];
  const indices = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const halfWidth = width / 2;
    const left = point.clone().addScaledVector(normal, halfWidth);
    const right = point.clone().addScaledVector(normal, -halfWidth);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function bindCenterDisplayConeEvents() {
  const handleCenterDisplayMessage = (message) => {
    if (message?.type === "PLACE_CONE" && message.position) {
      if (!centerDisplayConeSyncEnabled) {
        clearCenterDisplayCone();
        return;
      }
      placeCenterDisplayCone(message.position);
    }
    if (message?.type === "CLEAR_CONE") {
      clearCenterDisplayCone();
    }
  };

  if ("BroadcastChannel" in window) {
    centerDisplayChannel = new BroadcastChannel(centerDisplayChannelName);
    centerDisplayChannel.addEventListener("message", (event) => {
      handleCenterDisplayMessage(event.data);
    });
  }

  connectCenterDisplaySocket(handleCenterDisplayMessage);

  window.addEventListener("storage", (event) => {
    if (event.key !== centerDisplayChannelName || !event.newValue) return;
    try {
      handleCenterDisplayMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed storage messages; BroadcastChannel is the primary path.
    }
  });

  try {
    const lastMessage = localStorage.getItem(centerDisplayChannelName);
    if (lastMessage) handleCenterDisplayMessage(JSON.parse(lastMessage));
  } catch {
    // Ignore private browsing/storage failures; live BroadcastChannel sync still works.
  }
}

function connectCenterDisplaySocket(handleCenterDisplayMessage) {
  if (!("WebSocket" in window)) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socketUrl = `${protocol}//${window.location.host}/social-lens-sync`;
  centerDisplaySocket = new WebSocket(socketUrl);

  centerDisplaySocket.addEventListener("open", () => {
    centerDisplaySocketRetry = 0;
    publishCenterDisplayTelemetry({ force: true });
  });

  centerDisplaySocket.addEventListener("message", (event) => {
    try {
      handleCenterDisplayMessage(JSON.parse(event.data));
    } catch {
      // Ignore malformed relay messages; the center display sends JSON objects.
    }
  });

  centerDisplaySocket.addEventListener("close", () => {
    centerDisplaySocketRetry += 1;
    const delay = Math.min(8000, 700 * centerDisplaySocketRetry);
    window.setTimeout(() => connectCenterDisplaySocket(handleCenterDisplayMessage), delay);
  });
}

function placeCenterDisplayCone(position) {
  if (!centerDisplayConeSyncEnabled) {
    clearCenterDisplayCone();
    return;
  }

  if (!centerDisplayCone) {
    centerDisplayCone = createCenterDisplayTrafficCone();
    hazardGroup.add(centerDisplayCone);
  }

  // These clamps are the simulator-side guardrail for the console mapping.
  // If you widen the center display road mapping, tune these limits too.
  const x = THREE.MathUtils.clamp(Number(position.x) || 0, -5.8, 5.8);
  const z = THREE.MathUtils.clamp(Number(position.z) || -24, -72, -3.5);
  centerDisplayCone.position.set(x, 0.02, z);
  centerDisplayCone.visible = true;
  centerDisplayCone.userData.passedDriver = false;
  document.documentElement.dataset.centerConeVisible = "true";
  document.documentElement.dataset.centerConeX = x.toFixed(2);
  document.documentElement.dataset.centerConeZ = z.toFixed(2);
  window.socialLensCenterConeDebug = {
    visible: true,
    position: { x, z }
  };
}

function updateCenterDisplayCone(delta) {
  if (!centerDisplayCone?.visible || state.paused) return;

  centerDisplayCone.position.z += delta * (state.speed / 38) * 8;

  if (centerDisplayCone.position.z > centerDisplayConePassZ) {
    centerDisplayCone.visible = false;
    centerDisplayCone.userData.passedDriver = true;
    document.documentElement.dataset.centerConeVisible = "false";
    delete document.documentElement.dataset.centerConeX;
    delete document.documentElement.dataset.centerConeZ;
    window.socialLensCenterConeDebug = {
      visible: false,
      position: null,
      passedDriver: true
    };
    return;
  }

  document.documentElement.dataset.centerConeZ = centerDisplayCone.position.z.toFixed(2);
  window.socialLensCenterConeDebug = {
    visible: true,
    position: {
      x: centerDisplayCone.position.x,
      z: centerDisplayCone.position.z
    },
    passedDriver: false
  };
}

function clearCenterDisplayCone() {
  document.documentElement.dataset.centerConeVisible = "false";
  delete document.documentElement.dataset.centerConeX;
  delete document.documentElement.dataset.centerConeZ;
  if (centerDisplayCone) {
    centerDisplayCone.visible = false;
    centerDisplayCone.userData.passedDriver = false;
  }
  window.socialLensCenterConeDebug = {
    visible: false,
    position: null
  };
}

function publishCenterDisplayTelemetry(options = {}) {
  if (centerDisplaySocket?.readyState !== WebSocket.OPEN) return;

  const now = performance.now();
  if (!options.force && now - lastCenterDisplayTelemetryTime < centerDisplayTelemetryMinInterval) return;
  lastCenterDisplayTelemetryTime = now;
  centerDisplayTelemetrySentCount += 1;
  document.documentElement.dataset.centerTelemetrySent = String(centerDisplayTelemetrySentCount);
  document.documentElement.dataset.centerTelemetrySentAt = String(Date.now());

  centerDisplaySocket.send(JSON.stringify(createCenterDisplayTelemetry()));
}

function createCenterDisplayTelemetry() {
  const scenario = scenarioDefinitions[state.scenarioIndex];

  return {
    type: "SIMULATOR_STATE",
    sentAt: Date.now(),
    state: {
      speed: roundTelemetryValue(state.speed),
      targetSpeed: roundTelemetryValue(state.targetSpeed),
      roadOffset: roundTelemetryValue(state.roadOffset),
      scenarioElapsed: roundTelemetryValue(state.scenarioElapsed),
      lateral: roundTelemetryValue(state.lateral),
      paused: state.paused,
      inputMode: state.inputMode
    },
    scenario: {
      id: scenario.id,
      title: scenario.title,
      intent: scenario.intent,
      copy: scenario.copy,
      next: scenario.next,
      color: scenario.color,
      recommendedSpeed: scenario.recommendedSpeed ?? null
    },
    vehicles: getCenterDisplayVehicleTelemetry(),
    cone: getCenterDisplayConeTelemetry()
  };
}

function getCenterDisplayVehicleTelemetry() {
  return trafficGroup.children
    .filter((vehicle) => vehicle.visible !== false)
    .map((vehicle) => ({
      name: vehicle.userData.name,
      x: roundTelemetryValue(vehicle.position.x),
      z: roundTelemetryValue(vehicle.position.z),
      yaw: roundTelemetryValue(vehicle.rotation.y),
      emergency: Boolean(vehicle.userData.emergency),
      brake: Boolean(vehicle.userData.brake)
    }));
}

function getCenterDisplayConeTelemetry() {
  if (!centerDisplayCone?.visible) {
    return {
      visible: false,
      passedDriver: Boolean(centerDisplayCone?.userData.passedDriver)
    };
  }

  return {
    visible: true,
    x: roundTelemetryValue(centerDisplayCone.position.x),
    z: roundTelemetryValue(centerDisplayCone.position.z),
    passedDriver: false
  };
}

function roundTelemetryValue(value) {
  return Number(Number(value || 0).toFixed(3));
}

function bindControls() {
  lensToggle?.addEventListener("click", () => {
    state.lensOn = !state.lensOn;
    lensToggle.classList.toggle("is-active", state.lensOn);
    lensToggle.setAttribute("aria-pressed", String(state.lensOn));
  });

  guidanceToggle?.addEventListener("click", () => {
    state.guidanceOn = !state.guidanceOn;
    guidanceToggle.classList.toggle("is-active", state.guidanceOn);
    guidanceToggle.setAttribute("aria-pressed", String(state.guidanceOn));
  });

  soundToggle?.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    syncSoundToggle();
    setEmergencySirenActive(state.soundOn && !state.paused && scenarioDefinitions[state.scenarioIndex].id === "emergency");
  });

  pauseToggle?.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseToggle.classList.toggle("is-active", state.paused);
    pauseToggle.setAttribute("aria-pressed", String(state.paused));
    setEmergencySirenActive(!state.paused && scenarioDefinitions[state.scenarioIndex].id === "emergency");
  });

  keyboardMode?.addEventListener("click", () => setInputMode("keyboard"));
  g29Mode?.addEventListener("click", () => {
    setInputMode("g29");
    startWheelWakeScan(8000);
  });
  wheelStatus?.addEventListener("click", () => {
    if (state.inputMode !== "g29") setInputMode("g29");
    startWheelWakeScan(8000);
  });

  stopChoice?.addEventListener("click", () => chooseScenarioDecision("stop"));
  pathChoice?.addEventListener("click", () => chooseScenarioDecision("follow"));

  speedUp?.addEventListener("click", () => changeSpeed(4));
  speedDown?.addEventListener("click", () => changeSpeed(-4));
  steerLeft?.addEventListener("click", () => steer(-0.72));
  steerRight?.addEventListener("click", () => steer(0.72));

  window.addEventListener("keydown", (event) => {
    refreshWheelInput();
    if (isSpaceKey(event)) {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) setHoldInput("keyboard", true);
      return;
    }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") steer(0.58);
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") steer(-0.58);
    if (isKeyboardGasKey(event)) {
      event.preventDefault();
      state.keyboardGasHeld = true;
    }
    if (/^[1-5]$/.test(event.key)) activateScenario(Number(event.key) - 1);
  }, { capture: true });

  window.addEventListener("keyup", (event) => {
    if (isSpaceKey(event)) {
      event.preventDefault();
      event.stopPropagation();
      setHoldInput("keyboard", false);
      return;
    }
    if (isKeyboardGasKey(event)) {
      event.preventDefault();
      state.keyboardGasHeld = false;
    }
  }, { capture: true });

  window.addEventListener("gamepadconnected", (event) => {
    if (isWheelCandidate(event.gamepad)) connectWheelInput(event.gamepad);
  });

  window.addEventListener("gamepaddisconnected", (event) => {
    if (event.gamepad.index === wheelInput.index) disconnectWheelInput();
  });

  window.addEventListener("pointerdown", () => startWheelWakeScan());
  window.addEventListener("focus", () => startWheelWakeScan());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) startWheelWakeScan();
  });

  window.addEventListener("resize", resize);
  refreshWheelInput();
  updateInputModeControls();
}

function setInputMode(mode) {
  state.inputMode = mode;
  if (mode === "keyboard") {
    wheelInput.brakeHeld = false;
    wheelInput.brakeAmount = 0;
    wheelInput.gasAmount = 0;
    setHoldInput("wheel", false);
  } else {
    setHoldInput("keyboard", false);
    state.keyboardGasHeld = false;
    startWheelWakeScan(6000);
  }
  updateInputModeControls();
  updateWheelStatus(getActiveWheelInput());
}

function startWheelWakeScan(duration = 3600) {
  refreshWheelInput();
  if (!isG29DrivingEnabled()) return;
  if (wheelScanTimer) window.clearInterval(wheelScanTimer);
  wheelScanActive = true;
  updateWheelStatus(getActiveWheelInput());
  const scanEnd = performance.now() + duration;
  wheelScanTimer = window.setInterval(() => {
    refreshWheelInput();
    if (wheelInput.connected || performance.now() > scanEnd) {
      window.clearInterval(wheelScanTimer);
      wheelScanTimer = null;
      wheelScanActive = false;
      updateWheelStatus(getActiveWheelInput());
    }
  }, 240);
}

function isKeyboardDrivingEnabled() {
  return state.inputMode === "keyboard" || !wheelInput.connected;
}

function isG29DrivingEnabled() {
  return state.inputMode === "g29";
}

function updateInputModeControls() {
  const keyboardActive = state.inputMode === "keyboard";
  keyboardMode?.classList.toggle("is-active", keyboardActive);
  g29Mode?.classList.toggle("is-active", !keyboardActive);
  keyboardMode?.setAttribute("aria-pressed", String(keyboardActive));
  g29Mode?.setAttribute("aria-pressed", String(!keyboardActive));
}

function getBrowserGamepads() {
  if (!navigator.getGamepads) return [];
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function isWheelCandidate(gamepad) {
  if (!gamepad) return false;
  return (
    g29DevicePattern.test(gamepad.id || "") ||
    wheelDevicePattern.test(gamepad.id || "") ||
    (gamepad.axes?.length ?? 0) > 0
  );
}

function isG29Wheel(gamepad) {
  return g29DevicePattern.test(gamepad?.id || "");
}

function findWheelInput() {
  const gamepads = getBrowserGamepads();
  return (
    gamepads.find((gamepad) => g29DevicePattern.test(gamepad.id || "")) ||
    gamepads.find((gamepad) => wheelDevicePattern.test(gamepad.id || "")) ||
    gamepads.find(isWheelCandidate) ||
    null
  );
}

function getActiveWheelInput() {
  const gamepads = getBrowserGamepads();
  if (wheelInput.index !== null) {
    const activeGamepad = gamepads.find((gamepad) => gamepad.index === wheelInput.index);
    if (activeGamepad) return activeGamepad;
  }
  return findWheelInput();
}

function refreshWheelInput() {
  const gamepad = findWheelInput();
  if (gamepad) connectWheelInput(gamepad);
  else disconnectWheelInput();
}

function connectWheelInput(gamepad) {
  const isNewDevice = !wheelInput.connected || wheelInput.index !== gamepad.index;
  wheelInput.index = gamepad.index;
  wheelInput.connected = true;
  if (isNewDevice) {
    wheelInput.axisRest = Array.from(gamepad.axes || []);
    wheelInput.brakeAxis = isG29Wheel(gamepad) && gamepad.axes?.[g29BrakeAxis] !== undefined ? g29BrakeAxis : null;
    wheelInput.gasAxis = isG29Wheel(gamepad) && gamepad.axes?.[g29GasAxis] !== undefined ? g29GasAxis : null;
    wheelInput.brakeButton = null;
    wheelInput.brakeHeld = false;
    wheelInput.brakeAmount = 0;
    wheelInput.gasAmount = 0;
    wheelInput.proceedButtonHeld = false;
    wheelInput.lastProceedButton = null;
    setHoldInput("wheel", false);
  }
  updateWheelStatus(gamepad);
}

function disconnectWheelInput() {
  wheelInput.index = null;
  wheelInput.connected = false;
  wheelInput.axisRest = [];
  wheelInput.brakeAxis = null;
  wheelInput.brakeButton = null;
  wheelInput.brakeHeld = false;
  wheelInput.brakeAmount = 0;
  wheelInput.gasAxis = null;
  wheelInput.gasAmount = 0;
  wheelInput.proceedButtonHeld = false;
  wheelInput.lastProceedButton = null;
  wheelInput.lastAxis = 0;
  setHoldInput("wheel", false);
  updateSteeringReadout(0);
  updateWheelStatus(null);
}

function getInputDebugState(gamepad, steeringValue = wheelInput.lastAxis || 0) {
  const pads = getBrowserGamepads();
  return {
    hasGamepadApi: Boolean(navigator.getGamepads),
    inputMode: state.inputMode,
    gamepadCount: pads.length,
    detectedIds: pads.map((pad) => pad.id || `Gamepad ${pad.index}`),
    activeId: gamepad?.id || null,
    axes: gamepad ? Array.from(gamepad.axes || []).map((value) => Number(value.toFixed(3))) : [],
    buttons: gamepad
      ? Array.from(gamepad.buttons || []).map((button) => Number((button.value ?? (button.pressed ? 1 : 0)).toFixed(3)))
      : [],
    steeringAxis: Number(steeringValue.toFixed(3)),
    brakeAxis: wheelInput.brakeAxis,
    brakeButton: wheelInput.brakeButton,
    brakeSource:
      wheelInput.brakeAxis !== null ? `axis ${wheelInput.brakeAxis}` : wheelInput.brakeButton !== null ? `button ${wheelInput.brakeButton}` : "none",
    g29GasAxis: gamepad && isG29Wheel(gamepad) ? g29GasAxis : null,
    gasAxis: wheelInput.gasAxis,
    gasSource: wheelInput.gasAxis !== null ? `axis ${wheelInput.gasAxis}` : "none",
    gasAmount: Number(wheelInput.gasAmount.toFixed(3)),
    brakeAmount: Number(wheelInput.brakeAmount.toFixed(3)),
    brakeHeld: wheelInput.brakeHeld,
    proceedButtons: proceedButtonCandidates,
    proceedButtonHeld: wheelInput.proceedButtonHeld,
    lastProceedButton: wheelInput.lastProceedButton,
    spaceHeld: state.spaceHeld,
    keyboardGasHeld: state.keyboardGasHeld,
    speed: Math.round(state.speed),
    targetSpeed: Math.round(state.targetSpeed)
  };
}

function updateWheelStatus(gamepad) {
  if (!wheelStatus || !wheelStatusValue) return;
  const connected = Boolean(gamepad);
  const gamepadCount = getBrowserGamepads().length;
  const usingG29 = state.inputMode === "g29";
  const hasGamepadApi = Boolean(navigator.getGamepads);
  const brakeHeld = state.keyboardSpaceHeld || (usingG29 && state.wheelBrakeHeld);
  const gasHeld = state.keyboardGasHeld || (usingG29 && wheelInput.gasAmount > gasPressThreshold);
  wheelStatus.classList.toggle("is-wheel", usingG29 && connected);
  wheelStatus.classList.toggle("is-keyboard", state.inputMode === "keyboard");
  wheelStatus.classList.toggle("is-scanning", wheelScanActive);
  wheelStatus.classList.toggle("is-throttling", gasHeld && !brakeHeld);
  wheelStatusValue.textContent =
    state.inputMode === "keyboard"
      ? state.keyboardGasHeld
        ? "Gas"
        : "Keyboard"
      : !hasGamepadApi
        ? "No API"
      : brakeHeld
        ? "Brake"
        : gasHeld
          ? "Gas"
          : connected
            ? g29DevicePattern.test(gamepad.id || "")
              ? "G29"
              : "Wheel"
            : gamepadCount > 0
              ? "Gamepad?"
              : "No G29";
  wheelStatus.classList.toggle("is-braking", brakeHeld);
  if (gamepadHint) {
    gamepadHint.textContent =
      state.inputMode === "keyboard"
        ? "Keyboard fallback active"
        : !hasGamepadApi
          ? "Gamepad API unavailable"
          : connected
            ? `Face btn: proceed`
            : wheelScanActive
              ? "Scanning: press wheel or pedal"
              : gamepadCount > 0
                ? "Gamepad seen; press G29"
                : "Click G29, then press pedal";
  }
  wheelStatus.title = connected
    ? `${state.inputMode === "g29" ? "G29" : "Keyboard"} mode. Wheel detected: ${gamepad.id || "connected device"}`
    : `${state.inputMode === "g29" ? "G29 selected, no wheel detected" : "Keyboard steering"}. Browser gamepads: ${gamepadCount}`;
  window.socialLensInputDebug = getInputDebugState(gamepad);
}

function updateSteeringReadout(
  value,
  gamepadCount = getBrowserGamepads().length,
  brakeAmount = wheelInput.brakeAmount,
  gasAmount = wheelInput.gasAmount
) {
  if (!steeringReadout) return;
  steeringReadout.textContent = `Steer ${value.toFixed(2)} | Gas ${gasAmount.toFixed(2)} | Brake ${brakeAmount.toFixed(2)} | Pads ${gamepadCount}`;
}

function normalizeWheelAxis(value) {
  const clamped = THREE.MathUtils.clamp(value || 0, -1, 1);
  const magnitude = Math.abs(clamped);
  if (magnitude < wheelDeadzone) return 0;
  return Math.sign(clamped) * ((magnitude - wheelDeadzone) / (1 - wheelDeadzone));
}

function applyWheelResponseCurve(value) {
  if (value === 0) return 0;
  return Math.sign(value) * Math.pow(Math.abs(value), wheelResponseCurve);
}

function normalizeBrakeAxis(value, rest) {
  const distance = Math.abs((value ?? rest) - rest);
  const range = Math.max(Math.abs(1 - rest), Math.abs(-1 - rest), 0.01);
  return THREE.MathUtils.clamp(distance / range, 0, 1);
}

function getBrakeButtonAmount(gamepad) {
  if (isG29Wheel(gamepad) && gamepad.axes?.[g29BrakeAxis] !== undefined) return 0;

  const buttons = gamepad.buttons || [];
  const buttonAmount = (index) => {
    const button = buttons[index];
    if (!button) return 0;
    return button.value ?? (button.pressed ? 1 : 0);
  };

  if (
    wheelInput.brakeButton !== null &&
    !proceedButtonCandidates.includes(wheelInput.brakeButton) &&
    buttons[wheelInput.brakeButton]
  ) {
    return buttonAmount(wheelInput.brakeButton);
  }

  let bestButton = null;
  let bestAmount = 0;
  buttons.forEach((button, index) => {
    if (proceedButtonCandidates.includes(index)) return;
    const amount = button.value ?? (button.pressed ? 1 : 0);
    if (amount > bestAmount) {
      bestButton = index;
      bestAmount = amount;
    }
  });

  if (bestButton !== null && bestAmount > brakePressThreshold) wheelInput.brakeButton = bestButton;
  return bestAmount;
}

function getBrakeAxisAmount(gamepad) {
  const axes = gamepad.axes || [];
  if (!axes.length) return 0;
  if (wheelInput.axisRest.length !== axes.length) wheelInput.axisRest = Array.from(axes);

  const amountForAxis = (index) => normalizeBrakeAxis(axes[index], wheelInput.axisRest[index] ?? axes[index] ?? 0);
  if (isG29Wheel(gamepad) && axes[g29BrakeAxis] !== undefined) {
    wheelInput.brakeAxis = g29BrakeAxis;
    return amountForAxis(g29BrakeAxis);
  }

  if (wheelInput.brakeAxis !== null && axes[wheelInput.brakeAxis] !== undefined) {
    return amountForAxis(wheelInput.brakeAxis);
  }

  let bestAxis = null;
  let bestAmount = 0;
  const candidates = isG29Wheel(gamepad) ? g29BrakeAxisCandidates : brakeAxisCandidates;
  candidates.forEach((index) => {
    if (isG29Wheel(gamepad) && index === g29GasAxis) return;
    if (index === wheelInput.axis || axes[index] === undefined) return;
    const amount = amountForAxis(index);
    if (amount > bestAmount) {
      bestAxis = index;
      bestAmount = amount;
    }
  });

  if (bestAxis !== null && bestAmount > brakePressThreshold) wheelInput.brakeAxis = bestAxis;
  return bestAmount;
}

function getGasAxisAmount(gamepad) {
  const axes = gamepad.axes || [];
  if (!axes.length) return 0;
  if (wheelInput.axisRest.length !== axes.length) wheelInput.axisRest = Array.from(axes);

  const amountForAxis = (index) => normalizeBrakeAxis(axes[index], wheelInput.axisRest[index] ?? axes[index] ?? 0);
  if (isG29Wheel(gamepad) && axes[g29GasAxis] !== undefined) {
    wheelInput.gasAxis = g29GasAxis;
    return amountForAxis(g29GasAxis);
  }

  if (wheelInput.gasAxis !== null && axes[wheelInput.gasAxis] !== undefined) {
    return amountForAxis(wheelInput.gasAxis);
  }

  let bestAxis = null;
  let bestAmount = 0;
  const candidates = isG29Wheel(gamepad) ? g29GasAxisCandidates : gasAxisCandidates;
  candidates.forEach((index) => {
    if (index === wheelInput.axis || index === wheelInput.brakeAxis || axes[index] === undefined) return;
    const amount = amountForAxis(index);
    if (amount > bestAmount) {
      bestAxis = index;
      bestAmount = amount;
    }
  });

  if (bestAxis !== null && bestAmount > gasPressThreshold) wheelInput.gasAxis = bestAxis;
  return bestAmount;
}

function updateWheelBrakeInput(gamepad) {
  const brakeAmount = Math.max(getBrakeButtonAmount(gamepad), getBrakeAxisAmount(gamepad));
  wheelInput.brakeAmount = brakeAmount;
  const brakeHeld = wheelInput.brakeHeld ? brakeAmount > brakeReleaseThreshold : brakeAmount > brakePressThreshold;
  if (brakeHeld === wheelInput.brakeHeld) return;
  wheelInput.brakeHeld = brakeHeld;
  setHoldInput("wheel", brakeHeld);
  updateWheelStatus(gamepad);
}

function updateWheelGasInput(gamepad) {
  wheelInput.gasAmount = isG29DrivingEnabled() ? getGasAxisAmount(gamepad) : 0;
}

function getProceedButtonPress(gamepad) {
  const buttons = gamepad.buttons || [];
  let pressedButton = null;
  let pressedAmount = 0;

  proceedButtonCandidates.forEach((index) => {
    if (index === wheelInput.brakeButton) return;
    const button = buttons[index];
    if (!button) return;
    const amount = button.value ?? (button.pressed ? 1 : 0);
    if (amount > pressedAmount) {
      pressedButton = index;
      pressedAmount = amount;
    }
  });

  return pressedAmount > proceedButtonPressThreshold ? pressedButton : null;
}

function updateWheelProceedInput(gamepad) {
  if (!isG29DrivingEnabled()) {
    wheelInput.proceedButtonHeld = false;
    return;
  }

  const pressedButton = getProceedButtonPress(gamepad);
  const isPressed = pressedButton !== null;
  if (isPressed && !wheelInput.proceedButtonHeld) {
    wheelInput.lastProceedButton = pressedButton;
    proceedWithCurrentScenario();
  }
  wheelInput.proceedButtonHeld = isPressed;
}

function updateWheelInput(delta) {
  const gamepad = getActiveWheelInput();
  if (!gamepad) {
    if (wheelInput.connected) disconnectWheelInput();
    updateSteeringReadout(0);
    return;
  }

  if (!wheelInput.connected || wheelInput.index !== gamepad.index) connectWheelInput(gamepad);

  if (!isG29DrivingEnabled()) {
    wheelInput.gasAmount = 0;
    wheelInput.brakeAmount = 0;
    wheelInput.proceedButtonHeld = false;
    if (wheelInput.brakeHeld) {
      wheelInput.brakeHeld = false;
      setHoldInput("wheel", false);
    }
    updateSteeringReadout(0);
    updateWheelStatus(gamepad);
    return;
  }

  const axis = normalizeWheelAxis(gamepad.axes[wheelInput.axis] ?? 0);
  const steeringAxis = applyWheelResponseCurve(axis);
  const target = steeringAxis < 0 ? steeringAxis * wheelLeftLimit : steeringAxis * wheelRightLimit;
  const previousTarget = state.targetLateral;
  state.targetLateral = THREE.MathUtils.damp(
    state.targetLateral,
    THREE.MathUtils.clamp(target, -lateralLeftLimit, lateralRightLimit),
    10.8,
    delta
  );
  state.steeringImpulse = THREE.MathUtils.clamp((state.targetLateral - previousTarget) * 2.8, -0.52, 0.52);
  wheelInput.lastAxis = axis;
  updateWheelGasInput(gamepad);
  updateWheelBrakeInput(gamepad);
  updateWheelProceedInput(gamepad);
  updateSteeringReadout(axis);
  window.socialLensInputDebug = getInputDebugState(gamepad, axis);
  updateWheelStatus(gamepad);
}

function setEmergencySirenActive(active) {
  const shouldPlay = active && state.soundOn;
  soundToggle?.classList.toggle("is-sounding", shouldPlay);
  if (shouldPlay) {
    startEmergencySiren();
  } else {
    stopEmergencySiren();
  }
}

function syncSoundToggle() {
  soundToggle.classList.toggle("is-active", state.soundOn);
  soundToggle.classList.toggle("is-muted", !state.soundOn);
  soundToggle.classList.toggle("is-sounding", state.soundOn && siren.active);
  soundToggle.setAttribute("aria-pressed", String(state.soundOn));
  const soundLabel = !state.soundOn ? "Sound muted" : siren.active ? "Siren playing" : "Sound";
  soundToggle.setAttribute("aria-label", soundLabel);
  soundToggle.setAttribute("title", soundLabel);
  soundToggle.innerHTML = `<i data-lucide="${state.soundOn ? "volume-2" : "volume-x"}"></i>`;
  createIcons({ icons });
}

function startEmergencySiren() {
  if (!state.soundOn) return;
  if (siren.active) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    if (typeof Audio === "undefined") return;
    if (!siren.audio) siren.audio = createEmergencySirenAudio();
    siren.audio.currentTime = 0;
    const playback = siren.audio.play();
    siren.active = true;
    syncSoundToggle();
    playback?.catch?.(() => {
      siren.active = false;
      syncSoundToggle();
    });
    return;
  }

  if (!siren.context) {
    siren.context = new AudioContext();
    siren.oscillator = siren.context.createOscillator();
    siren.gain = siren.context.createGain();
    siren.lfo = siren.context.createOscillator();
    siren.lfoGain = siren.context.createGain();

    siren.oscillator.type = "sawtooth";
    siren.oscillator.frequency.value = 620;
    siren.gain.gain.value = 0;
    siren.lfo.type = "sine";
    siren.lfo.frequency.value = 0.82;
    siren.lfoGain.gain.value = 330;
    siren.lfo.connect(siren.lfoGain);
    siren.lfoGain.connect(siren.oscillator.frequency);
    siren.oscillator.connect(siren.gain);
    siren.gain.connect(siren.context.destination);
    siren.oscillator.start();
    siren.lfo.start();
  }

  siren.context.resume().catch?.(() => {
    siren.active = false;
    syncSoundToggle();
  });
  const now = siren.context.currentTime;
  siren.gain.gain.cancelScheduledValues(now);
  siren.gain.gain.setValueAtTime(siren.gain.gain.value, now);
  siren.gain.gain.linearRampToValueAtTime(emergencySirenVolume, now + 0.22);
  siren.active = true;
  syncSoundToggle();
}

function stopEmergencySiren() {
  if (siren.audio) {
    siren.audio.pause();
    siren.audio.currentTime = 0;
  }
  if (!siren.context || !siren.gain) {
    siren.active = false;
    syncSoundToggle();
    return;
  }
  const now = siren.context.currentTime;
  siren.gain.gain.cancelScheduledValues(now);
  siren.gain.gain.setValueAtTime(siren.gain.gain.value, now);
  siren.gain.gain.linearRampToValueAtTime(0, now + 0.22);
  siren.active = false;
  syncSoundToggle();
}

function createEmergencySirenAudio() {
  const sampleRate = 22050;
  const duration = 2.4;
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);

  writeWavString(view, 0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeWavString(view, 8, "WAVE");
  writeWavString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeWavString(view, 36, "data");
  view.setUint32(40, sampleCount * 2, true);

  let phase = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const sweep = Math.sin(time * Math.PI * 2 * 0.82) * 0.5 + 0.5;
    const frequency = 500 + sweep * 430;
    phase += (Math.PI * 2 * frequency) / sampleRate;
    const tone = Math.sin(phase) * 0.62 + Math.sin(phase * 1.98) * 0.18;
    const texture = Math.sin(time * Math.PI * 2 * 7.4) * 0.05;
    const sample = THREE.MathUtils.clamp((tone + texture) * 0.3, -1, 1);
    view.setInt16(44 + index * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  const audio = new Audio(`data:audio/wav;base64,${btoa(binary)}`);
  audio.loop = true;
  audio.volume = 0.52;
  return audio;
}

function writeWavString(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function isSpaceKey(event) {
  return event.key === " " || event.key === "Spacebar" || event.code === "Space";
}

function isKeyboardGasKey(event) {
  return event.key === "ArrowUp" || event.key.toLowerCase() === "w";
}

function chooseScenarioDecision(choice) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id === "yielding") {
    chooseYieldingMerge(choice === "stop" ? "yield" : "proceed");
    return;
  }
  chooseRightOfWay(choice);
}

function proceedWithCurrentScenario() {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id === "yielding") {
    chooseYieldingMerge("proceed");
    return;
  }

  if (scenario.id === "right-of-way") {
    chooseRightOfWay("follow");
    return;
  }

  state.targetSpeed = Math.max(state.targetSpeed, scenario.recommendedSpeed ?? 24);
  guidanceStatus.textContent = "Proceed";
  intentLabel.textContent = scenario.intent;
  intentCopy.textContent = scenario.copy;
  nextMove.textContent = scenario.next;
}

function setHoldInput(source, held) {
  if (source === "keyboard") state.keyboardSpaceHeld = held;
  if (source === "wheel") state.wheelBrakeHeld = held;
  const shouldHold = state.keyboardSpaceHeld || state.wheelBrakeHeld;
  if (shouldHold !== state.spaceHeld) setSpaceHeld(shouldHold);
  updateWheelStatus(getActiveWheelInput());
}

function setSpaceHeld(held) {
  const wasHeld = state.spaceHeld;
  state.spaceHeld = held;
  if (held && !wasHeld) {
    state.holdStartTime = state.time;
    state.holdStartSpeed = Math.max(state.speed, 0);
  } else if (!held) {
    state.holdStartTime = null;
    state.holdStartSpeed = 0;
  }

  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id === "yielding") {
    if (held) {
      chooseYieldingMerge("yield", { fromSpace: true });
    } else if (state.decisionChoice === "yield") {
      state.targetSpeed = scenario.recommendedSpeed ?? 26;
      guidanceStatus.textContent = "Proceeding";
      nextMove.textContent = "Release: continue through.";
      updateDecisionControls();
    }
    return;
  }

  if (held) {
    if (scenario.id === "compression") {
      state.targetSpeed = scenario.recommendedSpeed ?? 16;
      guidanceStatus.textContent = "Traffic pace";
      nextMove.textContent = "Hold pace and follow the left guide.";
      return;
    }
    state.targetSpeed = Math.min(state.targetSpeed, scenario.id === "right-of-way" ? 10 : 12);
    guidanceStatus.textContent = scenario.id === "emergency" ? "Yield right" : "Slowing";
    if (scenario.id === "emergency") nextMove.textContent = "Hold Space/brake: slow and move right.";
  } else {
    state.targetSpeed = scenario.recommendedSpeed ?? 24;
    guidanceStatus.textContent =
      scenario.id === "hazard"
        ? "Steer left"
        : scenario.id === "emergency"
          ? "Move right"
          : scenario.id === "compression"
            ? "Reduce speed"
            : "Monitoring";
    if (scenario.id === "emergency") nextMove.textContent = scenario.next;
    if (scenario.id === "compression") nextMove.textContent = scenario.next;
  }
}

function chooseYieldingMerge(choice, options = {}) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "yielding") return;

  const isNewChoice = state.decisionChoice !== choice || !state.decisionMade;
  state.decisionChoice = choice;
  state.decisionMade = true;
  if (isNewChoice) {
    state.yieldingChoiceTime = state.time;
    state.yieldingMergeReadyTime = null;
  }

  if (choice === "yield") {
    state.targetSpeed = options.fromSpace || state.spaceHeld ? 9 : 12;
    guidanceStatus.textContent = state.spaceHeld ? "Holding" : "Slowing";
    intentLabel.textContent = "Merging car";
    intentCopy.textContent = "Hold space behind the merging car.";
    nextMove.textContent = state.spaceHeld ? "Hold Space/brake: create the gap." : "Slow to create the gap.";
  } else {
    state.targetSpeed = scenario.recommendedSpeed ?? 26;
    guidanceStatus.textContent = "Proceed";
    intentLabel.textContent = "Forward path";
    intentCopy.textContent = "Merging car is waiting.";
    nextMove.textContent = "Follow the continuous forward path.";
  }

  updateDecisionControls();
}

function chooseRightOfWay(choice) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "right-of-way") return;

  state.decisionChoice = choice;
  state.decisionMade = true;
  resetDecisionOverlays(choice);
  if (choice === "stop") {
    state.rightOfWayStopZ = rightOfWayStopPointTargetZ;
    state.rightOfWayStopMarkerStartZ = getHoldZoneZ();
    state.stopStartSpeed = Math.max(state.speed, 0);
    state.stopDecisionTime = state.time;
    state.rightOfWayYieldTime = null;
    state.targetSpeed = 0;
    guidanceStatus.textContent = "Braking";
    intentLabel.textContent = "Slowing";
    intentCopy.textContent = "Stopping at stop point.";
    nextMove.textContent = "Stop point.";
  } else {
    state.rightOfWayStopZ = null;
    state.rightOfWayStopMarkerStartZ = null;
    state.stopStartSpeed = 0;
    state.stopDecisionTime = 0;
    state.rightOfWayYieldTime = null;
    state.targetSpeed = 22;
    guidanceStatus.textContent = "Best path";
    intentLabel.textContent = "Continue";
    intentCopy.textContent = "Override: forward path is clear.";
    nextMove.textContent = "Follow the continuous forward path.";
  }

  updateDecisionControls();
}

function resetDecisionOverlays(choice) {
  overlayGroup.children.forEach((overlay) => {
    if (
      overlay.userData.choice === choice &&
      !overlay.userData.target &&
      !overlay.userData.beforeTarget &&
      overlay.userData.rightOfWayCue !== "hold-zone"
    ) {
      overlay.position.set(0, 0, 0);
    }
  });
}

function getHoldZoneZ() {
  const holdZone = getHoldZoneOverlay();
  if (!holdZone) return null;
  return holdZone.position.z;
}

function getHoldZoneStopPointZ() {
  const holdZone = getHoldZoneOverlay();
  if (!holdZone) return null;
  return holdZone.position.z + (holdZone.userData.stopPointLocalZ ?? 0);
}

function getHoldZoneOverlay() {
  return overlayGroup.children.find((overlay) => overlay.userData.rightOfWayCue === "hold-zone");
}

function getRightOfWayStopZ() {
  return state.rightOfWayStopZ ?? rightOfWayStopPointTargetZ;
}

function setDecisionButtonText(button, title, detail, tag) {
  button.querySelector("strong").textContent = title;
  button.querySelector("small").textContent = detail;
  button.querySelector(".choice-tag").textContent = tag;
}

function isYieldingHoldPromptActive() {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "yielding") return false;
  if (state.decisionMade) return true;
  return state.time - state.scenarioStartTime >= (scenario.promptDelay ?? 2.2);
}

function updateDecisionControls() {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  const isRightOfWay = scenario.id === "right-of-way";
  const isYielding = scenario.id === "yielding";
  const showYieldingPrompt = isYielding && isYieldingHoldPromptActive();
  const hasChoices = isRightOfWay || showYieldingPrompt;
  interpretationPanel.classList.toggle("has-decisions", hasChoices);
  interpretationPanel.classList.toggle("is-yielding", isYielding);
  decisionPanel.setAttribute("aria-hidden", String(!hasChoices));

  if (isYielding) {
    setDecisionButtonText(stopChoice, "Hold", "Create gap", "Recommended");
    setDecisionButtonText(pathChoice, "Proceed", "Forward path", "If clear");
    stopChoice.classList.toggle("is-recommended", true);
    stopChoice.classList.toggle("is-active", state.decisionChoice === "yield");
    pathChoice.classList.toggle("is-active", state.decisionChoice === "proceed");

    if (!state.decisionMade) {
      if (showYieldingPrompt) {
        guidanceStatus.textContent = "Hold gap?";
        intentLabel.textContent = "Merging car";
        intentCopy.textContent = "Right-lane car is asking for space.";
        nextMove.textContent = "Hold Space or brake to create the gap.";
      } else {
        guidanceStatus.textContent = "Proceeding";
        intentLabel.textContent = "Forward path";
        intentCopy.textContent = "Continue ahead. The merging car is waiting.";
        nextMove.textContent = "Hold course.";
      }
    } else if (state.decisionChoice === "yield") {
      guidanceStatus.textContent = state.yieldingMergeReadyTime === null ? (state.spaceHeld ? "Holding" : "Slowing") : "Merging";
      intentLabel.textContent = "Merging car";
      intentCopy.textContent =
        state.yieldingMergeReadyTime === null ? "Hold space behind the merging car." : "Merging car entering.";
      nextMove.textContent =
        state.yieldingMergeReadyTime === null ? "Hold Space/brake: create the gap." : "Continue after yielding.";
    } else {
      guidanceStatus.textContent = "Proceed";
      intentLabel.textContent = "Forward path";
      intentCopy.textContent = "Merging car is waiting.";
      nextMove.textContent = "Follow the continuous forward path.";
    }
    return;
  }

  if (!hasChoices) return;

  setDecisionButtonText(stopChoice, "Stop", "Hold before car", "Recommended");
  setDecisionButtonText(pathChoice, "Continue", "Best path", "Override");
  stopChoice.classList.toggle("is-recommended", isRightOfWay && !state.decisionMade);
  stopChoice.classList.toggle("is-active", isRightOfWay && state.decisionChoice === "stop");
  pathChoice.classList.toggle("is-active", isRightOfWay && state.decisionChoice === "follow" && state.decisionMade);

  if (isRightOfWay && !state.decisionMade) {
    guidanceStatus.textContent = "Decision";
    intentLabel.textContent = "Waiting car";
    intentCopy.textContent = "Stop point is before it.";
    nextMove.textContent = "Stop at stop point.";
  } else if (isRightOfWay && state.decisionChoice === "follow") {
    guidanceStatus.textContent = "Best path";
    intentLabel.textContent = "Continue";
    intentCopy.textContent = "Override: forward path is clear.";
    nextMove.textContent = "Follow the continuous forward path.";
  }
}

function steer(amount) {
  state.targetLateral = THREE.MathUtils.clamp(state.targetLateral + amount, -lateralLeftLimit, lateralRightLimit);
  state.steeringImpulse = amount;
}

function changeSpeed(delta) {
  state.targetSpeed = THREE.MathUtils.clamp(state.targetSpeed + delta, 0, maxVehicleSpeed);
  speedReadout.textContent = Math.round(state.targetSpeed);
}

function getG29ThrottleAmount() {
  if (!isG29DrivingEnabled() || state.wheelBrakeHeld || state.spaceHeld) return 0;
  return wheelInput.gasAmount > gasPressThreshold ? wheelInput.gasAmount : 0;
}

function getDriveThrottleAmount() {
  if (state.spaceHeld) return 0;
  if (isKeyboardDrivingEnabled() && state.keyboardGasHeld) return 0.68;
  return getG29ThrottleAmount();
}

function getThrottleSpeedLimit(scenario) {
  return maxVehicleSpeed;
}

function getDriveTargetSpeed(scenario) {
  const baseTarget = state.targetSpeed;
  const throttle = getDriveThrottleAmount();
  if (throttle <= 0) return 0;

  const scenarioCruise = scenario.recommendedSpeed ?? baseTarget;
  const rollTarget = Math.max(baseTarget, scenarioCruise, state.speed, 8);
  return THREE.MathUtils.lerp(rollTarget, getThrottleSpeedLimit(scenario), throttle);
}

function getDriveSpeedBlend() {
  return 0.025 + getDriveThrottleAmount() * 0.055;
}

function applyHeldBrakeStop(scenario) {
  if (!state.spaceHeld || state.holdStartTime === null) return false;

  const holdElapsed = Math.max(0, state.time - state.holdStartTime);
  const brakeProgress = THREE.MathUtils.smoothstep(holdElapsed, 0, holdStopDuration);
  const startSpeed = Math.max(state.holdStartSpeed || state.speed, 0);
  const brakeTarget = THREE.MathUtils.lerp(startSpeed, 0, brakeProgress);

  state.speed = holdElapsed >= holdStopDuration ? 0 : Math.min(state.speed, brakeTarget);
  state.targetSpeed = Math.min(state.targetSpeed, state.speed);

  if (state.speed <= 0.45) {
    state.speed = 0;
    guidanceStatus.textContent = "Holding";
    nextMove.textContent = "Release to continue.";
  } else if (holdElapsed > 0.35) {
    guidanceStatus.textContent = "Braking";
    if (scenario.id === "yielding") nextMove.textContent = "Smooth stop; let them in.";
    else if (scenario.id === "compression") nextMove.textContent = "Smooth stop with traffic.";
    else nextMove.textContent = "Smooth stop.";
  }

  return true;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.045);
  if (!state.paused) {
    state.time += delta;
    const scenario = scenarioDefinitions[state.scenarioIndex];
    const yieldingDecisionHold = scenario.id === "yielding" && (state.spaceHeld || state.decisionMade) && state.speed <= 0.5;
    const scenarioClockActive =
      !yieldingDecisionHold && (state.speed > 0.5 || getDriveThrottleAmount() > 0 || state.spaceHeld || state.decisionMade);
    if (scenarioClockActive) state.scenarioElapsed += delta;
    if (scenario.id === "right-of-way" && state.decisionMade && state.decisionChoice === "stop") {
      const holdZone = getHoldZoneOverlay();
      const stopTargetZ = getRightOfWayStopZ();
      const stopPointLocalZ = holdZone?.userData.stopPointLocalZ ?? 0;
      const markerTargetZ = stopTargetZ - stopPointLocalZ;
      const markerStartZ = state.rightOfWayStopMarkerStartZ ?? holdZone?.position.z ?? markerTargetZ;
      state.rightOfWayStopMarkerStartZ = markerStartZ;

      const stopElapsed = Math.max(0, state.time - state.stopDecisionTime);
      const stopTravel = Math.max(0.1, markerTargetZ - markerStartZ);
      const stopDuration = THREE.MathUtils.clamp(stopTravel / 6.1, 4.4, 6.1);
      const rawStopProgress = THREE.MathUtils.clamp(stopElapsed / stopDuration, 0, 1);
      const arrivalProgress = 1 - Math.pow(1 - rawStopProgress, 2.35);

      if (holdZone) {
        holdZone.position.x = THREE.MathUtils.lerp(holdZone.position.x, holdZone.userData.laneX ?? holdZone.position.x, 0.22);
        holdZone.position.z = THREE.MathUtils.lerp(markerStartZ, markerTargetZ, arrivalProgress);
      }

      const holdZoneZ = getHoldZoneStopPointZ();
      const distanceToHold = holdZoneZ === null ? 0 : stopTargetZ - holdZoneZ;
      const isOnStopPoint = holdZoneZ !== null && (distanceToHold <= 0.14 || rawStopProgress >= 0.995);

      if (!isOnStopPoint) {
        const brakeProgress = THREE.MathUtils.smoothstep(rawStopProgress, 0.02, 1);
        const rollSpeed = THREE.MathUtils.lerp(state.stopStartSpeed || state.speed, 4.2, brakeProgress);
        state.speed = THREE.MathUtils.damp(state.speed, rollSpeed, 1.28, delta);
        guidanceStatus.textContent = "Braking";
        intentLabel.textContent = "Slowing";
        intentCopy.textContent = "Stopping at stop point.";
        nextMove.textContent = "Stop point.";
      } else if (state.speed > 0.45) {
        state.speed = THREE.MathUtils.damp(state.speed, 0, 2.35, delta);
        guidanceStatus.textContent = "Braking";
        intentLabel.textContent = "Slowing";
        intentCopy.textContent = "On the stop point.";
        nextMove.textContent = "Stop point.";
      } else {
        state.speed = 0;
        guidanceStatus.textContent = "Holding";
        intentLabel.textContent = "Holding";
        intentCopy.textContent = "At stop point.";
        nextMove.textContent = "Wait.";
      }
      if (state.rightOfWayYieldTime === null && isOnStopPoint && state.speed <= 1.35) {
        state.rightOfWayYieldTime = state.time;
      }
      if (state.rightOfWayYieldTime !== null) setRightOfWayTurnCopy();
    } else {
      const driveTargetSpeed = getDriveTargetSpeed(scenario);
      if (applyHeldBrakeStop(scenario)) {
        // Speed is handled by the held brake curve above.
      } else if (scenario.id === "compression" && state.speed > driveTargetSpeed) {
        state.speed = THREE.MathUtils.damp(state.speed, driveTargetSpeed, 1.15, delta);
      } else {
        state.speed = THREE.MathUtils.lerp(state.speed, driveTargetSpeed, getDriveSpeedBlend());
      }
    }
    speedReadout.textContent = Math.round(state.speed);
    const pace = state.speed / 38;
    state.roadOffset = (state.roadOffset + delta * pace * 7.1) % 8;
    materials.road.map.offset.y = -state.roadOffset * 0.028;
    if (materials.shoulder?.map) materials.shoulder.map.offset.y = -state.roadOffset * 0.022;
    if (materials.ground?.map) materials.ground.map.offset.y = -state.roadOffset * 0.01;
    roadMarkGroup.children.forEach((mark) => {
      if (mark.geometry.parameters.height < 20) {
        mark.position.z += delta * pace * 13;
        if (mark.position.z > 8) mark.position.z -= 272;
      }
    });
    moveRoadside(roadsideGroup, delta * pace * 9);
    updateCenterDisplayCone(delta);
  }

  updateWheelInput(delta);
  state.lateral = THREE.MathUtils.lerp(state.lateral, state.targetLateral, 0.07);
  camera.position.x = state.lateral;
  camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.12);
  camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, 0.12);
  const wheelTarget = THREE.MathUtils.clamp(state.lateral * 12 + state.steeringImpulse * 20, -34, 34);
  state.wheelAngle = THREE.MathUtils.lerp(state.wheelAngle, wheelTarget, 0.08);
  steeringWheel.style.setProperty("--wheel-angle", `${state.wheelAngle.toFixed(2)}deg`);
  state.steeringImpulse = THREE.MathUtils.lerp(state.steeringImpulse, 0, 0.08);

  const activeScenario = scenarioDefinitions[state.scenarioIndex];
  if (!state.paused && activeScenario.id === "yielding" && !state.decisionMade) {
    updateDecisionControls();
  }

  updateTraffic(delta);
  updateOverlays(delta);
  restartScenarioMomentIfNeeded();
  publishCenterDisplayTelemetry();

  renderer.render(scene, camera);
}

function restartScenarioMomentIfNeeded() {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (!scenario.loopDuration || state.paused) return;

  if (scenario.id === "right-of-way" && state.decisionMade && state.decisionChoice === "stop") {
    if (state.speed <= 0.45 && guidanceStatus.textContent === "Holding") {
      if (state.holdCompleteTime === null) state.holdCompleteTime = state.time;
      const hasTurned = state.rightOfWayYieldTime !== null;
      const turnComplete = hasTurned && state.time - state.rightOfWayYieldTime > 4.7;
      const holdComplete = !hasTurned && state.time - state.holdCompleteTime > 2.2;
      if (turnComplete || holdComplete) activateScenario(state.scenarioIndex);
    } else {
      state.holdCompleteTime = null;
    }
    return;
  }

  if (scenario.id === "compression") {
    const accident = visibleVehicleMap.get("accident");
    const accidentCleared = accident && accident.position.z > 13;
    if (accidentCleared || state.scenarioElapsed > scenario.loopDuration) {
      activateScenario(state.scenarioIndex);
    }
    return;
  }

  if (state.scenarioElapsed > scenario.loopDuration) {
    activateScenario(state.scenarioIndex);
  }
}

function moveRoadside(group, advance) {
  if (advance <= 0) return;
  group.children.forEach((child) => {
    child.position.z += advance;
    const loopResetZ = child.userData.loopResetZ ?? 22;
    const loopLength = child.userData.loopLength ?? 286;
    if (child.position.z > loopResetZ) child.position.z -= loopLength;
  });
}

function getYieldingMergeProgress() {
  if (state.decisionChoice === "yield") {
    const holdElapsed = state.holdStartTime === null ? 0 : Math.max(0, state.time - state.holdStartTime);
    const holdSpaceCreated = state.speed <= 2.4 || (state.spaceHeld && holdElapsed >= 2.4);
    if (state.yieldingMergeReadyTime === null && holdSpaceCreated) {
      state.yieldingMergeReadyTime = state.time;
      guidanceStatus.textContent = "Merging";
      intentCopy.textContent = "Hold space created.";
      nextMove.textContent = "Merging car entering.";
    }
    if (state.yieldingMergeReadyTime === null) return 0;
    const mergeElapsed = state.time - state.yieldingMergeReadyTime;
    return smootherStep01((mergeElapsed - 0.45) / 4.35);
  }
  if (state.decisionChoice === "proceed") {
    return 0;
  }
  return THREE.MathUtils.smoothstep(state.scenarioElapsed, 0.9, 2.2) * 0.08;
}

function smootherStep01(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function getYieldingMergeMotion(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  return {
    z: smootherStep01((p + 0.1) / 0.96),
    lane: smootherStep01((p - 0.12) / 0.82),
    yaw: smootherStep01((p - 0.04) / 0.9)
  };
}

function updateTraffic(delta) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  const pace = state.speed / 38;
  trafficGroup.children.forEach((vehicle) => {
    const data = vehicle.userData;
    const previousZ = vehicle.position.z;
    const pulse = Math.sin(state.time * 1.6 + data.phase) * 0.5 + 0.5;
    const isRearEmergency = scenario.id === "emergency" && data.approachFromBehind;
    const isRightOfWayWaiter = scenario.id === "right-of-way" && data.name === "waiter";

    if (isRearEmergency) {
      updateRearEmergencyVehicle(vehicle, data, delta);
    } else if (isRightOfWayWaiter) {
      updateRightOfWayWaiter(vehicle, data, delta, pace);
    } else if (scenario.id === "compression") {
      updateCompressionTrafficVehicle(vehicle, data, delta, pace);
    } else if (scenario.id === "emergency") {
      updateEmergencyTrafficVehicle(vehicle, data, delta, pace);
    } else if (!state.paused) {
      vehicle.position.z += delta * (8 * pace + getAmbientTrafficAdvance(scenario, data));
      if (!scenario.loopDuration && vehicle.position.z > -5) {
        vehicle.position.z = data.baseZ - 78;
      }
    }
    const isMerging = data.mergeToLane !== undefined && !isRearEmergency && !isRightOfWayWaiter;
    const mergeProgress = isMerging
      ? scenario.id === "yielding"
        ? getYieldingMergeProgress()
        : THREE.MathUtils.smoothstep(state.scenarioElapsed, data.mergeStart ?? 1, data.mergeEnd ?? 7)
      : 0;
    const yieldingMotion = isMerging && scenario.id === "yielding" ? getYieldingMergeMotion(mergeProgress) : null;
    const laneProgress = yieldingMotion?.lane ?? mergeProgress;
    const zProgress = yieldingMotion?.z ?? mergeProgress;
    const yawProgress = yieldingMotion?.yaw ?? mergeProgress;
    const desiredLane = isMerging ? THREE.MathUtils.lerp(data.baseLane, data.mergeToLane, laneProgress) : data.baseLane;
    const desiredX = desiredLane * laneWidth + (isMerging ? 0 : (data.lateral || 0) * (0.5 + pulse * 0.5));
    const desiredYaw = (data.yaw || 0) + (isMerging ? Math.sin(yawProgress * Math.PI) * (data.mergeYaw || 0) : 0);
    if (!isRearEmergency && !isRightOfWayWaiter) {
      if (isMerging && typeof data.mergeToZ === "number") {
        const desiredMergeZOffset = (data.mergeToZ - data.baseZ) * zProgress;
        const currentMergeZOffset = data.currentMergeZOffset || 0;
        const nextMergeZOffset = THREE.MathUtils.damp(currentMergeZOffset, desiredMergeZOffset, 2.2, delta);
        vehicle.position.z += nextMergeZOffset - currentMergeZOffset;
        data.currentMergeZOffset = nextMergeZOffset;
      }
      vehicle.position.x = THREE.MathUtils.lerp(vehicle.position.x, desiredX, isMerging ? 0.032 : 0.025);
      vehicle.rotation.y = THREE.MathUtils.lerp(vehicle.rotation.y, desiredYaw, isMerging ? 0.036 : 0.035);
    }
    vehicle.rotation.z = Math.sin(state.time * 1.2 + data.phase) * 0.006;
    const wheelTravel = vehicle.position.z - previousZ;
    vehicle.traverse((child) => {
      if (child.userData.vehicleWheel) {
        child.userData.spin += wheelTravel * 2.2;
        child.rotation.set(child.userData.spin, 0, Math.PI / 2);
      }
      if (child.userData.emergencyLight) {
        const flashPhase = child.userData.emergencyLight === "red" ? 0 : Math.PI;
        child.material.opacity = 0.28 + (Math.sin(state.time * 12 + flashPhase) * 0.5 + 0.5) * 0.72;
      }
      if (child.material && child.material.opacity !== undefined && data.brake && child.material.color?.getHexString?.() === "ff3832") {
        child.material.opacity = 0.56 + pulse * 0.34;
      }
    });
  });

  const comfort = scenario.comfort + Math.sin(state.time * 0.9) * 3 - Math.abs(state.lateral) * 8;
  if (comfortReadout) comfortReadout.textContent = Math.round(THREE.MathUtils.clamp(comfort, 1, 99));
}

function getAmbientTrafficAdvance(scenario, data) {
  const scriptedSpeed = (data.speed || 0) * 5;
  if (scenario.id === "yielding") {
    if (data.name === "merge") return scriptedSpeed + 0.08;
    return scriptedSpeed + 1.72;
  }
  if (scenario.id === "emergency" && !data.emergency) return scriptedSpeed + 4.6;
  if (scenario.id === "hazard") return scriptedSpeed + 1.82;
  if (scenario.id === "right-of-way" && data.name !== "waiter") return scriptedSpeed + 1.75;
  return scriptedSpeed;
}

function updateCompressionTrafficVehicle(vehicle, data, delta, pace) {
  if (state.paused) return;

  const nearVehicle = visibleVehicleMap.get("near");
  if (!state.compressionTrafficReleased && nearVehicle?.position.z > -34) {
    state.compressionTrafficReleased = true;
    guidanceStatus.textContent = "Traffic moving";
    nextMove.textContent = "Match the opening traffic pace.";
  }

  const egoAdvance = 8 * pace;
  const approachingTraffic = nearVehicle?.position.z > -44;
  const trafficForward = state.compressionTrafficReleased
    ? (data.trafficFlow ?? 0.74) * 2.75
    : approachingTraffic
      ? (data.trafficFlow ?? 0.74) * 1.15
      : 0;
  const relativeAdvance = egoAdvance - trafficForward;
  vehicle.position.z += delta * relativeAdvance;

  if (data.trafficFlow > 0 && vehicle.position.z > -14) {
    vehicle.position.z = data.baseZ - 36;
  }
}

function updateEmergencyTrafficVehicle(vehicle, data, delta, pace) {
  if (state.paused) return;
  const laneBias = data.name === "traffic-center" ? 0.88 : data.name === "traffic-left" ? 1.08 : 0.96;
  const egoAdvance = 8 * pace;
  const trafficForward = getAmbientTrafficAdvance(scenarioDefinitions[state.scenarioIndex], data) * laneBias;
  vehicle.position.z += delta * (egoAdvance - trafficForward);
  if (vehicle.position.z < data.baseZ - 58) {
    vehicle.position.z = data.baseZ + 28;
  }
}

function updateRightOfWayWaiter(vehicle, data, delta, pace) {
  const shouldTurn = shouldStartRightOfWayTurn();
  if (!state.paused && !data.rightTurnStarted && !shouldTurn) {
    vehicle.position.z += delta * (8 * pace + (data.speed || 0) * 5);
    vehicle.rotation.y = THREE.MathUtils.lerp(vehicle.rotation.y, data.yaw || 0, 0.04);
    return;
  }

  if (shouldTurn && !data.rightTurnStarted) {
    data.rightTurnStarted = true;
    data.rightTurnStartTime = state.time;
    data.rightTurnStartX = vehicle.position.x;
    data.rightTurnStartZ = vehicle.position.z;
    state.rightOfWayYieldTime = state.rightOfWayYieldTime ?? state.time;
    setRightOfWayTurnCopy();
  }

  if (!data.rightTurnStarted) return;

  const elapsed = state.time - data.rightTurnStartTime;
  const duration = 3.7;
  const progress = THREE.MathUtils.smoothstep(elapsed, 0, duration);
  const startX = data.rightTurnStartX;
  const startZ = data.rightTurnStartZ;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(startX, 0.08, startZ),
    new THREE.Vector3(startX - 0.6, 0.08, startZ - 0.55),
    new THREE.Vector3(laneWidth * 0.95, 0.08, startZ - 2.3),
    new THREE.Vector3(laneWidth * 0.32, 0.08, startZ - 6.7),
    new THREE.Vector3(0, 0.08, startZ - 13.8)
  ]);
  const point = curve.getPoint(progress);
  const tangent = curve.getTangent(progress);
  const exitDistance = Math.max(0, elapsed - duration) * 3.1;
  const desiredYaw = progress >= 0.995 ? 0 : Math.atan2(-tangent.x, -tangent.z);

  vehicle.position.x = THREE.MathUtils.damp(vehicle.position.x, point.x, 7.5, delta);
  vehicle.position.z = THREE.MathUtils.damp(vehicle.position.z, point.z - exitDistance, 7.5, delta);
  vehicle.rotation.y = THREE.MathUtils.damp(vehicle.rotation.y, desiredYaw, 7.2, delta);
}

function shouldStartRightOfWayTurn() {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "right-of-way") return false;
  if (state.rightOfWayYieldTime !== null) return true;

  const stopPointZ = getHoldZoneStopPointZ();
  if (stopPointZ === null) return false;

  const stopDistance = getRightOfWayStopZ() - stopPointZ;
  const stopChoiceReached = state.decisionMade && state.decisionChoice === "stop" && stopDistance <= 0.18 && state.speed <= 1.35;
  const spaceReached = !state.decisionMade && state.spaceHeld && stopDistance <= 0.85;
  return stopChoiceReached || spaceReached;
}

function setRightOfWayTurnCopy() {
  guidanceStatus.textContent = "Holding";
  intentLabel.textContent = "Waiting car turning";
  intentCopy.textContent = "They are taking the right turn.";
  nextMove.textContent = "Hold position.";
}

function updateRearEmergencyVehicle(vehicle, data, delta) {
  const elapsed = state.scenarioElapsed;
  const entryStart = data.approachStart ?? 0.6;
  const entryEnd = data.approachEnd ?? 6.5;
  const entryProgress = THREE.MathUtils.smoothstep(elapsed, entryStart, entryEnd);
  const visible = elapsed >= entryStart && entryProgress < 0.995;

  vehicle.visible = visible;
  if (!visible) {
    vehicle.position.set((data.approachStartLane ?? data.baseLane) * laneWidth, 0.08, data.approachStartZ ?? 3.15);
    vehicle.rotation.y = data.yaw || 0;
    return;
  }

  const rollInProgress = THREE.MathUtils.smoothstep(elapsed, entryStart, data.mergeStart ?? 2.6);
  const mergeProgress = THREE.MathUtils.smoothstep(elapsed, data.mergeStart ?? 2.6, data.mergeEnd ?? 5.6);
  const leftLane = THREE.MathUtils.lerp(data.approachStartLane ?? -1.5, data.baseLane ?? -1, rollInProgress);
  const activeLane = THREE.MathUtils.lerp(leftLane, data.mergeToLane ?? 0, mergeProgress);
  const z = THREE.MathUtils.lerp(data.approachStartZ ?? 3.15, data.approachEndZ ?? -43, entryProgress);
  const yaw = (data.yaw || 0) + Math.sin(mergeProgress * Math.PI) * (data.mergeYaw || 0.16);

  vehicle.position.x = THREE.MathUtils.damp(vehicle.position.x, activeLane * laneWidth, 9.5, delta);
  vehicle.position.z = THREE.MathUtils.damp(vehicle.position.z, z, 9.5, delta);
  vehicle.rotation.y = THREE.MathUtils.damp(vehicle.rotation.y, yaw, 8.5, delta);
}

function getYieldingOverlayFade(overlay) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "yielding" || !state.decisionMade) return 1;

  const elapsed = state.time - state.yieldingChoiceTime;
  if (state.decisionChoice === "yield") {
    const fadeStart = overlay.userData.yieldingCue === "opening" ? 2.6 : 2.1;
    return 1 - THREE.MathUtils.smoothstep(elapsed, fadeStart, fadeStart + 2.2);
  }
  if (state.decisionChoice === "proceed") {
    const fadeStart = overlay.userData.yieldingCue === "forward-path" ? 4.8 : 1.6;
    return 1 - THREE.MathUtils.smoothstep(elapsed, fadeStart, fadeStart + 2.2);
  }

  return 1;
}

function getYieldingOverlayEmphasis(overlay) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  if (scenario.id !== "yielding") return 1;

  if (overlay.userData.yieldingCue === "opening" && state.decisionChoice === "yield") {
    return state.spaceHeld ? 2.25 : 1.65;
  }
  if (overlay.userData.yieldingCue === "forward-path" && state.decisionChoice === "proceed") {
    return 1.55;
  }
  return 1;
}

function updateOverlays(delta) {
  const scenario = scenarioDefinitions[state.scenarioIndex];
  const pendingRightOfWay = scenario.id === "right-of-way" && !state.decisionMade;
  const pendingYielding = scenario.id === "yielding" && !state.decisionMade;

  overlayGroup.children.forEach((overlay) => {
    const isGuidance = overlay.userData.overlayType === "guidance";
    const isLens = overlay.userData.overlayType === "lens";
    const choice = overlay.userData.choice;
    const choiceVisible =
      !choice ||
      choice === state.decisionChoice ||
      (pendingRightOfWay && choice === "stop") ||
      (pendingYielding && choice === "yield");
    overlay.visible = choiceVisible && ((isGuidance && state.guidanceOn) || (isLens && state.lensOn));
    const manualRightOfWayStop =
      overlay.userData.rightOfWayCue === "hold-zone" &&
      scenario.id === "right-of-way" &&
      state.decisionMade &&
      state.decisionChoice === "stop";

    if (overlay.userData.beforeTarget) {
      const target = visibleVehicleMap.get(overlay.userData.beforeTarget);
      const shouldLockHoldPocket = overlay.userData.rightOfWayCue === "hold-zone" && state.decisionMade && state.decisionChoice === "stop";
      const stopTargetZ = getRightOfWayStopZ();
      const stopPointLocalZ = overlay.userData.stopPointLocalZ ?? 0;
      if (shouldLockHoldPocket) {
        const distanceToStopPoint = Math.max(0, stopTargetZ - (overlay.position.z + stopPointLocalZ));
        const arrivalEase = THREE.MathUtils.clamp(distanceToStopPoint / 22, 0.5, 1);
        const stopPace = Math.max(state.speed / 38, 0.26);
        const advance = delta * stopPace * 7.2 * arrivalEase;
        overlay.position.x = THREE.MathUtils.lerp(overlay.position.x, overlay.userData.laneX ?? overlay.position.x, 0.24);
        overlay.position.z = Math.min(stopTargetZ - stopPointLocalZ, overlay.position.z + advance);
      } else if (target) {
        const targetZ = target.position.z + overlay.userData.beforeTargetOffset;
        overlay.position.x = THREE.MathUtils.lerp(overlay.position.x, overlay.userData.laneX ?? overlay.position.x, 0.24);
        overlay.position.z = THREE.MathUtils.lerp(overlay.position.z, targetZ, 0.34);
      }
    } else if (overlay.userData.openingCue && overlay.userData.target) {
      const target = visibleVehicleMap.get(overlay.userData.target);
      if (target) {
        overlay.visible = overlay.visible && target.visible;
        const shouldLockYieldingHoldSpace = scenario.id === "yielding" && state.decisionChoice === "yield";
        if (shouldLockYieldingHoldSpace && overlay.userData.lockedZ === undefined) {
          overlay.userData.lockedZ = target.position.z + (overlay.userData.followTargetZOffset ?? 0);
        } else if (!shouldLockYieldingHoldSpace) {
          overlay.userData.lockedZ = undefined;
        }
        if (shouldLockYieldingHoldSpace && !state.paused) {
          overlay.userData.lockedZ += delta * (state.speed / 38) * 8;
        }
        const targetZ = shouldLockYieldingHoldSpace
          ? overlay.userData.lockedZ
          : target.position.z + (overlay.userData.followTargetZOffset ?? 0);
        overlay.position.x = THREE.MathUtils.lerp(overlay.position.x, overlay.userData.laneX ?? overlay.position.x, 0.18);
        overlay.position.z = THREE.MathUtils.lerp(overlay.position.z, targetZ, 0.18);
      }
    } else if (overlay.userData.target) {
      const target = visibleVehicleMap.get(overlay.userData.target);
      if (target) {
        overlay.visible = overlay.visible && target.visible;
        overlay.position.lerp(target.position, 0.34);
        if (!overlay.userData.billboard) {
          overlay.rotation.y = THREE.MathUtils.lerp(overlay.rotation.y, target.rotation.y, 0.2);
        }
      }
    } else if (!state.paused && !manualRightOfWayStop && !overlay.userData.driverAnchored) {
      overlay.position.z += delta * (state.speed / 38) * 8;
      if (!scenario.loopDuration && overlay.position.z > (overlay.userData.loopResetZ || 18)) {
        overlay.position.z -= overlay.userData.loopDistance || 96;
      }
    }

    const pulse = Math.sin(state.time * 2.2 + overlay.id * 0.01) * 0.5 + 0.5;
    const yieldingFade = getYieldingOverlayFade(overlay);
    const yieldingEmphasis = getYieldingOverlayEmphasis(overlay);
    overlay.traverse((child) => {
      if (child.material?.transparent) {
        const base = child.userData.baseOpacity ?? child.material.opacity;
        child.userData.baseOpacity = base;
        child.material.opacity = Math.min(1, base * yieldingEmphasis * yieldingFade * (0.72 + pulse * 0.38));
      }
    });
  });
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createAsphaltTexture() {
  const size = 512;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext("2d");
  const baseGradient = ctx.createLinearGradient(0, 0, size, size);
  baseGradient.addColorStop(0, "#4d5756");
  baseGradient.addColorStop(0.48, "#5d6663");
  baseGradient.addColorStop(1, "#434c4b");
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, size, size);

  for (let lane = 0; lane < 4; lane += 1) {
    const x = size * (0.22 + lane * 0.19);
    const track = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
    track.addColorStop(0, "rgba(18, 22, 22, 0)");
    track.addColorStop(0.5, "rgba(18, 22, 22, 0.1)");
    track.addColorStop(1, "rgba(18, 22, 22, 0)");
    ctx.fillStyle = track;
    ctx.fillRect(x - 22, 0, 44, size);
  }

  for (let i = 0; i < 11000; i += 1) {
    const value = 66 + Math.floor(Math.random() * 66);
    ctx.fillStyle = `rgba(${value}, ${value + 4}, ${value + 2}, ${Math.random() * 0.24})`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillRect(x, y, Math.random() * 2.2, Math.random() * 2.2);
  }

  for (let i = 0; i < 18; i += 1) {
    ctx.strokeStyle = `rgba(32, 37, 36, ${0.08 + Math.random() * 0.14})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.bezierCurveTo(
      Math.random() * size,
      Math.random() * size,
      Math.random() * size,
      Math.random() * size,
      Math.random() * size,
      Math.random() * size
    );
    ctx.stroke();
  }

  for (let i = 0; i < 56; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 18 + Math.random() * 70;
    ctx.strokeStyle = `rgba(235, 231, 205, ${0.018 + Math.random() * 0.035})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 18, y + length);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createShoulderTexture() {
  const size = 256;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext("2d");
  ctx.fillStyle = "#59635f";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i += 1) {
    const tone = 70 + Math.floor(Math.random() * 70);
    ctx.fillStyle = `rgba(${tone}, ${tone + 6}, ${tone + 2}, ${0.06 + Math.random() * 0.16})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 5, 1 + Math.random() * 4);
  }
  for (let y = 0; y < size; y += 18) {
    ctx.fillStyle = "rgba(28, 34, 33, 0.09)";
    ctx.fillRect(0, y + Math.random() * 4, size, 1);
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGroundTexture() {
  const size = 512;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext("2d");
  ctx.fillStyle = "#898e78";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 3200; i += 1) {
    const hue = 72 + Math.random() * 80;
    ctx.fillStyle = `hsla(${hue}, ${18 + Math.random() * 20}%, ${28 + Math.random() * 22}%, ${0.08 + Math.random() * 0.22})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 4, 1 + Math.random() * 5);
  }
  for (let i = 0; i < 170; i += 1) {
    ctx.strokeStyle = `rgba(42, 58, 44, ${0.035 + Math.random() * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 18, y + 4 + Math.random() * 22);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSkyTexture() {
  const size = 1024;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#8296a4");
  gradient.addColorStop(0.36, "#b3c3c7");
  gradient.addColorStop(0.62, "#d8d6c1");
  gradient.addColorStop(1, "#788278");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, size);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function randomUnit(a, b) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
