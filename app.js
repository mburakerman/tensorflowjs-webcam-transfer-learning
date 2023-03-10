const classifier = knnClassifier.create();

const webcamElement = document.getElementById("webcam");
const trainLeftButton = document.getElementById("left");
const trainMiddleButton = document.getElementById("middle");
const trainRightButton = document.getElementById("right");
const predictionInfo = document.getElementById("predictionInfo");

const CLASSES = ["L", "M", "R"];

let net;

// load model
async function loadModel() {
  net = await mobilenet.load();
  modelInfo.style.display = "none";
}

// bind training
async function bindTraining() {
  // reads an image from the webcam and associates it with a specific class index.
  function addExample(elementId) {
    // get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier.
    const activation = net.infer(webcamElement, "conv_preds");

    // passs the intermediate activation to the classifier.
    classifier.addExample(activation, elementId);
  }

  // add example
  trainLeftButton.addEventListener("click", () => addExample(0));
  trainMiddleButton.addEventListener("click", () => addExample(1));
  trainRightButton.addEventListener("click", () => addExample(2));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, "conv_preds");
      // get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      predictionInfo.innerText = `
        prediction: ${CLASSES[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex] * 100}%
      `;

      // game controller
      if (CLASSES[result.classIndex] == "L") {
        $.state.keypress.left = true;
        $.state.keypress.right = false;
      }
      if (CLASSES[result.classIndex] == "R") {
        $.state.keypress.left = false;
        $.state.keypress.right = true;
      }
    }

    await tf.nextFrame();
  }
}

// load webcam
async function loadWebcam() {
  webcamInfo.style.display = "block";
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    await navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
        },
      })
      .then((stream) => {
        window.stream = stream;
        webcamElement.srcObject = stream;
        return new Promise((resolve, reject) => {
          webcamElement.onloadedmetadata = () => {
            resolve();
            webcamInfo.style.display = "none";
          };
        });
      });
  }
}

async function init() {
  await loadModel();
  loadWebcam();
  bindTraining();
  drawBg();
  draw();
}

window.onload = init();
