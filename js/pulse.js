export default function (onConsole, onStart, onResult, onStop) {
  $(document).ready(function () {
    function showStart() {
      $(".pulseOutline").css({
        color: "blue",
        animation: "pulse 2s",
        "animation-timing-function": "ease-out",
        "animation-iteration-count": "infinite",
      });
      $("svg.mic-icon").css("fill", "darkred");
    }

    function showStop(error) {
      $(".pulseOutline").css({
        color: "red",
        animation: "none",
      });
      $("svg.mic-icon").css("fill", "#1E2D70");
    }

    var recognizing = false;

    function start() {
      if (!recognizing) {
        recognition.start();
        recognizing = true;
        showStart();
        if (onStart) onStart();
        if (onConsole) onConsole("Start ! Ready to receive a country command.");
      }
      return recognizing;
    }

    function doStop() {
      if (recognizing) {
        recognition.stop();
      }
      return recognizing;
    }

    // <!-- speech recognition : WORK IN PROGRESS -->
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent =
      SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    var grammar = "#JSGF V1.0; grammar countries;";

    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    $("[role='button']#speechRecognition").on("click", function () {
      try {
        if (recognizing) {
          doStop();
        } else {
          start();
        }
      } catch (error) {
        if (onConsole) onConsole(error);
        doStop();
      }
    });

    toastr.options = {
      closeButton: false,
      debug: false,
      newestOnTop: true,
      progressBar: false,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
      onclick: null,
      showDuration: "0",
      hideDuration: "0",
      timeOut: "2000",
      extendedTimeOut: "5000",
      "background-image": "none !important",
    };

    recognition.onresult = function (event) {
      if (0 < event.results.length) {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.trim();
        const confidence = lastResult[0].confidence;
        if (transcript.startsWith("stop")) {
          doStop();
        } else {
          if (lastResult.isFinal) {
            if (onResult) {
              if (onResult(transcript)) {
                toastr.success(transcript);
              } else {
                toastr.error(transcript);
              }
            }
          } else {
            if (onConsole)
              onConsole(transcript, "Confidence: " + confidence, lastResult);
            toastr.info(transcript);
          }
        }
      }
    };

    recognition.onspeechend = function (event) {
      recognizing = false;
      showStop();
      if (onConsole) onConsole("Stopped", event);
      if (onStop) onStop();
    };

    recognition.onnomatch = function (event) {
      if (onConsole) onConsole("I didn't recognise that country.", event);
    };

    recognition.onerror = function (event) {
      recognizing = false;
      showStop();
      if (onConsole)
        onConsole(
          "Stopped - Error occurred in recognition: ",
          event.error,
          event
        );
      if (onStop) onStop(event.error);
    };
  });
  return {};
}
