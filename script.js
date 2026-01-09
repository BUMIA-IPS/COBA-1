// Menggunakan var untuk menghindari error "already declared"
var MY_SHEET_ID = "1hpWKGV0q74t77vxGrHAujag-i2OTquEi_0U4eOcsPKM";
var MY_URL_DATA = "https://docs.google.com/spreadsheets/d/" + MY_SHEET_ID + "/gviz/tq?tqx=out:json";

var gameQuestions = [];
var gamePos = [1, 1, 1, 1]; 
var gameQIdx = [0, 0, 0, 0]; 
var raceActive = false;

async function initGame() {
    console.log("Memulai proses loading...");
    try {
        const response = await fetch(MY_URL_DATA);
        const rawText = await response.text();
        const jsonData = JSON.parse(rawText.substr(47).slice(0, -2));
        
        gameQuestions = jsonData.table.rows.map(r => ({
            q: r.c[0] ? String(r.c[0].v) : "Soal Kosong",
            a: r.c[1] ? String(r.c[1].v) : "-",
            b: r.c[2] ? String(r.c[2].v) : "-",
            c: r.c[3] ? String(r.c[3].v) : "-",
            k: r.c[4] ? String(r.c[4].v).toUpperCase().trim() : "" 
        }));

        if (gameQuestions.length > 0) {
            raceActive = true;
            document.getElementById('start-btn').style.display = 'none';
            for(let i=1; i<=4; i++) renderQuestion(i);
            console.log("Data siap! Balapan dimulai.");
        }
    } catch(err) {
        console.error("Gagal memuat data:", err);
        alert("Koneksi gagal! Pastikan Google Sheet sudah 'Publish to Web'.");
    }
}

function renderQuestion(pNum) {
    const data = gameQuestions[gameQIdx[pNum-1]];
    if (!data) return;

    document.getElementById("q" + pNum).innerText = data.q;
    const optArea = document.getElementById("opt" + pNum);
    optArea.innerHTML = ''; 
    
    ['A', 'B', 'C'].forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = label + ". " + data[label.toLowerCase()];
        btn.onclick = function() { checkRaceAnswer(pNum, label); };
        optArea.appendChild(btn);
    });
}

function checkRaceAnswer(pNum, choice) {
    if(!raceActive) return;
    
    const correctAns = gameQuestions[gameQIdx[pNum-1]].k;
    const duckImg = document.getElementById("d" + pNum);

    if (choice === correctAns) {
        // Suara Quack
        const sOk = document.getElementById('snd-ok');
        if(sOk) { sOk.currentTime = 0; sOk.play().catch(()=>{}); }
        
        // Maju 8%
        gamePos[pNum-1] += 8; 
        duckImg.style.left = gamePos[pNum-1] + "%";
        
        if (gamePos[pNum-1] >= 85) {
            raceActive = false;
            const winText = document.getElementById('win-notif');
            winText.innerText = "BEBEK " + pNum + " MENANG! 🏆";
            winText.style.display = 'block';
        }
    } else {
        // Suara Salah
        const sNo = document.getElementById('snd-no');
        if(sNo) { sNo.currentTime = 0; sNo.play().catch(()=>{}); }
        
        // Mundur 3%
        gamePos[pNum-1] = Math.max(1, gamePos[pNum-1] - 3);
        duckImg.style.left = gamePos[pNum-1] + "%";
    }

    // Lanjut ke soal berikutnya (looping)
    gameQIdx[pNum-1] = (gameQIdx[pNum-1] + 1) % gameQuestions.length;
    renderQuestion(pNum);
}
