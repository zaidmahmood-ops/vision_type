<script>
  let searchQuery = $state('');

  let settings = $state({
    resultSaving: 'on',
    difficulty: 'normal',
    quickRestart: 'off',
    repeatQuotes: 'off',
    blindMode: 'off',
    freedomMode: 'off',
    strictSpace: 'off',
    oppositeShift: 'off',
    stopOnError: 'off',
    deleteOnError: 'off',
    soundVolume: '0.5',
    soundOnClick: 'off',
    soundOnError: 'off',
    smoothCaret: 'medium',
    caretStyle: 'default',
    liveProgressStyle: 'mini',
    highlightMode: 'letter',
    flipTestColors: 'off',
    colorfulMode: 'off',
  });

  const clickSounds = [
    'off',
    'click',
    'beep',
    'pop',
    'nk creams',
    'typewriter',
    'osu',
    'hitmarker',
    'sine',
    'sawtooth',
    'square',
    'triangle',
    'cherrymx blue abs',
    'cherrymx brown pbt',
    'razer green',
    'tealios v2',
  ];

  const errorSounds = ['off', 'damage', 'triangle', 'square', 'missed punch'];

  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  function matchesSearch(title, desc) {
    if (!normalizedQuery) return true;
    return (
      title.toLowerCase().includes(normalizedQuery) ||
      desc.toLowerCase().includes(normalizedQuery)
    );
  }
</script>

