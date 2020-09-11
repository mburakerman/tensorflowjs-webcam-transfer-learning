/*
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('left').addEventListener('click', () => addExample(0));
  document.getElementById('middle').addEventListener('click', () => addExample(1));
  document.getElementById('right').addEventListener('click', () => addExample(2));
  //document.getElementById('class-d').addEventListener('click', () => addExample(3));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['L', 'M', 'R'];
      document.getElementById('console').innerText = `
        Prediction: ${classes[result.classIndex]}\n
        Probability: ${result.confidences[result.classIndex] * 100}%
      `;
    }

    await tf.nextFrame();
  }
}


async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();
*/


const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;

// load model
async function loadModel() {
  net = await mobilenet.load();
  modelInfo.style.display = "none";
}


// bind training
async function bindTraining() {
  // Reads an image from the webcam and associates it with a specific class index.
  function addExample(classId) {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  }

  // When clicking a button, add an example for that class.
  document.getElementById('left').addEventListener('click', () => addExample(0));
  document.getElementById('middle').addEventListener('click', () => addExample(1));
  document.getElementById('right').addEventListener('click', () => addExample(2));


  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['L', 'M', 'R'];
      document.getElementById('console').innerText = `
        Prediction: ${classes[result.classIndex]}\n
        Probability: ${result.confidences[result.classIndex] * 100}%
      `;

      // game controller
      if (classes[result.classIndex] == "L") {
        $.state.keypress.left = true;
        $.state.keypress.right = false;
      }
      if (classes[result.classIndex] == "R") {
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
          facingMode: "user"
        }
      })
      .then(stream => {
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


function init() {
  loadModel()
    .then(_ => {
      loadWebcam();
    })
    .then(_ => {
      bindTraining();
    })
    .then(_ => {
      drawBg();
      draw();
    })
}
window.onload = _ => {
  init();
}