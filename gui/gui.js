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
