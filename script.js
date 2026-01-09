// GANTI SHEET_ID dengan ID punyamu jika berbeda
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
            q: r.c[0] ? String(r.c[0].v) : "Soal Kosong",
            a: r.c[1] ? String(r.c[1].v) : "-",
            b: r.c[2] ? String(r.c[2].v) : "-",
            c: r.c[3] ? String(r.c[3].v) : "-",
            // Membersihkan kunci jawaban agar hanya terbaca A, B, atau C
            k: r.c[4] ? String(r.c[4].v).toUpperCase().replace(/[^ABC]/g, '') : "" 
        }));

        if (questions.length > 0) {
            isGameActive = true;
            document.getElementById('start-btn').style.display = 'none';
            for(let i=1; i<=4; i++) renderQ(i);
        } else {
            alert("Data di Google Sheet kosong!");
        }
    } catch(e) {
        document.querySelectorAll('.q-box').forEach(el => el.innerText = "Error: Cek Publish to Web Sheet!");
        console.error(e);
    }
}

function renderQ(pNum) {
    if (!isGameActive) return;
    const data = questions[pQIdx[pNum-1]];
    
    const qEl = document.getElementById(`q${pNum}`);
    const optArea = document.getElementById(`opt${pNum}`);
    
    if(!qEl || !optArea) return;

    qEl.innerText = data.q;
    optArea.innerHTML = ''; 
    
    ['A', 'B', 'C'].forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = `${label}. ${data[label.toLowerCase()]}`;
        // PENTING: Gunakan closure untuk mengunci nomor pemain
        btn.onclick = (function(p, l) {
            return function() { checkAns(p, l); };
        })(pNum, label);
        optArea.appendChild(btn);
    });
}

function checkAns(pNum, choice) {
    if(!isGameActive) return;

    const data = questions[pQIdx[pNum-1]];
    const correctKey = data.k;
    const duck = document.getElementById(`d${pNum}`);

    // LOGIKA PERGERAKAN PASTI JALAN
    if (choice === correctKey) {
        // Efek Suara Benar
        const sOk = document.getElementById('snd-ok');
        sOk.currentTime = 0;
        sOk.play().catch(()=>{});
        
        // MAJU 8%
        pPos[pNum-1] += 8; 
        duck.style.left = pPos[pNum-1] + "%";
        
        if (pPos[pNum-1] >= 85) {
            isGameActive = false;
            const notif = document.getElementById('win-notif');
            notif.innerText = `BEBEK ${pNum} MENANG! 🏆`;
            notif.style.display = 'block';
            return;
        }
    } else {
        // Efek Suara Salah
        const sNo = document.getElementById('snd-no');
        sNo.currentTime = 0;
        sNo.play().catch(()=>{});
        
        // MUNDUR 3%
        pPos[pNum-1] = Math.max(1, pPos[pNum-1] - 3);
        duck.style.left = pPos[pNum-1] + "%";
    }

    // Ganti Soal
    pQIdx[pNum-1] = (pQIdx[pNum-1] + 1) % questions.length;
    renderQ(pNum);
}
