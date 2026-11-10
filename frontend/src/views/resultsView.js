import { initTypingGame } from './typingTest.js';

/**
 * Renders the post-test results screen using clean CSS classes instead of inline styles.
 */
export function renderResultsScreen(stats) {
    const gameBoxEl = document.querySelector('#view-container');
    if (!gameBoxEl) return;

    const testTypeLabel = `${stats.testMode} · ${stats.testLimit === 0 ? 'infinite' : stats.testLimit}`;
    const datasetLabel = stats.datasetName;

    gameBoxEl.innerHTML = `
        <div class="results-container">
            <!-- TWO-COLUMN PARALLELOGRAM GRID -->
            <div class="results-grid">
                
                <!-- LEFT PARALLELOGRAM: Stats + Title Inside Bottom-Left -->
                <div class="parallelogram-box">
                    <div class="parallelogram-inner">
                        <div>
                            <div class="dataset-badge">
                                dataset: <span class="dataset-name">${datasetLabel}</span> (${testTypeLabel})
                            </div>
                            <div class="metrics-primary-row">
                                <div>
                                    <div class="metric-label">wpm</div>
                                    <div class="metric-value-wpm">${stats.wpm}</div>
                                </div>
                                <div>
                                    <div class="metric-label">acc</div>
                                    <div class="metric-value-acc">${stats.accuracy}%</div>
                                </div>
                            </div>
                            <div class="secondary-metrics-grid">
                                <div>
                                    <div class="secondary-metric-label">raw wpm</div>
                                    <div class="secondary-metric-value">${stats.rawWpm}</div>
                                </div>
                                <div>
                                    <div class="secondary-metric-label">consistency</div>
                                    <div class="secondary-metric-value">${stats.consistency}%</div>
                                </div>
                                <div>
                                    <div class="secondary-metric-label">time elapsed</div>
                                    <div class="secondary-metric-value">${stats.timeElapsed}s</div>
                                </div>
                                <div>
                                    <div class="secondary-metric-label" title="Correct / Incorrect / Extra / Missed">chars (c/i/e/m)</div>
                                    <div class="chars-value">
                                        <span class="char-correct">${stats.charsCorrect}</span> / 
                                        <span class="char-incorrect">${stats.charsIncorrect}</span> / 
                                        <span class="char-extra">${stats.charsExtra}</span> / 
                                        <span class="char-missed">${stats.charsMissed}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Results Dashboard Title inside bottom left -->
                        <div class="parallelogram-footer-title">Results Dashboard</div>
                    </div>
                </div>

                <!-- RIGHT PARALLELOGRAM: Graph + Next Test Button Inside Bottom-Left -->
                <div class="parallelogram-box">
                    <div class="parallelogram-inner">
                        <div>
                            <div class="chart-section-header">
                                <span class="chart-title">wpm over time</span>
                            </div>
                            <div id="chart-viewport" class="chart-viewport"></div>
                        </div>

                        <!-- Next Test Button inside bottom left of right box -->
                        <div class="parallelogram-footer-action">
                            <button id="restart-test-btn" class="restart-btn">🔄 Next Test</button>
                            <div class="chart-toggle-group">
                                    <button id="toggle-line" class="chart-toggle-btn active">Line</button>
                                    <button id="toggle-bar" class="chart-toggle-btn">Bar</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    // (Keep your event listeners unchanged)
    const lineBtn = document.getElementById('toggle-line');
    const barBtn = document.getElementById('toggle-bar');

    renderChart(stats.perSecondWpmLog, 'line');

    lineBtn?.addEventListener('click', () => {
        lineBtn.classList.add('active');
        barBtn.classList.remove('active');
        renderChart(stats.perSecondWpmLog, 'line');
    });

    barBtn?.addEventListener('click', () => {
        barBtn.classList.add('active');
        lineBtn.classList.remove('active');
        renderChart(stats.perSecondWpmLog, 'bar');
    });

    document.getElementById('restart-test-btn')?.addEventListener('click', () => {
        initTypingGame();
    });
}

/**
 * Renders SVG Graph with proper Y-axis and X-axis markings
 */
function renderChart(dataLog, type = 'line') {
    const container = document.getElementById('chart-viewport');
    if (!container) return;

    if (!dataLog || dataLog.length === 0) {
        container.innerHTML = `<span class="no-data-msg">Not enough data for graph</span>`;
        return;
    }

    const width = 460;
    const height = 180;
    const paddingLeft = 40;
    const paddingBottom = 25;

    const maxVal = Math.max(...dataLog, 60);
    const minVal = 0;

    const chartWidth = width - paddingLeft - 20;
    const chartHeight = height - paddingBottom - 20;

    const points = dataLog.map((val, index) => {
        const x = paddingLeft + (index / (Math.max(dataLog.length - 1, 1))) * chartWidth;
        const y = 20 + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
        return { x, y, val };
    });

    let svgContent = '';

    if (type === 'line') {
        const pathData = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
        svgContent = `
            <path d="${pathData}" class="chart-line" />
            ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" class="chart-point" />`).join('')}
        `;
    } else {
        const barWidth = Math.max(3, (chartWidth / dataLog.length) - 4);
        svgContent = points.map(p => {
            const barHeight = (20 + chartHeight) - p.y;
            return `<rect x="${p.x - barWidth/2}" y="${p.y}" width="${barWidth}" height="${barHeight}" class="chart-bar" rx="1.5" />`;
        }).join('');
    }

    const midVal = Math.round(maxVal / 2);
    const yMidPos = 20 + chartHeight / 2;

    container.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
            <!-- Axis Lines -->
            <line x1="${paddingLeft}" y1="${20 + chartHeight}" x2="${width - 20}" y2="${20 + chartHeight}" class="chart-axis-line" />
            <line x1="${paddingLeft}" y1="20" x2="${paddingLeft}" y2="${20 + chartHeight}" class="chart-axis-line" />

            <!-- Grid & Y-Axis Labels -->
            <text x="${paddingLeft - 8}" y="${25 + chartHeight}" class="chart-label" text-anchor="end">0</text>
            <text x="${paddingLeft - 8}" y="${yMidPos + 3}" class="chart-label" text-anchor="end">${midVal}</text>
            <line x1="${paddingLeft}" y1="${yMidPos}" x2="${width - 20}" y2="${yMidPos}" class="chart-grid-line" />
            
            <text x="${paddingLeft - 8}" y="24" class="chart-label" text-anchor="end">${maxVal}</text>
            <line x1="${paddingLeft}" y1="20" x2="${width - 20}" y2="20" class="chart-grid-line" />

            <!-- X-Axis Labels -->
            <text x="${paddingLeft}" y="${height - 5}" class="chart-label" text-anchor="middle">0s</text>
            <text x="${paddingLeft + chartWidth / 2}" y="${height - 5}" class="chart-label" text-anchor="middle">${Math.round(dataLog.length / 2)}s</text>
            <text x="${width - 20}" y="${height - 5}" class="chart-label" text-anchor="middle">${dataLog.length}s</text>

            ${svgContent}
        </svg>
    `;}