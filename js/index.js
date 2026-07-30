function toggleP2Password() {
    const select = document.getElementById("SelectP2");
    const passInput = document.getElementById("PassP2");
    if (select.value === "0") {
        passInput.style.display = "none";
    } else {
        passInput.style.display = "block";
    }
}
async function SaveNames() {
    //Cleaning previous values for safety
    localStorage.setItem("player1_name", "");
    localStorage.setItem("player2_name", "");
    localStorage.setItem("player1_id", "");
    localStorage.setItem("player2_id", "");

    const p1Name = document.getElementById("Name1").value;
    const selectP2 = document.getElementById("SelectP2");
    const p2Id = selectP2.value;
    const errorMsg = document.getElementById("ErrorP2");
    // single player
    if (p2Id === "0") {
        localStorage.setItem("player1_name", p1Name);
        localStorage.setItem("player2_name", "CPU"); 
        window.location.href = "game.html";
        return;
    }

    // multiplayer with validation
    const p2Pass = document.getElementById("PassP2").value;

    if (p2Pass === "") {
        alert("You must insert the password for Player 2!");
        return;
    }
    try {
        // verifying P2 credentials backend
        const response = await fetch('php/verify_p2.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: p2Id, password: p2Pass })
        });

        const result = await response.json();

        if (result.success) {
            const p2Name = selectP2.options[selectP2.selectedIndex].text;
            localStorage.setItem("player1_name", p1Name);
            localStorage.setItem("player2_id", p2Id); 
            localStorage.setItem("player2_name", p2Name);
    
            window.location.href = "game.html"; 
        } 
        else {
            alert("Player2 has inserted the wrong password")
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Connection Error");
    }
}
//resetting UI when page loads
window.addEventListener('pageshow', function(event) {
    const selectP2 = document.getElementById("SelectP2");
    const passInput = document.getElementById("PassP2");
    
    if (selectP2) {
        selectP2.value = "0"; 
        localStorage.setItem("player2_name","CPU")
        toggleP2Password();
        if (passInput) passInput.value = "";
        SaveMap(true);
    }
});
function SaveMap(flag){
    const MapChosen = document.getElementById("MapChosen")
    MapChosen.textContent = flag ? "King's Pass" : "Demons Island";
    

    const Map1 = document.getElementById("Map1")
    const Map2 = document.getElementById("Map2")
    Map1.classList.remove("selected")
    Map2.classList.remove("selected")
    //Map 1 chosen
    if (flag){
        localStorage.setItem("MapNumber",1)
        Map1.classList.add("selected")
        
    }
    //Map 2 chosen
    else {
        localStorage.setItem("MapNumber",2)
        Map2.classList.add("selected")
        
    }
}
function SaveMode(flag){
    const ModeChosen = document.getElementById("ModeChosen")
    ModeChosen.textContent = flag ? "Adventure" : "Sandbox";
    

    const Mode1 = document.getElementById("Mode1")
    const Mode2 = document.getElementById("Mode2")
    Mode1.classList.remove("selected")
    Mode2.classList.remove("selected")
    //Mode 1 chosen
    if (flag){
        localStorage.setItem("ModeNumber",1)
        Mode1.classList.add("selected")
        
    }
    //Mode 2 chosen
    else {
        localStorage.setItem("ModeNumber",2)
        Mode2.classList.add("selected")
        
    }
    console.log("Mode Choosen : ",ModeChosen.textContent)
}

