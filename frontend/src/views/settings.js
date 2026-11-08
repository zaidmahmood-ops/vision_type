export function renderSettings() {
  return `
    <div class="card settings-card">
      <h2>Settings ⚙</h2>
      <form id="settings-form">
        <div class="setting-group">
          <label for="word-count-select">Word Count</label>
          <select id="word-count-select">
            <option value="25">25 Words</option>
            <option value="50">50 Words</option>
            <option value="100" selected>100 Words</option>
          </select>
        </div>
        <div class="setting-group">
          <label for="theme-select">Theme</label>
          <select id="theme-select">
            <option value="synthwave" selected>Synthwave</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="monokai">Monokai</option>
          </select>
        </div>
      </form>
    </div>
  `;
}