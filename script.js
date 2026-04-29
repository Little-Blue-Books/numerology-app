/**
 * Numerology Insights Dashboard - Logic Script
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analysis-form');
    const resultsArea = document.getElementById('results');
    let planesChart = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dob = document.getElementById('dob').value;
        const fullname = document.getElementById('fullname').value.toUpperCase();
        
        if (!dob || !fullname) return;

        // Perform Analysis
        const data = analyzeNumerology(dob, fullname);
        
        // Render Results
        renderResults(data, dob, fullname);
        
        // Show Results Area
        resultsArea.classList.add('active');
        resultsArea.classList.remove('hidden');
        
        // Smooth scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    });

    /**
     * Core Analysis Function
     */
    function analyzeNumerology(dob, fullname) {
        const numberMeanings = {
            1: "独立・リーダーシップ・創造",
            2: "調和・協力・感受性",
            3: "自己表現・楽観的・創造性",
            4: "安定・秩序・実直",
            5: "自由・変化・多才",
            6: "責任・調和・奉仕",
            7: "分析・内省・精神性",
            8: "権威・豊かさ・達成",
            9: "博愛・完結・慈愛"
        };

        const planeMeanings = {
            physical: "行動力や現実的な実行力を示します。数値が高いほど、物事を形にする力が強い傾向があります。",
            emotional: "感情の豊かさや対人感受性を示します。数値が高いほど、共感力が高く、感情で物事を捉える傾向があります。",
            mental: "論理的思考や戦略性を示します。数値が高いほど、客観的・知的に物事を処理する傾向があります。",
            intuitive: "直感力や霊的な感受性を示します。数値が高いほど、目に見えないエネルギーやインスピレーションを受け取る傾向があります。"
        };

        // 1. Convert Name to Numbers (Pythagorean)
        const pythagoreanMap = {
            'A': 1, 'J': 1, 'S': 1,
            'B': 2, 'K': 2, 'T': 2,
            'C': 3, 'L': 3, 'U': 3,
            'D': 4, 'M': 4, 'V': 4,
            'E': 5, 'N': 5, 'W': 5,
            'F': 6, 'O': 6, 'X': 6,
            'G': 7, 'P': 7, 'Y': 7,
            'H': 8, 'Q': 8, 'Z': 8,
            'I': 9, 'R': 9
        };

        const nameNumbers = fullname.split('').filter(char => pythagoreanMap[char]).map(char => pythagoreanMap[char]);

        // 2. Birth Grid Counts
        const dobDigits = dob.replace(/-/g, '').split('').map(Number);
        const birthCounts = countNumbers(dobDigits);

        // 3. Intensity Counts (Name)
        const intensityCounts = countNumbers(nameNumbers);

        // 4. Planes of Expression
        const planes = {
            physical: (intensityCounts[4] || 0) + (intensityCounts[5] || 0),
            emotional: (intensityCounts[2] || 0) + (intensityCounts[3] || 0) + (intensityCounts[6] || 0),
            mental: (intensityCounts[1] || 0) + (intensityCounts[8] || 0),
            intuitive: (intensityCounts[7] || 0) + (intensityCounts[9] || 0)
        };

        // 5. Pinnacle Pyramid
        const dobParts = dob.split('-'); // [YYYY, MM, DD]
        const yearNum = parseInt(dobParts[0]);
        const monthNum = parseInt(dobParts[1]);
        const dayNum = parseInt(dobParts[2]);

        const year = reduceNumber(yearNum);
        const month = reduceNumber(monthNum);
        const day = reduceNumber(dayNum);

        const p1 = reduceNumber(month + day);
        const p2 = reduceNumber(day + year);
        const p3 = reduceNumber(p1 + p2);
        const p4 = reduceNumber(month + year);

        // 6. Life Path Number
        const lifePath = reduceNumber(yearNum + monthNum + dayNum);

        return {
            birthCounts,
            intensityCounts,
            planes,
            pinnacles: { p1, p2, p3, p4 },
            numberMeanings,
            planeMeanings,
            lifePath
        };
    }

    /**
     * Helper: Count occurrences of 1-9
     */
    function countNumbers(arr) {
        const counts = {};
        for (let i = 1; i <= 9; i++) counts[i] = 0;
        arr.forEach(num => {
            if (num >= 1 && num <= 9) counts[num]++;
        });
        return counts;
    }

    /**
     * Helper: Reduce number to 1-9 or Master Number (11, 22)
     */
    function reduceNumber(num) {
        if (num === 11 || num === 22) return num;
        let sum = num;
        while (sum > 9) {
            sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
            if (sum === 11 || sum === 22) return sum;
        }
        return sum;
    }

    /**
     * Render results to UI
     */
    function renderResults(data, dob, fullname) {
        renderBirthGrid(data.birthCounts);
        renderInclusionGrid(data.intensityCounts);
        renderIntensityTable(data.intensityCounts, data.numberMeanings);
        renderPlanesChart(data.planes);
        renderPyramid(data.pinnacles);
        renderPlaneDescriptions(data.planes, data.planeMeanings);
        renderReport(data, dob, fullname);
    }

    /**
     * ① Birth Grid
     */
    function renderBirthGrid(counts) {
        const container = document.getElementById('birth-grid');
        container.innerHTML = '';
        const order = [3, 6, 9, 2, 5, 8, 1, 4, 7];
        
        order.forEach(num => {
            const count = counts[num];
            const cell = document.createElement('div');
            cell.className = `grid-cell ${count > 0 ? (count > 2 ? 'active active-strong' : 'active') : ''}`;
            cell.innerHTML = `<span>${num}</span>${count > 0 ? `<span class="count">${count}</span>` : ''}`;
            container.appendChild(cell);
        });

        const possibleLines = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], 
            [1, 4, 7], [2, 5, 8], [3, 6, 9], 
            [1, 5, 9], [3, 5, 7]             
        ];

        const activeLines = [];
        possibleLines.forEach(line => {
            if (line.every(n => counts[n] > 0)) activeLines.push(line.join('-'));
        });

        const lineDesc = document.getElementById('birth-grid-lines');
        lineDesc.innerHTML = activeLines.length > 0 ? `<span class="text-rose-400 font-semibold">完成ライン:</span> ${activeLines.join(', ')} がアクティブです。` : 'アクティブなラインはありません。';
    }

    /**
     * ④ Inclusion Grid
     */
    function renderInclusionGrid(counts) {
        const container = document.getElementById('inclusion-grid');
        container.innerHTML = '';
        const order = [3, 6, 9, 2, 5, 8, 1, 4, 7];
        
        order.forEach(num => {
            const count = counts[num];
            const cell = document.createElement('div');
            cell.className = `grid-cell ${count === 0 ? 'missing' : ''}`;
            cell.innerHTML = `<span>${num}</span>`;
            container.appendChild(cell);
        });
    }

    /**
     * ② Intensity Table
     */
    function renderIntensityTable(counts, meanings) {
        const container = document.getElementById('intensity-container');
        container.innerHTML = '';
        
        for (let i = 1; i <= 9; i++) {
            const count = counts[i];
            let label = '平均的';
            let color = 'bg-rose-300';
            let detail = meanings[i];
            
            if (count === 0) {
                label = '欠如';
                color = 'bg-gray-200';
            } else if (count >= 4) {
                label = '過多';
                color = 'bg-orange-300';
            }

            const item = document.createElement('div');
            item.className = 'group';
            item.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <div class="flex items-center">
                        <span class="w-6 font-bold text-gray-700">${i}</span>
                        <span class="text-[10px] text-gray-400 ml-2">${label}</span>
                    </div>
                    <span class="text-[10px] font-mono text-gray-400">${count}個</span>
                </div>
                <div class="intensity-bar-bg mb-1">
                    <div class="intensity-bar-fill ${color}" style="width: 0%"></div>
                </div>
                <p class="text-[10px] text-gray-400 leading-tight mb-2">${detail}</p>
            `;
            container.appendChild(item);
            
            setTimeout(() => {
                const fill = item.querySelector('.intensity-bar-fill');
                fill.style.width = `${Math.min(count * 20, 100)}%`;
            }, 100);
        }
    }

    function renderPlaneDescriptions(planes, meanings) {
        const container = document.getElementById('planes-description');
        const sorted = Object.entries(planes).sort((a, b) => b[1] - a[1]);
        const strongest = sorted[0][0];
        const keyMap = { physical: '肉体的', emotional: '感情的', mental: '知性的', intuitive: '精神的' };

        container.innerHTML = `
            <p class="text-sm text-gray-600 mb-2">あなたの最も強い領域は <span class="text-rose-500 font-bold">${keyMap[strongest]}</span> です。</p>
            <p class="text-xs text-gray-500 leading-relaxed">${meanings[strongest]}</p>
        `;
    }

    /**
     * ③ Planes of Expression (Chart.js)
     */
    function renderPlanesChart(planes) {
        const ctx = document.getElementById('planes-chart').getContext('2d');
        if (planesChart) planesChart.destroy();
        planesChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['肉体的', '感情的', '知性的', '精神的'],
                datasets: [{
                    label: 'エネルギー分布',
                    data: [planes.physical, planes.emotional, planes.mental, planes.intuitive],
                    backgroundColor: 'rgba(251, 113, 133, 0.2)',
                    borderColor: 'rgba(251, 113, 133, 0.8)',
                    pointBackgroundColor: 'rgba(251, 113, 133, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { display: false, stepSize: 1 },
                        pointLabels: { color: '#6b7280', font: { size: 12 } }
                    }
                },
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    /**
     * ⑤ Pinnacle Pyramid (SVG) - RE-ADJUSTED
     */
    function renderPyramid(pinnacles) {
        const container = document.getElementById('pyramid-container');
        // Increase y values and viewBox height to prevent clipping
        container.innerHTML = `
            <svg viewBox="0 0 400 300" class="w-full h-full pyramid-svg" style="overflow: visible;">
                <!-- Pyramid Lines -->
                <path d="M200 60 L50 260 L350 260 Z" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
                <path d="M200 60 L125 160 L275 160 Z" fill="none" stroke="rgba(251,113,133,0.3)" stroke-width="2" />
                
                <!-- P3 (Top) -->
                <circle cx="200" cy="60" r="18" fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.6)" />
                <text x="200" y="67" text-anchor="middle" class="pyramid-value">${pinnacles.p3}</text>
                <text x="200" y="30" text-anchor="middle" class="pyramid-label" style="font-weight: 600;">第3ピナクル</text>

                <!-- P1 (Mid Left) -->
                <circle cx="125" cy="160" r="18" fill="rgba(251,113,133,0.05)" stroke="rgba(251,113,133,0.4)" />
                <text x="125" y="167" text-anchor="middle" class="pyramid-value">${pinnacles.p1}</text>
                <text x="80" y="165" text-anchor="end" class="pyramid-label">第1</text>

                <!-- P2 (Mid Right) -->
                <circle cx="275" cy="160" r="18" fill="rgba(251,113,133,0.05)" stroke="rgba(251,113,133,0.4)" />
                <text x="275" y="167" text-anchor="middle" class="pyramid-value">${pinnacles.p2}</text>
                <text x="320" y="165" text-anchor="start" class="pyramid-label">第2</text>

                <!-- P4 (Bottom Center) -->
                <circle cx="200" cy="250" r="18" fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.4)" />
                <text x="200" y="257" text-anchor="middle" class="pyramid-value">${pinnacles.p4}</text>
                <text x="200" y="285" text-anchor="middle" class="pyramid-label">第4ピナクル</text>
            </svg>
        `;
    }

    /**
     * ⑥ Detailed Reading Report
     */
    function renderReport(data, dob, fullname) {
        const container = document.getElementById('report-container');
        
        // 1. Life Path Reading
        const lpMeanings = {
            1: "自分の道を切り拓くリーダー。革新的で独立心が強く、新しいアイデアを実行に移す力を持っています。",
            2: "調和と協力を重んじるサポーター。繊細な感受性を持ち、人との繋がりを大切にします。",
            3: "表現豊かなクリエイター。言葉や芸術を通じて喜びを広め、周囲を明るくする才能があります。",
            4: "誠実で安定感のあるビルダー。努力家で秩序を重んじ、着実に目標を達成する信頼される存在です。",
            5: "自由を愛する冒険家。変化を恐れず、多様な経験を通じて成長し、枠に囚われない生き方をします。",
            6: "愛と責任の奉仕者。家族や身近な人々を慈しみ、調和の取れた美しい環境を作ることに長けています。",
            7: "真理を追究する探求者。深い洞察力と精神性を持ち、静寂の中で知恵を育む孤独な哲学者の一面があります。",
            8: "豊かさを実現する達成者。野心的で組織力があり、物質的な成功と精神的な満足を両立させる力があります。",
            9: "すべてを包み込む博愛主義者。広い視野を持ち、人々のために尽力することで魂の完成を目指します。",
            11: "直感に導かれるメッセンジャー。高い理想を持ち、インスピレーションを形にして人々に希望を与えます。",
            22: "理想を現実に変えるマスタービルダー。壮大なビジョンを持ち、社会に貢献する大きな仕組みを築きます。"
        };

        // 2. Karmic Lessons Reading (Missing numbers)
        const missing = Object.entries(data.intensityCounts).filter(e => e[1] === 0).map(e => e[0]);
        let karmicText = "";
        if (missing.length === 0) {
            karmicText = "あなたの名前には全ての数字のエネルギーが含まれています。バランスが取れており、多様な経験を自然にこなせるでしょう。";
        } else {
            karmicText = `あなたの名前には「${missing.join(', ')}」のエネルギーが欠けています。これは今世で意識的に学ぶべき「課題」であり、不足を感じるからこそ、そこに向き合うことで大きな成長が得られます。`;
        }

        // 3. Pinnacle Summary
        const pinnacleText = `現在は第${calculateCurrentPinnacle(dob)}ピナクルの影響下にあります。この時期は「${data.numberMeanings[data.pinnacles['p'+calculateCurrentPinnacle(dob)]]}」というテーマが人生の舞台に現れやすくなります。`;

        container.innerHTML = `
            <div class="border-l-4 border-rose-400 pl-6 mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-2">1. あなたの魂の地図：誕生数 ${data.lifePath}</h3>
                <p>${lpMeanings[data.lifePath] || "独自の才能を持つ個性的な魂です。"}</p>
            </div>
            
            <div class="border-l-4 border-orange-400 pl-6 mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-2">2. 今世での学び：カルミック・レッスン</h3>
                <p>${karmicText}</p>
            </div>
            
            <div class="border-l-4 border-amber-400 pl-6 mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-2">3. 人生のバイオリズム：現在のステージ</h3>
                <p>${pinnacleText}</p>
            </div>

            <div class="bg-rose-50/30 p-6 rounded-2xl border border-rose-100">
                <h3 class="text-lg font-bold text-rose-600 mb-3">アドバイス</h3>
                <p class="text-sm">
                    このダッシュボードに現れた数字は、あなたの「エネルギーの在庫目録」です。
                    過多な部分は「強み」として活かし、欠如している部分は「これから育てていく伸び代」として捉えてください。
                    自分自身のエネルギーを客観的に眺めることで、よりあなたらしい選択ができるようになるはずです。
                </p>
            </div>
        `;
    }

    function calculateCurrentPinnacle(dob) {
        // Simple age-based estimate for demo (standard numerology)
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age < 28) return 1;
        if (age < 37) return 2;
        if (age < 46) return 3;
        return 4;
    }
});
