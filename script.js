let drugsData = [];

// Load JSON database
fetch("drugs.json")
  .then(response => response.json())
  .then(data => {
    drugsData = data;
    console.log("Drug database loaded:", drugsData.length, "drugs");
  })
  .catch(error => console.error("Error loading drug database:", error));


// Search Drug Function
function searchDrug() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const drug = drugsData.find(d => d.name.toLowerCase() === input);

  const drugInfoDiv = document.getElementById("drugInfo");

  if (drug) {
    drugInfoDiv.innerHTML = `
      <h2>📌 Drug Details: ${drug.name}</h2>
      <p><b>Uses:</b> ${drug.uses}</p>
      <p><b>Dosage Form:</b> ${drug.dosage_form}</p>
      <p><b>Adult Dose:</b> ${drug.adult_dose}</p>
      <p><b>Child Dose:</b> ${drug.child_dose}</p>
      <p><b>Warnings:</b> ${drug.warnings}</p>

      <h3>⚠️ Side Effects:</h3>
      <ul>
        ${drug.side_effects.map(effect => `<li>${effect}</li>`).join("")}
      </ul>

      <h3>🏷️ Brand Names:</h3>
      <p>${drug.brand_names.join(", ")}</p>
    `;
  } else {
    drugInfoDiv.innerHTML = `
      <h2>❌ Drug Not Found</h2>
      <p>Please check spelling or add the drug in database.</p>
    `;
  }
}


// Chatbot UI function (basic)
function sendMessage() {
  const userInput = document.getElementById("userMessage").value;
  const chatbox = document.getElementById("chatbox");

  if (userInput.trim() === "") return;

  // Display user message
  const userMsgDiv = document.createElement("div");
  userMsgDiv.className = "user-message";
  userMsgDiv.innerText = userInput;
  chatbox.appendChild(userMsgDiv);

  document.getElementById("userMessage").value = "";

  // Simple AI Response (Offline rule-based chatbot)
  setTimeout(() => {
    const botMsgDiv = document.createElement("div");
    botMsgDiv.className = "bot-message";

    let response = generateBotResponse(userInput);
    botMsgDiv.innerText = response;

    chatbox.appendChild(botMsgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }, 800);
}


// Rule-based chatbot response
function generateBotResponse(message) {
  const msg = message.toLowerCase();

  // If drug name exists
  for (let drug of drugsData) {
    if (msg.includes(drug.name.toLowerCase())) {
      return `${drug.name} is used for: ${drug.uses}.
Adult Dose: ${drug.adult_dose}
Child Dose: ${drug.child_dose}
Warnings: ${drug.warnings}
Common Side Effects: ${drug.side_effects.slice(0, 5).join(", ")}
Brands: ${drug.brand_names.join(", ")}`;
    }
  }

  return "Sorry, I couldn't find that drug. Please search it in the database or check spelling.";
}
