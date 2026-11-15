export function renderSettings() {
  return `
    <div class="settings-container">
      
      <!-- Top Settings Sub-Navigation Bar -->
      <div class="settings-nav-bar">
        <a href="#behavior">behavior</a>
        <a href="#input">input</a>
        <a href="#sound">sound</a>
        <a href="#caret">caret</a>
        <a href="#appearance">appearance</a>
        <a href="#theme">theme</a>
      </div>

      <!-- Search Settings Bar -->
      <div class="settings-search-wrapper">
        <input type="text" id="settings-search" placeholder="🔍 search settings" />
      </div>

      <div class="settings-content">

        <!-- ================= BEHAVIOR SECTION ================= -->
        <section id="behavior">
          <h2 class="section-title">⌄ behavior</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">tags</div>
              <div class="setting-desc">With tags, you can compare how fast you're typing in different situations.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn action-btn">add tag</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">presets</div>
              <div class="setting-desc">Create settings presets that can be applied with one click.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn action-btn">add preset</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">result saving</div>
              <div class="setting-desc">Set this setting to "off" in case you want to practice without saving new results.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn">off</button>
              <button class="setting-btn active">on</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">difficulty</div>
              <div class="setting-desc">Normal is classic. Expert fails on incorrect word. Master requires 100% accuracy.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">normal</button>
              <button class="setting-btn">expert</button>
              <button class="setting-btn">master</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">quick restart</div>
              <div class="setting-desc">Press tab, esc or enter to quickly restart the test.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">esc</button>
              <button class="setting-btn">tab</button>
              <button class="setting-btn">enter</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">repeat quotes</div>
              <div class="setting-desc">Changing to 'typing' will repeat the quote if you restart while typing.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">typing</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">blind mode</div>
              <div class="setting-desc">No errors or incorrect words are highlighted.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
            </div>
          </div>
        </section>

        <!-- ================= INPUT SECTION ================= -->
        <section id="input">
          <h2 class="section-title">⌄ input</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">freedom mode</div>
              <div class="setting-desc">Allows you to delete any word, even if it was typed correctly.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">strict space</div>
              <div class="setting-desc">Pressing space at the beginning of a word will insert a space character.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">opposite shift mode</div>
              <div class="setting-desc">Force you to use opposite shift keys for shifting.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
              <button class="setting-btn">keymap</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">stop on error</div>
              <div class="setting-desc">Stop input when pressing incorrect letters.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">word</button>
              <button class="setting-btn">letter</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">delete on error</div>
              <div class="setting-desc">Letter mode will automatically delete incorrect characters.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">letter</button>
              <button class="setting-btn">letter hard</button>
              <button class="setting-btn">word</button>
              <button class="setting-btn">word hard</button>
            </div>
          </div>
        </section>

        <!-- ================= SOUND SECTION ================= -->
        <section id="sound">
          <h2 class="section-title">⌄ sound</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">sound volume</div>
              <div class="setting-desc">Change the volume of the sound effects.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">0.5</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">play sound on click</div>
              <div class="setting-desc">Plays a short sound when you press a key.</div>
            </div>
            <div class="button-group sound-grid">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">click</button>
              <button class="setting-btn">beep</button>
              <button class="setting-btn">pop</button>
              <button class="setting-btn">nk creams</button>
              <button class="setting-btn">typewriter</button>
              <button class="setting-btn">osu</button>
              <button class="setting-btn">hitmarker</button>
              <button class="setting-btn">sine</button>
              <button class="setting-btn">sawtooth</button>
              <button class="setting-btn">square</button>
              <button class="setting-btn">triangle</button>
              <button class="setting-btn">cherrymx blue abs</button>
              <button class="setting-btn">cherrymx brown pbt</button>
              <button class="setting-btn">razer green</button>
              <button class="setting-btn">tealios v2</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">play sound on error</div>
              <div class="setting-desc">Plays a short sound if you press an incorrect key.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">damage</button>
              <button class="setting-btn">triangle</button>
              <button class="setting-btn">square</button>
              <button class="setting-btn">missed punch</button>
            </div>
          </div>
        </section>

        <!-- ================= CARET SECTION ================= -->
        <section id="caret">
          <h2 class="section-title">⌄ caret</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">smooth caret</div>
              <div class="setting-desc">The caret will move smoothly between letters and words.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn">off</button>
              <button class="setting-btn">slow</button>
              <button class="setting-btn active">medium</button>
              <button class="setting-btn">fast</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">caret style</div>
              <div class="setting-desc">Change the style of the caret during the test.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn">off</button>
              <button class="setting-btn active">default</button>
              <button class="setting-btn">block</button>
              <button class="setting-btn">outline</button>
              <button class="setting-btn">underline</button>
            </div>
          </div>
        </section>

        <!-- ================= APPEARANCE SECTION ================= -->
        <section id="appearance">
          <h2 class="section-title">⌄ appearance</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">live progress style</div>
              <div class="setting-desc">Change the style of the timer/word count during a test.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn">off</button>
              <button class="setting-btn">bar</button>
              <button class="setting-btn">text</button>
              <button class="setting-btn active">mini</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">highlight mode</div>
              <div class="setting-desc">Change what is highlighted during the test.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn">off</button>
              <button class="setting-btn active">letter</button>
              <button class="setting-btn">word</button>
              <button class="setting-btn">next word</button>
            </div>
          </div>
        </section>

        <!-- ================= THEME SECTION ================= -->
        <section id="theme">
          <h2 class="section-title">⌄ theme</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">flip test colors</div>
              <div class="setting-desc">By default, typed text is brighter than future text.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">colorful mode</div>
              <div class="setting-desc">Test words will use the main color instead of text color.</div>
            </div>
            <div class="button-group">
              <button class="setting-btn active">off</button>
              <button class="setting-btn">on</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  `;
}