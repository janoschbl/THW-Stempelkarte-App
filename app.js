document.addEventListener("DOMContentLoaded", function () {
    const scanButton = document.getElementById("scanButton");
    const cancelScan = document.getElementById("cancelScan");
    const scannerContainer = document.getElementById("scannerContainer");
    const barcodeInfo = document.getElementById("barcodeInfo");
    const barcodeWrapper = document.getElementById("barcodeWrapper");
    const barcodeDisplay = document.getElementById("barcodeDisplay");
    const clearButton = document.getElementById("clearButton");
    const barcodeInput = document.getElementById("barcodeInput");
    const saveManualButton = document.getElementById("saveManualButton");
  
    // lädt den Barcode aus dem Local Storage
    loadBarcode();
  
    scanButton.addEventListener("click", requestCameraPermission);
    cancelScan.addEventListener("click", stopScanner);
    clearButton.addEventListener("click", clearBarcode);
    saveManualButton.addEventListener("click", saveManualBarcode);
    
    barcodeInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        saveManualBarcode();
      }
    });
  
    function saveManualBarcode() {
      const code = barcodeInput.value.trim();
      if (code) {
        saveBarcode(code);
        barcodeInput.value = "";
      } else {
        alert("Bitte geben Sie einen Barcode ein.");
      }
    }
  
    async function requestCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        // gibt die Kamera vor dem Start von Quagga wieder frei
        stream.getTracks().forEach(track => track.stop());
        
        startScanner();
      } catch (err) {
        console.error("Kamera-Berechtigung verweigert:", err);
        alert("Kamera konnte nicht gestartet werden. Bitte verwenden Sie die manuelle Eingabe oder stellen Sie sicher, dass Sie eine HTTPS-Verbindung verwenden.");
      }
    }
  
    function startScanner() {
      scannerContainer.classList.remove("hidden");
      scanButton.classList.add("hidden");
  
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#preview"),
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: ["code_128_reader"],
          },
        },
        function (err) {
          if (err) {
            console.error("Fehler beim Initialisieren des Scanners:", err);
            stopScanner();
            alert(
              "Kamera konnte nicht gestartet werden. Bitte verwenden Sie die manuelle Eingabe."
            );
            return;
          }
          Quagga.start();
        }
      );
  
      Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        if (code) {
          stopScanner();
          saveBarcode(code);
        }
      });
    }
  
    function stopScanner() {
      if (Quagga) {
        Quagga.stop();
      }
      scannerContainer.classList.add("hidden");
      scanButton.classList.remove("hidden");
    }
  
    function saveBarcode(code) {
      localStorage.setItem("thwBarcode", code);
      displayBarcode(code);
    }
  
    function displayBarcode(code) {
      if (code) {
        barcodeInfo.textContent = `Gespeicherter Barcode: ${code}`;
        barcodeWrapper.classList.remove("hidden");
        clearButton.classList.remove("hidden");
  
        JsBarcode("#barcodeDisplay", code, {
          format: "CODE128",
          lineColor: "#003399",
          width: 2,
          height: 120,
          displayValue: false,
          margin: 0,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0
        });
      } else {
        barcodeInfo.textContent =
          "Kein Barcode gespeichert. Bitte scannen Sie einen CODE-128 Barcode oder geben Sie ihn manuell ein.";
        barcodeWrapper.classList.add("hidden");
        clearButton.classList.add("hidden");
      }
    }
  
    function loadBarcode() {
      const savedBarcode = localStorage.getItem("thwBarcode");
      displayBarcode(savedBarcode);
    }
  
    function clearBarcode() {
      if (confirm("Möchten Sie den gespeicherten Barcode wirklich löschen?")) {
        localStorage.removeItem("thwBarcode");
        displayBarcode(null);
      }
    }
  });
  