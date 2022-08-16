var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

const createScene = function () {
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    15,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );

  // const camera = new BABYLON.ArcRotateCamera(
  //   "camera",
  //   Math.PI / 2,
  //   Math.PI / 2.5,
  //   150,
  //   new BABYLON.Vector3(0, 60, 0)
  // );

  camera.upperBetaLimit = Math.PI / 2.2; // limit the z axis no less zero

  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );

  light.intensity = 0.1;

  // GUI
  const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const panel = new BABYLON.GUI.StackPanel();
  panel.width = "220px";
  panel.top = "-25px";
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  adt.addControl(panel);

  const header = new BABYLON.GUI.TextBlock();
  header.text = "Night to Day";
  header.height = "30px";
  header.color = "white";
  panel.addControl(header);

  const slider = new BABYLON.GUI.Slider();
  slider.minimum = 0;
  slider.maximum = 1;
  slider.borderColor = "black";
  slider.color = "gray";
  slider.background = "white";
  slider.value = 1;
  slider.height = "20px";
  slider.width = "200px";
  slider.onValueChangedObservable.add((value) => {
    if (light) {
      light.intensity = value;
    }
  });
  panel.addControl(slider);

  BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "https://assets.babylonjs.com/meshes/",
    "lamp.babylon"
  ).then(() => {
    const lampLight = new BABYLON.SpotLight(
      "lampLight",
      BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, -1, 0),
      0.8 * Math.PI,
      0.01,
      scene
    );
    lampLight.diffuse = BABYLON.Color3.Yellow();
    lampLight.parent = scene.getMeshByName("bulb");

    const lamp = scene.getMeshByName("lamp");
    lamp.position = new BABYLON.Vector3(2, 0, 2);
    lamp.rotation = BABYLON.Vector3.Zero();
    lamp.rotation.y = -Math.PI / 4;

    lamp3 = lamp.clone("lamp3");
    lamp3.position.z = -8;

    lamp1 = lamp.clone("lamp1");
    lamp1.position.x = -8;
    lamp1.position.z = 1.2;
    lamp1.rotation.y = Math.PI / 2;

    lamp2 = lamp1.clone("lamp2");
    lamp2.position.x = -2.7;
    lamp2.position.z = 0.8;
    lamp2.rotation.y = -Math.PI / 2;
  });

  //Switch fountain on and off
  let switched = false;
  const pointerDown = (mesh) => {
    if (mesh === fountain) {
      switched = !switched;
      if (switched) {
        // Start the particle system
        particleSystem.start();
      } else {
        // Stop the particle system
        particleSystem.stop();
      }
    }
  };

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        if (pointerInfo.pickInfo.hit) {
          pointerDown(pointerInfo.pickInfo.pickedMesh);
        }
        break;
    }
  });

  // Create a particle system
  const particleSystem = new BABYLON.ParticleSystem("particles", 5000);

  //Texture of each particle
  particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png");

  // Where the particles come from
  particleSystem.emitter = new BABYLON.Vector3(-4, 0.8, -6); // emitted from the top of the fountain
  particleSystem.minEmitBox = new BABYLON.Vector3(-0.01, 0, -0.01); // Starting all from
  particleSystem.maxEmitBox = new BABYLON.Vector3(0.01, 0, 0.01); // To...

  // Colors of all particles
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);

  // Size of each particle (random between...
  particleSystem.minSize = 0.01;
  particleSystem.maxSize = 0.05;

  // Life time of each particle (random between...
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.5;

  // Emission rate
  particleSystem.emitRate = 1500;

  // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  // Set the gravity of all particles
  particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

  // Direction of each particle after it has been emitted
  particleSystem.direction1 = new BABYLON.Vector3(-1, 8, 1);
  particleSystem.direction2 = new BABYLON.Vector3(1, 8, -1);

  // Power and speed
  particleSystem.minEmitPower = 0.2;
  particleSystem.maxEmitPower = 0.6;
  particleSystem.updateSpeed = 0.01;

  const fountainProfile = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 0.2, 0),
    new BABYLON.Vector3(0.4, 0.2, 0),
    new BABYLON.Vector3(0.4, 0.05, 0),
    new BABYLON.Vector3(0.05, 0.1, 0),
    new BABYLON.Vector3(0.05, 0.8, 0),
    new BABYLON.Vector3(0.15, 0.9, 0),
  ];

  //Create lathed fountain
  const fountain = BABYLON.MeshBuilder.CreateLathe("fountain", {
    shape: fountainProfile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  fountain.position.x = -4;
  fountain.position.z = -6;

  fountain.position.z = -6;

  // tree
  const spriteManagerTrees = new BABYLON.SpriteManager(
    "treesManager",
    "textures/palm.png",
    2000,
    { width: 512, height: 1024 },
    scene
  );

  //We create trees at random positions
  for (let i = 0; i < 500; i++) {
    const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * -30;
    tree.position.z = Math.random() * 20 + 8;
    tree.position.y = 0.5;
  }

  for (let i = 0; i < 500; i++) {
    const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * 25 + 7;
    tree.position.z = Math.random() * -35 + 8;
    tree.position.y = 0.5;
  }

  //Skybox
  //Skybox
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    "textures/skybox",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode =
    BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;

  const wireMat = new BABYLON.StandardMaterial("wireMat");
  wireMat.wireframe = true;

  const hitBox = BABYLON.MeshBuilder.CreateBox("carbox", {
    width: 0.5,
    height: 0.6,
    depth: 4.5,
  });
  hitBox.material = wireMat;
  hitBox.position.x = 3.1;
  hitBox.position.y = 0.3;
  hitBox.position.z = -5;

  let carReady = false;

  BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "https://assets.babylonjs.com/meshes/",
    "car.glb"
  ).then(() => {
    const car = scene.getMeshByName("car");
    carReady = true;
    car.rotation = new BABYLON.Vector3(Math.PI / 2, 0, -Math.PI / 2);
    car.position.y = 0.16;
    car.position.x = -3;
    car.position.z = 8;

    const animCar = new BABYLON.Animation(
      "carAnimation",
      "position.z",
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const carKeys = [];

    carKeys.push({
      frame: 0,
      value: 8,
    });

    carKeys.push({
      frame: 150,
      value: -7,
    });

    carKeys.push({
      frame: 200,
      value: -7,
    });

    animCar.setKeys(carKeys);

    car.animations = [];
    car.animations.push(animCar);

    scene.beginAnimation(car, 0, 200, true);

    //wheel animation
    const wheelRB = scene.getMeshByName("wheelRB");
    const wheelRF = scene.getMeshByName("wheelRF");
    const wheelLB = scene.getMeshByName("wheelLB");
    const wheelLF = scene.getMeshByName("wheelLF");

    scene.beginAnimation(wheelRB, 0, 30, true);
    scene.beginAnimation(wheelRF, 0, 30, true);
    scene.beginAnimation(wheelLB, 0, 30, true);
    scene.beginAnimation(wheelLF, 0, 30, true);
  });

  BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "https://assets.babylonjs.com/meshes/",
    "valleyvillage.glb"
  );

  const walk = function (turn, dist) {
    this.turn = turn;
    this.dist = dist;
  };

  const track = [];
  track.push(new walk(180, 2.5));
  track.push(new walk(0, 5));

  // Dude
  BABYLON.SceneLoader.ImportMeshAsync(
    "him",
    "/scenes/Dude/",
    "Dude.babylon",
    scene
  ).then((result) => {
    var dude = result.meshes[0];
    dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);

    dude.position = new BABYLON.Vector3(1.5, 0, -6.9);
    dude.rotate(
      BABYLON.Axis.Y,
      BABYLON.Tools.ToRadians(-90),
      BABYLON.Space.LOCAL
    );
    const startRotation = dude.rotationQuaternion.clone();

    scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

    let distance = 0;
    let step = 0.015;
    let p = 0;

    scene.onBeforeRenderObservable.add(() => {
      if (carReady) {
        if (
          !dude.getChildren()[1].intersectsMesh(hitBox) &&
          scene.getMeshByName("car").intersectsMesh(hitBox)
        ) {
          return;
        }
      }
      dude.movePOV(0, 0, step);
      distance += step;

      if (distance > track[p].dist) {
        dude.rotate(
          BABYLON.Axis.Y,
          BABYLON.Tools.ToRadians(track[p].turn),
          BABYLON.Space.LOCAL
        );
        p += 1;
        p %= track.length;
        if (p === 0) {
          distance = 0;
          dude.position = new BABYLON.Vector3(1.5, 0, -6.9);
          dude.rotationQuaternion = startRotation.clone();
        }
      }
    });
  });

  return scene;
};
window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  startRenderLoop(engine, canvas);
  window.scene = createScene();
};
initFunction().then(() => {
  sceneToRender = scene;
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
