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
        renderResults(data);
        
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
        // 1: A, J, S | 2: B, K, T | 3: C, L, U | 4: D, M, V | 5: E, N, W | 6: F, O, X | 7: G, P, Y | 8: H, Q, Z | 9: I, R
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
        // Physical: 4, 5 | Emotional: 2, 3, 6 | Mental: 1, 8 | Intuitive: 7, 9
        const planes = {
            physical: (intensityCounts[4] || 0) + (intensityCounts[5] || 0),
            emotional: (intensityCounts[2] || 0) + (intensityCounts[3] || 0) + (intensityCounts[6] || 0),
            mental: (intensityCounts[1] || 0) + (intensityCounts[8] || 0),
            intuitive: (intensityCounts[7] || 0) + (intensityCounts[9] || 0)
        };

        // 5. Pinnacle Pyramid
        const dobParts = dob.split('-'); // [YYYY, MM, DD]
        const year = reduceNumber(parseInt(dobParts[0]));
        const month = reduceNumber(parseInt(dobParts[1]));
        const day = reduceNumber(parseInt(dobParts[2]));

        const p1 = reduceNumber(month + day);
        const p2 = reduceNumber(day + year);
        const p3 = reduceNumber(p1 + p2);
        const p4 = reduceNumber(month + year);

        return {
            birthCounts,
            intensityCounts,
            planes,
            pinnacles: { p1, p2, p3, p4 },
            numberMeanings,
            planeMeanings
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
    function renderResults(data) {
        renderBirthGrid(data.birthCounts);
        renderInclusionGrid(data.intensityCounts);
        renderIntensityTable(data.intensityCounts, data.numberMeanings);
        renderPlanesChart(data.planes);
        renderPyramid(data.pinnacles);
        renderPlaneDescriptions(data.planes, data.planeMeanings);
    }

    /**
     * ① Birth Grid
     * Layout:
     * 3 6 9
     * 2 5 8
     * 1 4 7
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

        // Line Check
        const lines = [];
        const possibleLines = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], // Horizontal (in terms of values)
            [1, 4, 7], [2, 5, 8], [3, 6, 9], // Vertical
            [1, 5, 9], [3, 5, 7]             // Diagonal
        ];

        possibleLines.forEach(line => {
            if (line.every(n => counts[n] > 0)) {
                lines.push(line.join('-'));
            }
        });

        const lineDesc = document.getElementById('birth-grid-lines');
        if (lines.length > 0) {
            lineDesc.innerHTML = `<span class="text-rose-400 font-semibold">完成ライン:</span> ${lines.join(', ')} がアクティブです。`;
        } else {
            lineDesc.textContent = 'アクティブなラインはありません。';
        }
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
                label = 'カルミック・レッスン (欠如)';
                color = 'bg-gray-300';
            } else if (count >= 4) {
                label = '過多 (強すぎるエネルギー)';
                color = 'bg-orange-300';
            }

            const item = document.createElement('div');
            item.className = 'group';
            item.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <div class="flex items-center">
                        <span class="w-6 font-bold text-gray-700">${i}</span>
                        <span class="text-xs text-gray-400 ml-2">${label}</span>
                    </div>
                    <span class="text-xs font-mono text-gray-500">${count}個</span>
                </div>
                <div class="intensity-bar-bg mb-1">
                    <div class="intensity-bar-fill ${color}" style="width: 0%"></div>
                </div>
                <p class="text-[10px] text-gray-400 leading-tight mb-2">${detail}</p>
            `;
            container.appendChild(item);
            
            // Trigger animation
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
        
        const keyMap = {
            physical: '肉体的',
            emotional: '感情的',
            mental: '知性的',
            intuitive: '精神的'
        };

        container.innerHTML = `
            <p class="text-sm text-gray-600 mb-2">
                あなたの最も強い領域は <span class="text-rose-500 font-bold">${keyMap[strongest]}</span> です。
            </p>
            <p class="text-xs text-gray-500 leading-relaxed">
                ${meanings[strongest]}
            </p>
        `;
    }

    /**
     * ③ Planes of Expression (Chart.js)
     */
    function renderPlanesChart(planes) {
        const ctx = document.getElementById('planes-chart').getContext('2d');
        
        if (planesChart) {
            planesChart.destroy();
        }

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
                        pointLabels: {
                            color: '#6b7280',
                            font: { size: 12 }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    /**
     * ⑤ Pinnacle Pyramid (SVG)
     */
    function renderPyramid(pinnacles) {
        const container = document.getElementById('pyramid-container');
        container.innerHTML = `
            <svg viewBox="0 0 400 270" class="w-full h-full pyramid-svg">
                <!-- Pyramid Lines -->
                <path d="M200 40 L50 240 L350 240 Z" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
                <path d="M200 40 L125 140 L275 140 Z" fill="none" stroke="rgba(251,113,133,0.3)" stroke-width="2" />
                
                <!-- P3 (Top) -->
                <circle cx="200" cy="40" r="18" fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.6)" />
                <text x="200" y="47" text-anchor="middle" class="pyramid-value">${pinnacles.p3}</text>
                <text x="200" y="15" text-anchor="middle" class="pyramid-label">第3ピナクル</text>

                <!-- P1 (Mid Left) -->
                <circle cx="125" cy="140" r="18" fill="rgba(251,113,133,0.05)" stroke="rgba(251,113,133,0.4)" />
                <text x="125" y="147" text-anchor="middle" class="pyramid-value">${pinnacles.p1}</text>
                <text x="80" y="145" text-anchor="end" class="pyramid-label">第1</text>

                <!-- P2 (Mid Right) -->
                <circle cx="275" cy="140" r="18" fill="rgba(251,113,133,0.05)" stroke="rgba(251,113,133,0.4)" />
                <text x="275" y="147" text-anchor="middle" class="pyramid-value">${pinnacles.p2}</text>
                <text x="320" y="145" text-anchor="start" class="pyramid-label">第2</text>

                <!-- P4 (Bottom Center) -->
                <circle cx="200" cy="230" r="18" fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.4)" />
                <text x="200" y="237" text-anchor="middle" class="pyramid-value">${pinnacles.p4}</text>
                <text x="200" y="265" text-anchor="middle" class="pyramid-label">第4ピナクル</text>
            </svg>
        `;
    }
        `;
    }
});
