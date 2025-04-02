document.addEventListener("DOMContentLoaded", function () {
    // DOM-Elemente
    const scanButton = document.getElementById("scanButton");
    const cancelScan = document.getElementById("cancelScan");
    const scannerContainer = document.getElementById("scannerContainer");
    const barcodeInfo = document.getElementById("barcodeInfo");
    const barcodeWrapper = document.getElementById("barcodeWrapper");
    const barcodeDisplay = document.getElementById("barcodeDisplay");
    const clearButton = document.getElementById("clearButton");
    const barcodeInput = document.getElementById("barcodeInput");
    const saveManualButton = document.getElementById("saveManualButton");
  
    // Gespeicherten Barcode laden
    loadBarcode();
  
    // Event-Listener
    scanButton.addEventListener("click", requestCameraPermission);
    cancelScan.addEventListener("click", stopScanner);
    clearButton.addEventListener("click", clearBarcode);
    saveManualButton.addEventListener("click", saveManualBarcode);
    
    // Auch Enter-Taste für manuelle Eingabe unterstützen
    barcodeInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        saveManualBarcode();
      }
    });
  
    // Manuelle Barcode-Eingabe speichern
    function saveManualBarcode() {
      const code = barcodeInput.value.trim();
      if (code) {
        saveBarcode(code);
        barcodeInput.value = ""; // Eingabefeld leeren
      } else {
        alert("Bitte geben Sie einen Barcode ein.");
      }
    }
  
    // Kamera-Berechtigung explizit anfordern
    async function requestCameraPermission() {
      try {
        // Explizit nach Kamera-Berechtigung fragen
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        // Stream beenden, wir brauchen ihn nur für die Berechtigungsanfrage
        stream.getTracks().forEach(track => track.stop());
        
        // Wenn die Berechtigung erteilt wurde, Scanner starten
        startScanner();
      } catch (err) {
        console.error("Kamera-Berechtigung verweigert:", err);
        alert("Kamera konnte nicht gestartet werden. Bitte verwenden Sie die manuelle Eingabe oder stellen Sie sicher, dass Sie eine HTTPS-Verbindung verwenden.");
      }
    }
  
    // Barcode-Scanner starten
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
              facingMode: "environment", // Rückkamera verwenden
            },
          },
          decoder: {
            readers: ["code_128_reader"], // Nur CODE-128 lesen
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
  
      // Barcode erkannt
      Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        if (code) {
          stopScanner();
          saveBarcode(code);
        }
      });
    }
  
    // Scanner stoppen
    function stopScanner() {
      if (Quagga) {
        Quagga.stop();
      }
      scannerContainer.classList.add("hidden");
      scanButton.classList.remove("hidden");
    }
  
    // Barcode speichern
    function saveBarcode(code) {
      localStorage.setItem("thwBarcode", code);
      displayBarcode(code);
    }
  
    // Barcode anzeigen
    function displayBarcode(code) {
      if (code) {
        barcodeInfo.textContent = `Gespeicherter Barcode: ${code}`;
        barcodeWrapper.classList.remove("hidden");
        clearButton.classList.remove("hidden");
  
        // Barcode mit JsBarcode generieren
        JsBarcode("#barcodeDisplay", code, {
          format: "CODE128",
          lineColor: "#003399",
          width: 2,
          height: 120,
          displayValue: false, // Kein Text unter dem Barcode
          margin: 0, // Keine Ränder
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
  
    // Gespeicherten Barcode laden
    function loadBarcode() {
      const savedBarcode = localStorage.getItem("thwBarcode");
      displayBarcode(savedBarcode);
    }
  
    // Barcode löschen
    function clearBarcode() {
      if (confirm("Möchten Sie den gespeicherten Barcode wirklich löschen?")) {
        localStorage.removeItem("thwBarcode");
        displayBarcode(null);
      }
    }
  });
  