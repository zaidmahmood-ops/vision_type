<script>
  import { onMount } from 'svelte';
  import { renderPvp, setupPvpEvents, cleanupPvp } from './pvp.js';

  let { username = 'Player' } = $props();
  let hostEl = $state(null);

  onMount(() => {
    if (!hostEl) return;
    hostEl.innerHTML = renderPvp();
    setupPvpEvents(hostEl);

    return () => {
      cleanupPvp();
    };
  });
</script>

<div class="pvp-svelte-host" data-username={username} bind:this={hostEl}></div>