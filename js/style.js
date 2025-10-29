document.addEventListener("DOMContentLoaded", function () {
  // ===== ELEMENT REFERENCES =====
  const sendButton = document.getElementById("sendButton");
  const chatInput = document.getElementById("chatInput");
  const chatbox = document.getElementById("chatbox");
  const micButton = document.getElementById("micButton");
  const imageButton = document.getElementById("imageButton");
  const scannerButton = document.getElementById("scannerButton");

  // ===== SEND MESSAGE =====
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    displayMessage(message, true);
    chatInput.value = "";

    let apiUrl = "https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5HUEtMSjJkakVjcF9IQ0M0VFhRQ0FmSnNDSHNYTlJSblE0UXo1Q3RBcjFPcl9YYy1OZUhteDZWekxHdWRLM1M1alNZTkJMWEhNOWd4S1NPSDBTWC12M0U2UGc9PQ==";

    if (message.startsWith("/image")) {
      apiUrl = "https://example-ai-image-api.com/generate";
    }

    try {
      const data = await callApi(apiUrl, message);
      if (data.status === "success") {
        if (data.imageUrl) {
          displayImage(data.imageUrl);
        } else {
          displayMessage(data.text, false);
        }
      } else {
        displayMessage("An error occurred. Please try again.", false);
      }
    } catch (error) {
      console.error("Error:", error);
      displayMessage("An error occurred. Please try again.", false);
    }
  }

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ===== DISPLAY MESSAGE =====
  function displayMessage(message, isUser) {
    const msgElem = document.createElement("div");
    msgElem.textContent = message;
    msgElem.className = `chat-message ${isUser ? "user-message" : "assistant-message"}`;
    chatbox.appendChild(msgElem);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // ===== DISPLAY IMAGE =====
  function displayImage(imageUrl) {
    const imgElem = document.createElement("img");
    imgElem.src = imageUrl;
    imgElem.classList.add("generated-image");
    chatbox.appendChild(imgElem);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // ===== CALL API =====
  async function callApi(apiUrl, prompt) {
    chatInput.value = "Typing...";
    chatInput.disabled = true;
    sendButton.disabled = true;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    chatInput.value = "";
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();

    return response.json();
  }

  // ===== MIC / VOICE =====
  function handleMicClick() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.innerHTML = '<span class="material-icons">mic_off</span>';
    micButton.style.backgroundColor = "#FF4081";

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      micButton.innerHTML = '<span class="material-icons">mic</span>';
      micButton.style.backgroundColor = "#00796b";
    };

    recognition.onerror = recognition.onend = function () {
      micButton.innerHTML = '<span class="material-icons">mic</span>';
      micButton.style.backgroundColor = "#00796b";
    };

    recognition.start();
  }

  micButton.addEventListener("click", handleMicClick);
  micButton.addEventListener("touchstart", handleMicClick, { passive: true });

  // ===== IMAGE UPLOAD =====
  imageButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
          const imgData = e.target.result;
          displayMessage("Image received!", true);
          const analysisResult = await analyzeImage(imgData);
          displayMessage(analysisResult, false);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  });

  async function analyzeImage(imageData) {
    const response = await fetch("YOUR_IMAGE_RECOGNITION_API_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }),
    });
    const data = await response.json();
    return data.description || "Sorry, I couldn't analyze this image.";
  }

  // ===== CAMERA SCANNER =====
  scannerButton.addEventListener("click", () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "auto";

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((err) => {
          alert("Error accessing camera: " + err);
        });

      const captureButton = document.createElement("button");
      captureButton.textContent = "Capture Photo";
      captureButton.addEventListener("click", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL("image/png");
        displayMessage("Scanned Image:", true);

        const imgElem = document.createElement("img");
        imgElem.src = imgData;
        imgElem.className = "chat-image";
        chatbox.appendChild(imgElem);
        chatbox.scrollTop = chatbox.scrollHeight;

        analyzeImage(imgData).then((result) => {
          displayMessage(result, false);
        });

        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      });

      chatbox.appendChild(video);
      chatbox.appendChild(captureButton);
      chatbox.scrollTop = chatbox.scrollHeight;
    } else {
      alert("Camera not supported on this device.");
    }
  });

  // ===== SIGN OUT =====
  document.getElementById("signOutBtn").addEventListener("click", function () {
    window.location.href = "C:/Users/Rrs computers/Desktop/vison/Main/main.html";
  });

  // ===== DASHBOARD TOGGLE =====
  const dashboard = document.getElementById("dashboard");
  const dashboardToggle = document.getElementById("dashboardToggle");
  const dashboardClose = document.getElementById("dashboardClose");
  const chatboxContainer = document.querySelector(".chatbox-container");

  dashboardToggle.addEventListener("click", () => {
    dashboard.classList.add("active");
    chatboxContainer.classList.add("dashboard-open");
  });

  dashboardClose.addEventListener("click", () => {
    dashboard.classList.remove("active");
    chatboxContainer.classList.remove("dashboard-open");
  });
});
