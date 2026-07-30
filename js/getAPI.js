window.P1_ID = 0;       
window.P1_NAME = "Player 1";
window.P2_ID = 0; 
window.P2_NAME ="CPU";

const FetchP1 =fetch('php/get_user_info.php?slot=player1').then(r => r.json());
const FetchP2 =fetch('php/get_user_info.php?slot=player2').then(r => r.json());


//Using Promise for obtain the right names and only then it'll be loading the right names
Promise.all([FetchP1,FetchP2])
    .then(([data1,data2])=>{
        if (data1.status === "logged_in"){
            window.P1_ID=data1.id;
            window.P1_NAME = data1.username;
        }
        if (data2.status === "logged_in"){
            window.P2_ID =data2.id;
            window.P2_NAME = data2.username;
        }
        else {
            const localP2ID = localStorage.getItem("player2_id"); 
            const localP2Name = localStorage.getItem("player2_name");
            // if is a real player and he loggged in, save his name
            if(localP2ID && localP2ID !== "0") {
                window.P2_ID = localP2ID;
            }
            if(localP2Name) window.P2_NAME = localP2Name;
        }
        g.loadNames();
        
    })
    .catch(err=>{
        console.error("Critic Error during : LOADING NAMES : ", err);
        g.loadNames();
    })

