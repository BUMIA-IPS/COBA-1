const SHEET_ID = "1hpWKGV0q74t77vxGrHAujag-i2OTquEi_0U4eOcsPKM";
const URL_DATA = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let questions = [];
let pPos = [1, 1, 1, 1];
let pQIdx = [0, 0, 0, 0];
let isGameActive = false;

async function initGame() {
    try {
        const res = await fetch(URL_DATA);
        const txt = await res.text();
        const json = JSON.parse(txt.substr(47).slice(0, -2));
        questions = json.table.rows.map(r => ({
            q: r.c[0] ? r.c[0].v : "Soal...",
            a: r.c[1] ? r.c[1].v : "-",
            b: r.c[2] ? r.c[2].v : "-",
            c: r.c[3] ? r.c[3].v : "-",
            k: r.c[4] ? r.c[4].v.toString().toUpperCase().trim() : "A"
        }));
        
        isGameActive = true;
        document.getElementById('start-btn').style.display = 'none';
        for(let i=1; i<=4; i++) renderQ(i);
    } catch(e) {
        alert("Gagal memuat data! Pastikan Google Sheet sudah di-Publish to Web.");
    }
}

function renderQ(p) {
    if (!isGameActive) return;
    if (pQIdx[p-1] >= questions.length) pQIdx[p-1] = 0;
    const data = questions[pQIdx[p-1]];
    
    document.getElementById(`q${p}`).innerText = data.q;
    const optArea = document.getElementById(`opt${p}`);
    optArea.innerHTML = '';
    
    ['A', 'B', 'C'].forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = `${label}. ${data[label.toLowerCase()]}`;
        btn.onclick = () => checkAns(p, label);
        optArea.appendChild(btn);
    });
}

function playSound(id) {
    const s = document.getElementById(id);
    if(s) { s.currentTime = 0; s.play().catch(()=>{}); }
}

function checkAns(p, choice) {
    if(!isGameActive) return;
    const correct = questions[pQIdx[p-1]].k;

    if (choice === correct) {
        playSound('snd-ok');
        pPos[p-1] += 8; // Maju 8%
        document.getElementById(`d${p}`).style.left = pPos[p-1] + "%";
        
        if (pPos[p-1] >= 85) {
            isGameActive = false;
            const winBox = document.getElementById('win-notif');
            winBox.innerText = `BEBEK ${p} MENANG! 🏆`;
            winBox.style.display = 'block';
        }
    } else {
        playSound('snd-no');
        pPos[p-1] = Math.max(1, pPos[p-1] - 3); // Mundur 3%
        document.getElementById(`d${p}`).style.left = pPos[p-1] + "%";
    }
    
    pQIdx[p-1]++;
    renderQ(p);
}