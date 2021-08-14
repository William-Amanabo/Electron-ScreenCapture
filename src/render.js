//Buttons
console.log("render.js is loaded");
const videoElement = document.querySelector("video");
const startBtn = document.getElementById("strButton");
const stopBtn = document.getElementById("stoButton");
const videoSelectButton = document.getElementById("videoSelectBtn");
videoSelectButton.onclick = getVideoSources;
startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
};
stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

const { desktopCapturer, remote } = require("electron");
const { Menu } = remote;
//get all available screens
async function getVideoSources() {
  console.log("getVideoSources actually runs");
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
  console.log(inputSources);
  videoOptionsMenu.popup();
}

let mediaRecorder; //mediaRecorder instance
const recordedChunks = [];

// change videoSource window to record
async function selectSource(source) {
  videoSelectButton.innerText = source.name;
  const constraint = {
    audio: {
      mandatory: {
        chromeMediaSource: "desktop",
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  };

  //Create Stream
  const stream = await navigator.mediaDevices.getUserMedia(constraint);
  //Preview the source in video element
  videoElement.srcObject = stream;
  videoElement.muted = true;
  videoElement.play();
  //Create media recorder
  const options = { mimType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options); // props an error

  //Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
  console.log("video data available");
  recordedChunks.push(e.data);
}

const { writeFile } = require("fs");

const { dialog } = remote;
//saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });
  const buffer = Buffer.from(await blob.arrayBuffer());
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save Video",
    defaultPath: `vid-${Date.now()}.webm`,
  });

  console.log(filePath);
  writeFile(filePath, buffer, () => console.log("video saved successfully"));
}
