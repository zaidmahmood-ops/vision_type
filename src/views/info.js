export function renderInfo() {
  return `
    <div class="info-container">

  <section class="info-section">
    <h2>About</h2>
    <p>
      VisionType is a high-performance, modular typing platform built for speed, precision, and deep customization. 
      It features over 60 diverse wordsets—including multi-language text, code snippets, Pokémon categories, and anime 
      references—alongside a persistent account system, flexible intervals, and unique custom themes. VisionType 
      emulates natural keyboard typing with unobtrusive prompts and real-time in-place feedback on typos, speed, and accuracy, 
      all powered by a custom SVG analytics engine and interactive performance charts. Challenge yourself across various 
      modes, track your progress, and elevate your typing speed.
    </p>
  </section>

  <section class="info-section">
    <h2>Word Sets</h2>
    <p>
      While tests default to common English vocabulary (200 or 1,000 words), VisionType features 60+ distinct word sets. 
      Explore specialized themes like code, Pokémon, anime, history, or accent-free multi-language sets directly within 
      the typing test selection modal.
    </p>
  </section>

  <section class="info-section">
    <h2>Results Screen</h2>
    <p>
      Complete a test to unlock a rich visual performance summary. Your dashboard highlights core metrics—WPM, raw speed, 
      accuracy, and character stats—alongside custom SVG analytics that display your real-time performance curve. Toggle 
      between interactive Line and Bar charts to inspect your rhythm second-by-second. The primary WPM line calculates 
      your cumulative average across the test duration, while raw WPM reflects your exact momentary typing velocity.
    </p>
  </section>

  <section class="info-section">
    <h2>Multiplayer & Ghost Racing</h2>
    <p>
      VisionType unifies live multiplayer and historical emulation into a single competitive suite. Bidirectional WebSockets 
      power real-time, two-way races against active opponents, while integrated ghost racing draws upon recorded personal 
      best logs to project precise performance benchmarks onto your screen. Race live opponents or challenge digital shadows 
      of past achievements without friction.
    </p>
  </section>

  <section class="info-section privacy-policy">
    <h2>VisionType Privacy Policy</h2>
    
    <h3>Introduction</h3>
    <p>
      VisionType is committed to protecting your personal privacy and ensuring a secure typing environment. This policy 
      outlines what information we collect, how we use it, and how we protect your data across our platform, keeping things 
      transparent and straightforward.
    </p>

    <h3>Information We Collect</h3>
    <ul>
      <li>
        <strong>Account Credentials:</strong> When you register for an account, we collect your chosen username, email address, 
        and a cryptographically hashed version of your password. Your password is securely hashed using modern algorithms, 
        meaning we never store or see your plaintext password.
      </li>
      <li>
        <strong>Typing Telemetry and Performance Data:</strong> When you complete typing tests, we record metrics such as your 
        words per minute, raw speed, accuracy, character statistics, and test configurations. This data powers your personal 
        profile history, analytics graphs, and global leaderboard rankings.
      </li>
      <li>
        <strong>Multiplayer and Connection Logs:</strong> During live PvP matches or ghost racing sessions, we process real-time 
        telemetry data streams necessary to synchronize progress between participants. These logs are used solely for the 
        duration of the match or saved as historical ghost runs.
      </li>
    </ul>

    <h3>How We Use Your Data</h3>
    <p>Your information is utilized strictly to deliver, maintain, and improve the VisionType experience. Specifically, we use your data to:</p>
    <ul>
      <li>Authenticate your secure login sessions and protect your account.</li>
      <li>Track your personal bests across different word sets, languages, and test modes.</li>
      <li>Calculate and display global leaderboards.</li>
      <li>Facilitate live PvP matchmaking and ghost replay playback.</li>
    </ul>

    <h3>Data Security</h3>
    <p>
      We implement robust technical safeguards, including secure session management and salted password hashing, to protect 
      your personal information against unauthorized access, alteration, disclosure, or destruction. We do not sell, trade, 
      rent, or distribute your personal data to third parties for advertising or commercial purposes.
    </p>

    <h3>Data Retention and User Control</h3>
    <p>
      Your typing statistics and profile information remain stored securely for as long as your account is active. You retain 
      full ownership and control over your data. Future updates will include direct self-service options to update your profile, 
      clear specific test history, or request complete deletion of your account and associated records.
    </p>

    <h3>Policy Updates</h3>
    <p>
      We may occasionally update this Privacy Policy to reflect new platform features, such as expanded multiplayer capabilities 
      or security enhancements. Any revisions will be published directly within this section of the application.
    </p>
  </section>

</div>
  `;
}