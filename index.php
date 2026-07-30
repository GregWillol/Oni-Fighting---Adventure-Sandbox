<?php
session_start();
require_once('php/config.php');

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("location: php/login.php");
    exit;
}
$my_username = $_SESSION['username']; 
$my_id = $_SESSION['id'];
/*LEADERBOARD*/
$sql = "SELECT username, partite_vinte,partite_perse, danni_totali FROM utenti ORDER BY partite_vinte DESC, danni_totali DESC LIMIT 5";
$result = $conn->query($sql);
/*Playerslist*/
$sql_users = "SELECT id, username FROM utenti WHERE id != $my_id ORDER BY username ASC";
$result_users = $conn->query($sql_users);
?>
<!DOCTYPE html>
<html lang ="en">
    <head>

       
        <title>Main Menu</title>
        <link rel ="stylesheet" href ="./css/style.css">
        <link rel ="stylesheet" href ="./css/index.css">
         <meta charset="utf-8">
        
    </head>
    <body>
        <div class="menu-container">
            <h1 class="text-gold">Oni Fighting</h1>
            
                <div class ="description-box" >
                    <p>
                        <strong>DESCRIPTION</strong> "Oni Fighting" is a competitive arcade-style game designed for single-player and local multiplayer. If there isn't a second player, a BOT will be the opponent. 
                    </p>
                    
                    <p>
                        <strong>FIGHTERS</strong><br>
                        <span class ="Sekiro">Sekiro</span> has a faster attack speed and a long-range shot, making him better for a defensive strategy. He also has a 20% chance to land a Critical Hit, dealing double damage to the opponent.<br><br>
                        <span class ="Night">Night</span> employs a more offensive strategy. He deals 50% more base damage, but his attack range is shorter and his attack speed is slower, however, for every hit he gains 5HP.
                    </p>
                    
                    <p>
                        <strong>MASKS (PowerUps)</strong><br>
                        After 10 seconds in a match, a Mask will randomly (in time and position) drop. This PowerUp has 2 possible effects and they are chosen randomly at the start of the game. 
                        One restores 25 HP and multiplies damage by 2, the other one also restores health by the same quantity but it does not multiply damage, it increases the knockback dealt to the opponent.
                        To prevent this item from being too overpowered, the mask "powers" are significantly reduced if the winning player picks it up (just for Health and Damage multiplier).
                        The players will know the Mask PowerUps only when it drops with an announcement onscreen.
                    </p>
                    <div>
                        <strong>MAPS & STRATEGIES</strong>
                            <p><span class ="KingsPass">King's Pass</span> is a strategically simpler map. It has invisible walls so the player cannot fall off the platform and there are 4 more platforms (Clouds) that the players can use to reach the top. 
                                These platforms make the game more strategic also because the mask can drop on one of these platforms or even on the ground.
                            </p>
                            <p><span class ="DemonsIsland">Demons Island</span> is for a more aggressive playstyle. It has no invisible walls and only one platform so the game is all on the same line. 
                                If one player falls off the platform, his healthpoints reduce to 0 and the winner will be the last player standing.
                            </p>
                    </div>
                    <div class ="win-conditions">
                        <strong>WINNING CONDITIONS</strong>
                        <ul class ="win-conditions-list">
                            <li>HP reaches 0 &rarr; Opponent Wins (KO)</li>
                            <li>Timer reaches 0 &rarr; Player with higher HP Wins</li>
                            <li>Same HP at Time Limit &rarr; DRAW</li>
                            <li>Falling off the map (Demon's Island) &rarr; Opponent wins</li>
                        </ul>
                    </div>
                    <strong>LEADERBOARD</strong>
                    <p>The leaderboard displays the top 5 fighters with the most wins of all. It also shows losses, Win / EveryGamePlayed ratio and total damage dealt to opponents.
                            Statistics are updated even when playing against a BOT.<br>
                            DRAW games will not be recorded.
                    </p>
                    <strong>SECOND PLAYER LOGIN</strong>
                    <p>The second player must be already registered. After selecting his username from the list (sorted alphabetically) and entering the password, players can now hit the button "START GAME" to begin the match.
                    </p>
                    
                    <strong>REQUIREMENTS</strong><p>Players must be registered to play.</p>
                        <div class="fighters-info">
                            <div class="fighters-card p1-card">
                                <h2>Sekiro</h2> 
                                
                                    <h3 class="text-gold">BUFFER</h3>
                                    <ul class="controls-list">
                                        <li><label class="buffer-label" >Range: +90%</label></li>
                                        <li><label class="buffer-label" >Critical Hit</label></li>
                                    </ul>
                                    <h3 class="text-gold">CONTROLS</h3>
                                    <ul class="controls-list">
                                        <li><div class="keycol"><span class="key">W</span></div> <label class="control-label" >Jump</label></li>
                                        <li><div class="keycol"><span class="key">A</span> <span class="key">D</span></div> <label class="control-label" >Movement</label></li>
                                        <li><div class="keycol"><span class="key">S</span></div> <label class="control-label" >Attack</label></li>
                                        <li><div class="keycol"><span class="key wide">Shift</span></div> <label class="control-label" >Defence</label></li>
                                    </ul>
                                
                            </div>
                            <div class="fighters-card p2-card">
                                <h2>Night</h2> 
                                
                                    <h3 class="text-gold">BUFFER</h3>
                                    <ul class="controls-list">
                                        <li><label class="buffer-label" >Damage : +50%</label></li>
                                        <li><label class="buffer-label" >Healing : +3HP </label></li>
                                    </ul>
                                    <h3 class="text-gold">CONTROLS</h3>
                                    <ul class="controls-list">
                                        <li><div class ="keycol">
                                                <span class="key">↑</span>
                                            </div>
                                            <label class="control-label">Jump</label>
                                        </li>
                                        <li><div class="keycol">
                                            <span class="key">←</span> <span class="key">→</span>
                                        </div>
                                        <label class="control-label">Movement</label></li>
                                        <li><div class="keycol">
                                                <span class="key">↓</span>
                                            </div>
                                        <label class="control-label">Attack</label></li>
                                        <li><div class="keycol">
                                                <span class="key">-</span>
                                            </div>
                                        <label class="control-label">Defence</label></li>
                                    </ul>
                                   
                            </div>
                        </div>
                </div>
               
        </div>
            <div class="player-setup">
            
            <div class="player-box p1-box">
                <label>P1</label>
                <div class="player-name"><?php echo htmlspecialchars($my_username); ?></div>
                <input type="hidden" id="Name1" value="<?php echo htmlspecialchars($my_username); ?>">
            </div>

            <div class="player-box p2-box">
    <label>P2</label>
    
    <select id="SelectP2" class="player-select" onchange="toggleP2Password()" >
        <option value="0" data-name="BOT/OSPITE" > BOT / OPPONENT </option>
        <?php
        if ($result_users && $result_users->num_rows > 0) {
            while($user = $result_users->fetch_assoc()) {
                echo '<option value="' . $user['id'] . '" data-name="' . htmlspecialchars($user['username']) . '">' . htmlspecialchars($user['username']) . '</option>';
            }
        }
        ?>
    </select>

    <input type="password" id="PassP2" class="player-select" placeholder="Enter P2 Password">
    
    
</div>
        </div>
        <h2 class ="text-gold">MODE SELECTION</h2>
        <div class="choosing-mode">
            <button id ="Mode1" data-mode="adventure" class="map-button selected" onclick="SaveMode(true)"><img src ="./img/Index/IndexMap1.png" alt = "Adventure" ></button>
            <button id ="Mode2" data-mode="sandbox" class="map-button" onclick="SaveMode(false)"><img src ="./img/Index/IndexMap2.png" alt = "Sandbox" ></button>
        </div>
        <div class ="choosing-mode"><h2 id ="ModeChosen" class="text-gold">Sandbox</h2></div>

        <h2 class ="text-gold">MAP SELECTION</h2>
        <div class="choosing-map">
            <button id ="Map1" data-map="1" class="map-button selected" onclick="SaveMap(true)"><img src ="./img/Index/IndexMap1.png" alt = "King's Pass" ></button>
            <button id ="Map2" data-map="2" class="map-button" onclick="SaveMap(false)"><img src ="./img/Index/IndexMap2.png" alt = "Demons" ></button>
        </div>
        <div class ="choosing-map"><h2 id ="MapChosen" class="text-gold">King's Pass</h2></div>
                <button class="arcade-btn" onclick="SaveNames()">
    START GAME
</button>
<div class="leaderboard-container">
            <h2 class="text-gold">TOP 5 FIGHTERS</h2>
            <table class="arcade-table">
                <thead>
                    <tr>
                        <th>RANK</th>
                        <th>NAME</th>
                        <th>WINS</th>
                        <th>LOSS</th>
                        <th>WIN RATIO</th>
                        <th>DMG</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    if ($result && $result->num_rows > 0) {
                        $rank = 1;
                        while($row = $result->fetch_assoc()) {
                            echo "<tr>";
                            echo "<td>#$rank</td>";
                            echo "<td>" . htmlspecialchars($row['username']) . "</td>";
                            echo "<td class='text-gold'>" . $row['partite_vinte'] . "</td>";
                            echo "<td>".$row['partite_perse']."</td>";
                            echo "<td>".CalculateRateo($row['partite_vinte'],$row['partite_perse'])."</td>";
                            echo "<td>" . $row['danni_totali'] . "</td>";
                            echo "</tr>";
                            $rank++;
                        }
                    } else {
                        echo "<tr><td colspan='4'>NO DATA</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
        <script src="./js/index.js"></script>
    </body>
</html>