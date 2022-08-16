const fountainProfile = [
  new BABYLON.Vector3(0, 0, 0),
  new BABYLON.Vector3(10, 0, 0),
  new BABYLON.Vector3(10, 4, 0),
  new BABYLON.Vector3(8, 4, 0),
  new BABYLON.Vector3(8, 1, 0),
  new BABYLON.Vector3(1, 2, 0),
  new BABYLON.Vector3(1, 15, 0),
  new BABYLON.Vector3(3, 17, 0),
];

const fountain = BABYLON.MeshBuilder.CreateLathe(
  "fountain",
  { shape: fountainProfile, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
  scene
);