<div class="settings-container">
  <div class="settings-nav-bar">
    <a href="#behavior">behavior</a>
    <a href="#input">input</a>
    <a href="#sound">sound</a>
    <a href="#caret">caret</a>
    <a href="#appearance">appearance</a>
    <a href="#theme">theme</a>
  </div>

  <div class="settings-search-wrapper">
    <input
      type="text"
      id="settings-search"
      placeholder="🔍 search settings"
      bind:value={searchQuery}
    />
  </div>

  <div class="settings-content">
    <!-- BEHAVIOR SECTION -->
    <section id="behavior">
      <h2 class="section-title">⌄ behavior</h2>

      {#if matchesSearch('tags', "With tags, you can compare how fast you're typing in different situations.")}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">tags</div>
            <div class="setting-desc">With tags, you can compare how fast you're typing in different situations.</div>
          </div>
          <div class="button-group">
            <button type="button" class="setting-btn action-btn">add tag</button>
          </div>
        </div>
      {/if}

      {#if matchesSearch('presets', 'Create settings presets that can be applied with one click.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">presets</div>
            <div class="setting-desc">Create settings presets that can be applied with one click.</div>
          </div>
          <div class="button-group">
            <button type="button" class="setting-btn action-btn">add preset</button>
          </div>
        </div>
      {/if}

      {#if matchesSearch('result saving', 'Set this setting to "off" in case you want to practice without saving new results.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">result saving</div>
            <div class="setting-desc">Set this setting to "off" in case you want to practice without saving new results.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.resultSaving === opt}
                onclick={() => (settings.resultSaving = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('difficulty', 'Normal is classic. Expert fails on incorrect word. Master requires 100% accuracy.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">difficulty</div>
            <div class="setting-desc">Normal is classic. Expert fails on incorrect word. Master requires 100% accuracy.</div>
          </div>
          <div class="button-group">
            {#each ['normal', 'expert', 'master'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.difficulty === opt}
                onclick={() => (settings.difficulty = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('quick restart', 'Press tab, esc or enter to quickly restart the test.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">quick restart</div>
            <div class="setting-desc">Press tab, esc or enter to quickly restart the test.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'esc', 'tab', 'enter'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.quickRestart === opt}
                onclick={() => (settings.quickRestart = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('repeat quotes', "Changing to 'typing' will repeat the quote if you restart while typing.")}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">repeat quotes</div>
            <div class="setting-desc">Changing to 'typing' will repeat the quote if you restart while typing.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'typing'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.repeatQuotes === opt}
                onclick={() => (settings.repeatQuotes = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('blind mode', 'No errors or incorrect words are highlighted.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">blind mode</div>
            <div class="setting-desc">No errors or incorrect words are highlighted.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.blindMode === opt}
                onclick={() => (settings.blindMode = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- INPUT SECTION -->
    <section id="input">
      <h2 class="section-title">⌄ input</h2>

      {#if matchesSearch('freedom mode', 'Allows you to delete any word, even if it was typed correctly.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">freedom mode</div>
            <div class="setting-desc">Allows you to delete any word, even if it was typed correctly.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.freedomMode === opt}
                onclick={() => (settings.freedomMode = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('strict space', 'Pressing space at the beginning of a word will insert a space character.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">strict space</div>
            <div class="setting-desc">Pressing space at the beginning of a word will insert a space character.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.strictSpace === opt}
                onclick={() => (settings.strictSpace = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('opposite shift mode', 'Force you to use opposite shift keys for shifting.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">opposite shift mode</div>
            <div class="setting-desc">Force you to use opposite shift keys for shifting.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on', 'keymap'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.oppositeShift === opt}
                onclick={() => (settings.oppositeShift = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('stop on error', 'Stop input when pressing incorrect letters.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">stop on error</div>
            <div class="setting-desc">Stop input when pressing incorrect letters.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'word', 'letter'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.stopOnError === opt}
                onclick={() => (settings.stopOnError = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('delete on error', 'Letter mode will automatically delete incorrect characters.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">delete on error</div>
            <div class="setting-desc">Letter mode will automatically delete incorrect characters.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'letter', 'letter hard', 'word', 'word hard'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.deleteOnError === opt}
                onclick={() => (settings.deleteOnError = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- SOUND SECTION -->
    <section id="sound">
      <h2 class="section-title">⌄ sound</h2>

      {#if matchesSearch('sound volume', 'Change the volume of the sound effects.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">sound volume</div>
            <div class="setting-desc">Change the volume of the sound effects.</div>
          </div>
          <div class="button-group">
            <button type="button" class="setting-btn active">{settings.soundVolume}</button>
          </div>
        </div>
      {/if}

      {#if matchesSearch('play sound on click', 'Plays a short sound when you press a key.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">play sound on click</div>
            <div class="setting-desc">Plays a short sound when you press a key.</div>
          </div>
          <div class="button-group sound-grid">
            {#each clickSounds as sound}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.soundOnClick === sound}
                onclick={() => (settings.soundOnClick = sound)}
              >
                {sound}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('play sound on error', 'Plays a short sound if you press an incorrect key.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">play sound on error</div>
            <div class="setting-desc">Plays a short sound if you press an incorrect key.</div>
          </div>
          <div class="button-group">
            {#each errorSounds as sound}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.soundOnError === sound}
                onclick={() => (settings.soundOnError = sound)}
              >
                {sound}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- CARET SECTION -->
    <section id="caret">
      <h2 class="section-title">⌄ caret</h2>

      {#if matchesSearch('smooth caret', 'The caret will move smoothly between letters and words.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">smooth caret</div>
            <div class="setting-desc">The caret will move smoothly between letters and words.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'slow', 'medium', 'fast'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.smoothCaret === opt}
                onclick={() => (settings.smoothCaret = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('caret style', 'Change the style of the caret during the test.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">caret style</div>
            <div class="setting-desc">Change the style of the caret during the test.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'default', 'block', 'outline', 'underline'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.caretStyle === opt}
                onclick={() => (settings.caretStyle = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- APPEARANCE SECTION -->
    <section id="appearance">
      <h2 class="section-title">⌄ appearance</h2>

      {#if matchesSearch('live progress style', 'Change the style of the timer/word count during a test.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">live progress style</div>
            <div class="setting-desc">Change the style of the timer/word count during a test.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'bar', 'text', 'mini'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.liveProgressStyle === opt}
                onclick={() => (settings.liveProgressStyle = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('highlight mode', 'Change what is highlighted during the test.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">highlight mode</div>
            <div class="setting-desc">Change what is highlighted during the test.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'letter', 'word', 'next word'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.highlightMode === opt}
                onclick={() => (settings.highlightMode = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- THEME SECTION -->
    <section id="theme">
      <h2 class="section-title">⌄ theme</h2>

      {#if matchesSearch('flip test colors', 'By default, typed text is brighter than future text.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">flip test colors</div>
            <div class="setting-desc">By default, typed text is brighter than future text.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.flipTestColors === opt}
                onclick={() => (settings.flipTestColors = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if matchesSearch('colorful mode', 'Test words will use the main color instead of text color.')}
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">colorful mode</div>
            <div class="setting-desc">Test words will use the main color instead of text color.</div>
          </div>
          <div class="button-group">
            {#each ['off', 'on'] as opt}
              <button
                type="button"
                class="setting-btn"
                class:active={settings.colorfulMode === opt}
                onclick={() => (settings.colorfulMode = opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </div>
</div>