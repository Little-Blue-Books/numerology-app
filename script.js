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
     * ⑤ Pinnacle Pyramid (SVG)
     */
    function renderPyramid(pinnacles) {
        const container = document.getElementById('pyramid-container');
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
        
        const lpDetails = {
            1: "独立独歩のパイオニア。革新的でリーダーシップに溢れ、未知の領域へ第一歩を踏み出す勇気を持っています。自信に満ちた行動が周囲を牽引しますが、独断専行にならないよう注意が必要です。あなたの強みは圧倒的な決断力と創造性にあります。",
            2: "調和と感受性の人。優れた共感力を持ち、集団の中での潤滑油的な役割を果たします。細やかな配慮と外交能力に長けていますが、他人の評価を気にしすぎる面もあります。自分自身の内なる声と他人との境界線を大切にすることで、真の調和が生まれます。",
            3: "自己表現と創造の喜びを象徴する魂。楽観的でコミュニケーション能力が高く、芸術や言葉を通じて人々を癒し、楽しませる才能があります。多才ゆえにエネルギーが分散しやすいため、一つの表現方法を深く追求することが成功の鍵となります。",
            4: "秩序と安定を築くビルダー。誠実で努力家、計画的に物事を進める実務能力は周囲から絶大な信頼を寄せられます。変化を恐れ硬直化しやすい傾向がありますが、基盤を整えた上で柔軟性を取り入れることで、誰にも崩せない真の成功を手にします。",
            5: "自由と変化を愛する冒険家。知的好奇心が旺盛で、変化の激しい環境でこそ真価を発揮します。適応力と多才さは武器ですが、飽きっぽさや放縦に流されない自律心を持つことで、経験が知恵へと昇華され、多くの人を導くカリスマ性が目覚めます。",
            6: "愛と責任の奉仕者。家族やコミュニティに対する献身的な愛を持ち、調和の取れた美しい環境を整えることに喜びを感じます。世話を焼きすぎて過干渉にならないよう注意が必要ですが、あなたの慈愛のエネルギーは多くの人々を精神的に支える柱となります。",
            7: "真理を探求する知性の魂。分析力と洞察力に優れ、独りの時間を大切にしながら物事の本質を解き明かします。完璧主義が孤独を深めることがありますが、精神的な学びを深めることで、世俗的な成功を超えた深い知恵と平穏を手にする哲学者となります。",
            8: "権威と豊かさを実現する達成者。組織を動かす力とビジネスセンスに長け、大きな目標を達成する不屈の精神を持っています。物質的な成功へのこだわりが強すぎると冷酷に見えることがありますが、精神的な価値と統合することで、社会に真の豊かさをもたらします。",
            9: "すべてを包み込む博愛主義者。広い視野と深い慈愛を持ち、個人の利益を超えて人類全体の幸福のために尽力します。理想が高すぎて現実に失望することがあるかもしれませんが、手放すことの美しさを知ることで、最も高い次元の精神的自由を手にします。",
            11: "直感と霊感のメッセンジャー。高い理想と鋭いインスピレーションを持ち、人々に新たな視点や希望を与える役割を担っています。非常に繊細で、現実とのギャップに苦しむことがありますが、その感性を形にすることで、多くの人の魂を震わせる使命を果たします。",
            22: "理想を形にするマスタービルダー。壮大なビジョンと、それを実行に移す圧倒的な実務能力を併せ持っています。責任の重さに圧倒されることもありますが、多くの人々と協力して社会に永続的な価値を築く、人類の発展に寄与する大きな運命を背負っています。"
        };

        const karmicDetails = {
            1: "【自己の確立】自分を信じる力、独自のアイデンティティを確立することがテーマです。周囲に合わせるのではなく、自分の意見を毅然と主張する勇気を持ちましょう。",
            2: "【協力と調和】忍耐強さ、他人との細やかな協力関係を築くことが学びです。他人のペースに合わせることや、静かに待つことの重要性を知る機会が訪れます。",
            3: "【表現の勇気】自分の考えや感情を率直に、かつ明るく表現することがテーマです。内面にある創造性を恥ずかしがらずに外へ出すことで、運気が開けます。",
            4: "【基盤と規律】継続すること、秩序を保つこと、地道な努力の価値を学ぶ必要があります。物事を途中で投げ出さず、細部まで丁寧に仕上げる姿勢が大切です。",
            5: "【変化への適応】新しい環境や予期せぬ変化を受け入れ、楽しむ柔軟性を養うことがテーマです。未知の領域への恐怖を克服し、自由に羽ばたく力を育てましょう。",
            6: "【責任と奉仕】家族や身近な人々に対する無償の愛と、責任を引き受けることが学びです。自分の都合だけでなく、他人のために何ができるかを考えることで成長します。",
            7: "【内省と信頼】目に見えない真理を信じること、自分自身の内面を深く見つめることがテーマです。表面的な情報に惑わされず、直感や精神的な学びを深めてください。",
            8: "【パワーの行使】金銭管理や、力・権威を正しく扱うことが学びです。物質的な豊かさに対して健全な意欲を持ち、それを社会のためにどう使うかを学びましょう。",
            9: "【寛容と慈愛】執着を手放し、すべてを許し、愛すること。偏見を捨てて広い心で世界を見つめ、無償の愛を実践することが魂の成長に繋がります。"
        };

        const pinnacleDetails = {
            1: "「自立と新しい始まり」の時期。他人に頼らず自分の足で立つことが求められます。新たなプロジェクトの立ち上げや、リーダーシップを発揮する機会が増えるでしょう。勇気を持って決断することが成功の鍵です。",
            2: "「調和と協力」の時期。忍耐力と外交能力が試されます。人との協力関係やパートナーシップを通じて物事が進展します。細やかな配慮と、待つ姿勢を大切にしてください。",
            3: "「表現と社交」の時期。あなたの創造性が豊かに花開きます。コミュニケーション、執筆、芸術活動などを通じて注目を集めるでしょう。人生を楽しみ、周囲を明るく照らしてください。",
            4: "「基盤と努力」の時期。地道な積み重ねが後の大きな成果に繋がります。規律正しく働き、家や仕事の基盤を固めることに専念してください。今は確実な一歩を刻むときです。",
            5: "「変化と冒険」の時期。予期せぬ出来事や旅行、転居など、生活に刺激が訪れます。古い習慣を脱ぎ捨て、自由を謳歌してください。好奇心に従って動くことが幸運を呼びます。",
            6: "「家庭と責任」の時期。家族や共同体への奉仕、愛がテーマとなります。他者の面倒を見る役割が増えるかもしれませんが、それはあなたにとって大きな喜びと安定をもたらすでしょう。",
            7: "「内省と教育」の時期。静かに自分自身を見つめ、学びを深めるのに最適な時期です。精神的な探求や専門的な研究に時間を割いてください。外側の喧騒から離れ、内なる平安を築きましょう。",
            8: "「達成とパワー」の時期。これまでの努力が形となり、物質的な成功や権威を手にするチャンスです。組織力や経営能力が評価されます。大胆に野心を持って行動し、成果を勝ち取ってください。",
            9: "「完結と奉仕」の時期。古いものが終わり、新しいサイクルのための準備が始まります。執着を手放し、周囲への愛を実践してください。寛大な心が、次のステージへの素晴らしい架け橋となります。",
            11: "「インスピレーションと啓示」の時期。非常に高いエネルギーが流れ、あなたの直感が冴え渡ります。理想を高く持ち、人々に精神的な影響を与える役割を担うことになります。魂の目的を再確認してください。",
            22: "「大規模な構築」の時期。あなたのビジョンが形になり、社会に大きな影響を与える事業や活動が展開されます。多忙を極めるかもしれませんが、人類の未来に寄与する仕事に誇りを持って取り組んでください。"
        };

        const missing = Object.entries(data.intensityCounts).filter(e => e[1] === 0).map(e => e[0]);
        let karmicSection = "";
        if (missing.length === 0) {
            karmicSection = `<p class="mb-4">あなたの名前には全ての数字のエネルギーが含まれています。バランスが取れており、多様な経験を自然にこなせるでしょう。</p>`;
        } else {
            karmicSection = `<ul class="space-y-4">`;
            missing.forEach(num => {
                karmicSection += `
                    <li class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <span class="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded mb-2">Lesson ${num}</span>
                        <p class="text-sm">${karmicDetails[num]}</p>
                    </li>`;
            });
            karmicSection += `</ul>`;
        }

        const currPinnacle = calculateCurrentPinnacle(dob);
        const currPinnacleNum = data.pinnacles['p' + currPinnacle];

        container.innerHTML = `
            <div class="mb-12">
                <div class="flex items-center mb-6">
                    <span class="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-2xl mr-4 shadow-lg shadow-rose-200">${data.lifePath}</span>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                        1. あなたの魂の本質：<br class="md:hidden">誕生数は <span class="text-rose-500">「${data.lifePath}」</span> です
                    </h3>
                </div>
                <p class="text-gray-600 pl-16 leading-relaxed border-l-2 border-rose-100 ml-6">${lpDetails[data.lifePath] || "独自の才能を持つ個性的な魂です。"}</p>
            </div>
            
            <div class="mb-12">
                <div class="flex items-center mb-6">
                    <span class="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-xl mr-4 shadow-lg shadow-orange-100">!</span>
                    <h3 class="text-2xl font-bold text-gray-800">2. 今世で向き合うべき学び（カルミック・レッスン）</h3>
                </div>
                <div class="pl-14">
                    <p class="text-gray-500 text-sm mb-6">氏名に欠けている数字は、あなたが今世で意識的に学ぶ必要があるテーマを示しています。</p>
                    ${karmicSection}
                </div>
            </div>
            
            <div class="mb-12">
                <div class="flex items-center mb-6">
                    <span class="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xl mr-4 shadow-lg shadow-amber-100">${currPinnacleNum}</span>
                    <h3 class="text-2xl font-bold text-gray-800">3. 現在のステージ（第${currPinnacle}ピナクル周期）</h3>
                </div>
                <div class="pl-14">
                    <p class="text-gray-600 leading-relaxed">${pinnacleDetails[currPinnacleNum]}</p>
                    <p class="text-xs text-gray-400 mt-4 italic">※現在の年齢(${calculateAge(dob)}歳)に基づき推定しています。</p>
                </div>
            </div>

            <div class="bg-gradient-to-r from-rose-50 to-orange-50 p-8 rounded-3xl border border-rose-100 mt-16">
                <h3 class="text-xl font-bold text-rose-600 mb-4 flex items-center">
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    総合アドバイス
                </h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                    これらの数字は決定された「運命」ではなく、あなたが持っている「資質」の地図です。
                    資質をどう活かし、課題をどう乗り越えるかはあなた次第です。
                    特に「カルミック・レッスン」で示された数字を意識的に行動に取り入れることで、
                    現在直面している停滞感を打破し、人生をより豊かなものへと変えていけるでしょう。
                </p>
            </div>
        `;
    }

    function calculateCurrentPinnacle(dob) {
        const age = calculateAge(dob);
        if (age < 28) return 1;
        if (age < 37) return 2;
        if (age < 46) return 3;
        return 4;
    }

    function calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    }
});
