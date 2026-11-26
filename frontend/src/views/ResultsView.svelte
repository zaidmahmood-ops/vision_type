<script>
  let { stats, onRestart } = $props();

  let chartType = $state('line');

  const testTypeLabel = $derived(
    `${stats.testMode} · ${stats.testLimit === 0 ? 'infinite' : stats.testLimit}`
  );
  const datasetLabel = $derived(stats.datasetName);

  const width = 460;
  const height = 180;
  const paddingLeft = 40;
  const paddingBottom = 25;
  const chartWidth = width - paddingLeft - 20;
  const chartHeight = height - paddingBottom - 20;

  const dataLog = $derived(stats.perSecondWpmLog || []);
  const maxVal = $derived(Math.max(...dataLog, 60));
  const minVal = 0;
  const midVal = $derived(Math.round(maxVal / 2));
  const yMidPos = 20 + chartHeight / 2;

  const points = $derived(
    dataLog.map((val, index) => {
      const x =
        paddingLeft +
        (index / Math.max(dataLog.length - 1, 1)) * chartWidth;
      const y =
        20 + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, val };
    })
  );

  const linePath = $derived(
    points.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ''
    )
  );

  const barWidth = $derived(
    dataLog.length > 0 ? Math.max(3, chartWidth / dataLog.length - 4) : 3
  );
</script>

<div class="results-container">
  <div class="results-grid">
    <div class="parallelogram-box">
      <div class="parallelogram-inner">
        <div>
          <div class="dataset-badge">
            dataset: <span class="dataset-name">{datasetLabel}</span> ({testTypeLabel})
          </div>
          <div class="metrics-primary-row">
            <div>
              <div class="metric-label">wpm</div>
              <div class="metric-value-wpm">{stats.wpm}</div>
            </div>
            <div>
              <div class="metric-label">acc</div>
              <div class="metric-value-acc">{stats.accuracy}%</div>
            </div>
          </div>
          <div class="secondary-metrics-grid">
            <div>
              <div class="secondary-metric-label">raw wpm</div>
              <div class="secondary-metric-value">{stats.rawWpm}</div>
            </div>
            <div>
              <div class="secondary-metric-label">consistency</div>
              <div class="secondary-metric-value">{stats.consistency}%</div>
            </div>
            <div>
              <div class="secondary-metric-label">time elapsed</div>
              <div class="secondary-metric-value">{stats.timeElapsed}s</div>
            </div>
            <div>
              <div class="secondary-metric-label" title="Correct / Incorrect / Extra / Missed">
                chars (c/i/e/m)
              </div>
              <div class="chars-value">
                <span class="char-correct">{stats.charsCorrect}</span> /
                <span class="char-incorrect">{stats.charsIncorrect}</span> /
                <span class="char-extra">{stats.charsExtra}</span> /
                <span class="char-missed">{stats.charsMissed}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="parallelogram-footer-title">Results Dashboard</div>
      </div>
    </div>

    <div class="parallelogram-box">
      <div class="parallelogram-inner">
        <div>
          <div class="chart-section-header">
            <span class="chart-title">wpm over time</span>
          </div>
          <div id="chart-viewport" class="chart-viewport">
            {#if dataLog.length === 0}
              <span class="no-data-msg">Not enough data for graph</span>
            {:else}
              <svg viewBox="0 0 {width} {height}" style="width: 100%; height: 100%; overflow: visible;">
                <line
                  x1={paddingLeft}
                  y1={20 + chartHeight}
                  x2={width - 20}
                  y2={20 + chartHeight}
                  class="chart-axis-line"
                />
                <line
                  x1={paddingLeft}
                  y1="20"
                  x2={paddingLeft}
                  y2={20 + chartHeight}
                  class="chart-axis-line"
                />

                <text x={paddingLeft - 8} y={25 + chartHeight} class="chart-label" text-anchor="end">0</text>
                <text x={paddingLeft - 8} y={yMidPos + 3} class="chart-label" text-anchor="end">{midVal}</text>
                <line
                  x1={paddingLeft}
                  y1={yMidPos}
                  x2={width - 20}
                  y2={yMidPos}
                  class="chart-grid-line"
                />

                <text x={paddingLeft - 8} y="24" class="chart-label" text-anchor="end">{maxVal}</text>
                <line
                  x1={paddingLeft}
                  y1="20"
                  x2={width - 20}
                  y2="20"
                  class="chart-grid-line"
                />

                <text x={paddingLeft} y={height - 5} class="chart-label" text-anchor="middle">0s</text>
                <text
                  x={paddingLeft + chartWidth / 2}
                  y={height - 5}
                  class="chart-label"
                  text-anchor="middle"
                >
                  {Math.round(dataLog.length / 2)}s
                </text>
                <text x={width - 20} y={height - 5} class="chart-label" text-anchor="middle">
                  {dataLog.length}s
                </text>

                {#if chartType === 'line'}
                  <path d={linePath} class="chart-line" />
                  {#each points as p}
                    <circle cx={p.x} cy={p.y} r="3" class="chart-point" />
                  {/each}
                {:else}
                  {#each points as p}
                    <rect
                      x={p.x - barWidth / 2}
                      y={p.y}
                      width={barWidth}
                      height={20 + chartHeight - p.y}
                      class="chart-bar"
                      rx="1.5"
                    />
                  {/each}
                {/if}
              </svg>
            {/if}
          </div>
        </div>

        <div class="parallelogram-footer-action">
          <button
            id="restart-test-btn"
            type="button"
            class="restart-btn"
            onclick={() => onRestart?.()}
          >
            🔄 Next Test
          </button>
          <div class="chart-toggle-group">
            <button
              id="toggle-line"
              type="button"
              class="chart-toggle-btn"
              class:active={chartType === 'line'}
              onclick={() => (chartType = 'line')}
            >
              Line
            </button>
            <button
              id="toggle-bar"
              type="button"
              class="chart-toggle-btn"
              class:active={chartType === 'bar'}
              onclick={() => (chartType = 'bar')}
            >
              Bar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>