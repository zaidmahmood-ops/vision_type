// src/services/testConfigService.js

export const DATASET_REGISTRY = {
    // Basic / English
    'english-200': { name: 'english 200', path: new URL('../assets/wordlists/english-200.json', import.meta.url).href },
    'english-1k': { name: 'english 1k', path: new URL('../assets/wordlists/english-1k.json', import.meta.url).href },
    'english-5k': { name: 'english 5k', path: new URL('../assets/wordlists/english-5k.json', import.meta.url).href },
    'english-10k': { name: 'english 10k', path: new URL('../assets/wordlists/english-10k.json', import.meta.url).href },
    'english-25k': { name: 'english 25k', path: new URL('../assets/wordlists/english-25k.json', import.meta.url).href },
    'english-45k': { name: 'english 45k', path: new URL('../assets/wordlists/english-45k.json', import.meta.url).href },
    'english-85k': { name: 'english 85k', path: new URL('../assets/wordlists/english-85k.json', import.meta.url).href },
    'english-medical': { name: 'english medical', path: new URL('../assets/wordlists/english-medical.json', import.meta.url).href },
    'english-shakespearean': { name: 'shakespearean', path: new URL('../assets/wordlists/english-shakespearean.json', import.meta.url).href },

    // Other Languages (Lowercase with 'no accents' label)
    'french-1k': { name: 'french 1k (no accents)', path: new URL('../assets/wordlists/french-1k.json', import.meta.url).href },
    'french-5k': { name: 'french 5k (no accents)', path: new URL('../assets/wordlists/french-5k.json', import.meta.url).href },
    'portuguese-1k': { name: 'portuguese 1k (no accents)', path: new URL('../assets/wordlists/portuguese-1k.json', import.meta.url).href },
    'portuguese-5k': { name: 'portuguese 5k (no accents)', path: new URL('../assets/wordlists/portuguese-5k.json', import.meta.url).href },
    'spanish-1k': { name: 'spanish 1k (no accents)', path: new URL('../assets/wordlists/spanish-1k.json', import.meta.url).href },
    'spanish-5k': { name: 'spanish 5k (no accents)', path: new URL('../assets/wordlists/spanish-5k.json', import.meta.url).href },

    // Programming & Code
    'code-c++': { name: 'c++', path: new URL('../assets/wordlists/code-c++.json', import.meta.url).href },
    'code-go': { name: 'go', path: new URL('../assets/wordlists/code-go.json', import.meta.url).href },
    'code-html-css': { name: 'html & css', path: new URL('../assets/wordlists/code-html-css.json', import.meta.url).href },
    'code-java': { name: 'java', path: new URL('../assets/wordlists/code-java.json', import.meta.url).href },
    'code-javascript': { name: 'javascript', path: new URL('../assets/wordlists/code-javascript.json', import.meta.url).href },
    'code-python': { name: 'python', path: new URL('../assets/wordlists/code-python.json', import.meta.url).href },
    'code-ruby': { name: 'ruby', path: new URL('../assets/wordlists/code-ruby.json', import.meta.url).href },
    'code-rust': { name: 'rust', path: new URL('../assets/wordlists/code-rust.json', import.meta.url).href },
    'code-sql': { name: 'sql', path: new URL('../assets/wordlists/code-sql.json', import.meta.url).href },
    'code-typescript': { name: 'typescript', path: new URL('../assets/wordlists/code-typescript.json', import.meta.url).href },

    // Gaming & Anime
    'brainrot': { name: 'brainrot', path: new URL('../assets/wordlists/brainrot.json', import.meta.url).href },
    'dbz-moves': { name: 'dbz moves', path: new URL('../assets/wordlists/dbz-moves.json', import.meta.url).href },
    'fortnite-terms': { name: 'fortnite terms', path: new URL('../assets/wordlists/fortnite-terms.json', import.meta.url).href },
    'harry-potter-spells': { name: 'harry potter spells', path: new URL('../assets/wordlists/harry-potter-spells.json', import.meta.url).href },
    'inazuma-eleven-characters': { name: 'inazuma eleven characters', path: new URL('../assets/wordlists/inazuma-eleven-characters.json', import.meta.url).href },
    'inazuma-eleven-moves': { name: 'inazuma eleven moves', path: new URL('../assets/wordlists/inazuma-eleven-moves.json', import.meta.url).href },
    'minecraft': { name: 'minecraft', path: new URL('../assets/wordlists/minecraft.json', import.meta.url).href },

    // Pokemon
    'pokemon-general-200': { name: 'pokemon 200', path: new URL('../assets/wordlists/pokemon-general-200.json', import.meta.url).href },
    'pokemon-general-1k': { name: 'pokemon 1k', path: new URL('../assets/wordlists/pokemon-general-1k.json', import.meta.url).href },
    'pokemon-red-blue-yellow': { name: 'pokemon gen 1 (red/blue/yellow)', path: new URL('../assets/wordlists/pokemon-red-blue-yellow.json', import.meta.url).href },
    'pokemon-heartgold-soulsilver': { name: 'pokemon gen 2 (heartgold/soulsilver)', path: new URL('../assets/wordlists/pokemon-heartgold-soulsilver.json', import.meta.url).href },
    'pokemon-ruby-sapphire': { name: 'pokemon gen 3 (ruby/sapphire)', path: new URL('../assets/wordlists/pokemon-ruby-sapphire.json', import.meta.url).href },
    'pokemon-diamond-pearl': { name: 'pokemon gen 4 (diamond/pearl)', path: new URL('../assets/wordlists/pokemon-diamond-pearl.json', import.meta.url).href },
    'pokemon-black-white': { name: 'pokemon gen 5 (black/white)', path: new URL('../assets/wordlists/pokemon-black-white.json', import.meta.url).href },
    'pokemon-black2-white2': { name: 'pokemon gen 5 (black 2/white 2)', path: new URL('../assets/wordlists/pokemon-black2-white2.json', import.meta.url).href },
    'pokemon-x-y': { name: 'pokemon gen 6 (x/y)', path: new URL('../assets/wordlists/pokemon-x-y.json', import.meta.url).href },
    'pokemon-omega-ruby-alphasapphire': { name: 'pokemon oras', path: new URL('../assets/wordlists/pokemon-omega-ruby-alphasapphire.json', import.meta.url).href },
    'pokemon-sun-moon': { name: 'pokemon gen 7 (sun/moon)', path: new URL('../assets/wordlists/pokemon-sun-moon.json', import.meta.url).href },
    'pokemon-sword-shield': { name: 'pokemon gen 8 (sword/shield)', path: new URL('../assets/wordlists/pokemon-sword-shield.json', import.meta.url).href },
    'pokemon-scarlet-violet': { name: 'pokemon gen 9 (scarlet/violet)', path: new URL('../assets/wordlists/pokemon-scarlet-violet.json', import.meta.url).href },

    // Yu-Gi-Oh
    'yugioh-monsters-200': { name: 'yu-gi-oh monsters 200', path: new URL('../assets/wordlists/yugioh-monsters-200.json', import.meta.url).href },
    'yugioh-monsters-500': { name: 'yu-gi-oh monsters 500', path: new URL('../assets/wordlists/yugioh-monsters-500.json', import.meta.url).href },
    'yugioh-spells-200': { name: 'yu-gi-oh spells 200', path: new URL('../assets/wordlists/yugioh-spells-200.json', import.meta.url).href },
    'yugioh-spells-1k': { name: 'yu-gi-oh spells 1k', path: new URL('../assets/wordlists/yugioh-spells-1k.json', import.meta.url).href },
    'yugioh-traps-200': { name: 'yu-gi-oh traps 200', path: new URL('../assets/wordlists/yugioh-traps-200.json', import.meta.url).href },
    'yugioh-traps-1k': { name: 'yu-gi-oh traps 1k', path: new URL('../assets/wordlists/yugioh-traps-1k.json', import.meta.url).href },

    // Science, Geography & History
    'ancient-civilizations': { name: 'ancient civilizations', path: new URL('../assets/wordlists/ancient-civilizations.json', import.meta.url).href },
    'architectural-wonders': { name: 'architectural wonders', path: new URL('../assets/wordlists/architectural-wonders.json', import.meta.url).href },
    'astronomy': { name: 'astronomy', path: new URL('../assets/wordlists/astronomy.json', import.meta.url).href },
    'cities-200': { name: 'cities 200', path: new URL('../assets/wordlists/cities-200.json', import.meta.url).href },
    'cities-1k': { name: 'cities 1k', path: new URL('../assets/wordlists/cities-1k.json', import.meta.url).href },
    'cities-5k': { name: 'cities 5k', path: new URL('../assets/wordlists/cities-5k.json', import.meta.url).href },
    'countries': { name: 'countries', path: new URL('../assets/wordlists/countries.json', import.meta.url).href },
    'empires': { name: 'empires', path: new URL('../assets/wordlists/empires.json', import.meta.url).href },
    'mountains': { name: 'mountains', path: new URL('../assets/wordlists/mountains.json', import.meta.url).href },
    'periodic-table': { name: 'periodic table', path: new URL('../assets/wordlists/periodic-table.json', import.meta.url).href },
    'philosophy': { name: 'philosophy', path: new URL('../assets/wordlists/philosophy.json', import.meta.url).href },
    'psychology-and-cognitive': { name: 'psychology & cognitive science', path: new URL('../assets/wordlists/psychology-and-cognitive.json', import.meta.url).href },
    'rivers': { name: 'rivers', path: new URL('../assets/wordlists/rivers.json', import.meta.url).href },

    // Numbers & Digits
    'digits-1k': { name: 'digits 1k', path: new URL('../assets/wordlists/digits-1k.json', import.meta.url).href },
    'digits-5k': { name: 'digits 5k', path: new URL('../assets/wordlists/digits-5k.json', import.meta.url).href },
    'digits-10k': { name: 'digits 10k', path: new URL('../assets/wordlists/digits-10k.json', import.meta.url).href },
    'numbers-text-200': { name: 'number words 200', path: new URL('../assets/wordlists/numbers-text-200.json', import.meta.url).href },
    'numbers-text-1k': { name: 'number words 1k', path: new URL('../assets/wordlists/numbers-text-1k.json', import.meta.url).href },
    'numbers-text-5k': { name: 'number words 5k', path: new URL('../assets/wordlists/numbers-text-5k.json', import.meta.url).href },
    'numbers-text-10k': { name: 'number words 10k', path: new URL('../assets/wordlists/numbers-text-10k.json', import.meta.url).href },

    // Miscellaneous & Sports
    'board-games': { name: 'board games', path: new URL('../assets/wordlists/board-games.json', import.meta.url).href },
    'chess-terms': { name: 'chess terms', path: new URL('../assets/wordlists/chess-terms.json', import.meta.url).href },
    'color-names': { name: 'color names', path: new URL('../assets/wordlists/color-names.json', import.meta.url).href },
    'commonly-misspelled': { name: 'commonly misspelled words', path: new URL('../assets/wordlists/commonly-misspelled.json', import.meta.url).href },
    'contronyms': { name: 'contronyms', path: new URL('../assets/wordlists/contronyms.json', import.meta.url).href },
    'cooking-dishes': { name: 'cooking & dishes', path: new URL('../assets/wordlists/cooking-dishes.json', import.meta.url).href },
    'double-letter-words': { name: 'double-letter words', path: new URL('../assets/wordlists/double-letter-words.json', import.meta.url).href },
    'football-players': { name: 'football players', path: new URL('../assets/wordlists/football-players.json', import.meta.url).href },
    'football-teams': { name: 'football teams', path: new URL('../assets/wordlists/football-teams.json', import.meta.url).href },
    'items-1k': { name: 'items 1k', path: new URL('../assets/wordlists/items-1k.json', import.meta.url).href },
    'items-5k': { name: 'items 5k', path: new URL('../assets/wordlists/items-5k.json', import.meta.url).href },
    'left-hand-words': { name: 'left-hand only words', path: new URL('../assets/wordlists/left-hand-words.json', import.meta.url).href },
    'right-hand-words': { name: 'right-hand only words', path: new URL('../assets/wordlists/right-hand-words.json', import.meta.url).href },
    'martial-arts-styles': { name: 'martial arts styles', path: new URL('../assets/wordlists/martial-arts-styles.json', import.meta.url).href },
    'sports': { name: 'sports', path: new URL('../assets/wordlists/sports.json', import.meta.url).href }
};

// In-memory cache object
const datasetCache = {};

/**
 * Fetch dataset dynamically with in-memory caching
 */
export async function getWordlist(key = 'english-200') {
    // Return from RAM if previously downloaded during this tab session
    if (datasetCache[key]) {
        return datasetCache[key];
    }

    const config = DATASET_REGISTRY[key] || DATASET_REGISTRY['english-200'];

    try {
        const response = await fetch(config.path);
        if (!response.ok) throw new Error(`HTTP ${response.status} when loading ${config.path}`);
        
        const words = await response.json();
        datasetCache[key] = words;
        return words;
    } catch (error) {
        console.error(`Failed to load dataset [${key}]:`, error);
        return [];
    }
}