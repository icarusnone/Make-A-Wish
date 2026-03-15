const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  const rectangle = document.getElementById("rectangle");
  const startBtn = document.querySelector("#startBtn");

  const story = {
    start: {
      text: "Great. <br>But It's only able to give your sepecific wishes. <br>For example, this hand will bring you the dinner you've always dreamed of. <br> Say Yes or No.",
      choices: { yes: "question1", no: "no_story1" }
    },
    question1: {
      text: "Great. <br>This hand will bring you your dream partner. <br>Say Yes or No.",
      choices: { yes: "question2", no: "no_story1" }
    },
    question2: {
      text: "Great. <br>This hand will help you become the person you most want to be. <br>Say Yes or No.",
      choices: { yes: "end3", no: "no_story1" }
  
    },
    no_story1: {
      text: "Do you know the story of the Monkey's Paw? <br> Say Yes or No",
      choices: {yes: "no_story3", no: "no_story2"}
    },
    end1: {
      text: "Then you made a wise choice. <br>Nothing comes without a price.",
      choices: {yes: "", no: ""}
    },
    no_story2: {
      text: "If you're not satisfied with this, <br>what you really want is money that you can freely spend? <br>Say Yes or No.",
      choices: {yes: "end2", no: "question2"}
    },
    end2: {
      text: "Greedy You",
      choices: {yes: "", no: ""}
    },
    end3: {
      text: "This is a Monkey's Paw. <br>Goodbye",
      choices: {yes: "", no: ""}
    },
    no_story3: {
      text: "Do you believe the story of the Monkey's Paw?",
      choices: {yes: "end1", no: "question2"}
    }
  };

  let currentStep = "start";
  let isProcessing = false;

  function playBlockReveal(element, text) {
    element.innerHTML = `<span class="reveal-text">${text}</span><span class="reveal-block"></span>`;
    
    const textEl = element.querySelector('.reveal-text');
    const blockEl = element.querySelector('.reveal-block');
    
    if(!textEl || !blockEl) return;

    setTimeout(() => { blockEl.style.transform = 'scaleX(1)'; }, 100);
    setTimeout(() => { 
        textEl.style.opacity = '1'; 
        blockEl.style.transformOrigin = 'right';
        blockEl.style.transform = 'scaleX(0)';
    }, 600);
  }

  function renderStoryBlock(step) {
    const node = story[step];
    if (!node) return;

    const textEl = document.createElement('div');
    textEl.classList.add('story-text');
    rectangle.appendChild(textEl);

    playBlockReveal(textEl, node.text);

    // --- Visual Storytelling Logic ---
    const monkeyOverlay = document.querySelector('#monkey-overlay');

    switch (step) {
      case 'question1':
        monkeyOverlay.style.opacity = '0.33';
        document.body.style.setProperty('--bg-opacity', '0.33');
        break;
      case 'question2':
        monkeyOverlay.style.opacity = '0.66';
        document.body.style.setProperty('--bg-opacity', '0.66');
        break;
      case 'end3':
        monkeyOverlay.style.opacity = '1';
        document.body.style.setProperty('--bg-opacity', '1');
        break;
    }

    while (rectangle.scrollHeight > rectangle.clientHeight) {
      const firstStoryBlock = rectangle.querySelector('.story-text');
      if (firstStoryBlock) {
        rectangle.removeChild(firstStoryBlock);
      } else {
        break;
      }
    }
  }

  recognition.onresult = (event) => {
    if (isProcessing) return;

    let fullTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      fullTranscript += event.results[i][0].transcript;
    }

    const lowerTranscript = fullTranscript.toLowerCase().trim();
    console.log("Heard (interim & final):", lowerTranscript);

    const currentNode = story[currentStep];
    if (!currentNode || !currentNode.choices) return;

    let nextStep = null;
    const yesPattern = /\b(yes|yeah|yep|sure|ok|alright)\b/i;
    const noPattern = /\b(no|nope)\b/i;

    if (yesPattern.test(lowerTranscript)) {
      nextStep = currentNode.choices.yes;
    } else if (noPattern.test(lowerTranscript)) {
      nextStep = currentNode.choices.no;
    }

    if (nextStep && story[nextStep]) {
      isProcessing = true;
      currentStep = nextStep;
      renderStoryBlock(currentStep);
      setTimeout(() => { isProcessing = false; }, 1000);
    }
  };

  recognition.onend = () => {
    recognition.start();
  };

  startBtn.addEventListener("click", () => {
    recognition.start();
    startBtn.style.display = "none";
    // Clear initial text and render the first story block
    const initialText = document.querySelector("#wish-text");
    if(initialText) initialText.style.display = 'none';
    renderStoryBlock(currentStep);
  });

} else {
  console.log("Speech Recognition not supported.");
}
