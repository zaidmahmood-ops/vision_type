// src/services/testConfigService.js

export const DATASET_REGISTRY = {
    // Basic / English
    'english-200': { name: 'english 200', path: '/src/assets/wordlists/english-200.json' },
    'english-1k': { name: 'english 1k', path: '/src/assets/wordlists/english-1k.json' },
    'english-5k': { name: 'english 5k', path: '/src/assets/wordlists/english-5k.json' },
    'english-10k': { name: 'english 10k', path: '/src/assets/wordlists/english-10k.json' },
    'english-25k': { name: 'english 25k', path: '/src/assets/wordlists/english-25k.json' },
    'english-45k': { name: 'english 45k', path: '/src/assets/wordlists/english-45k.json' },
    'english-85k': { name: 'english 85k', path: '/src/assets/wordlists/english-85k.json' },
    'english-medical': { name: 'english medical', path: '/src/assets/wordlists/english-medical.json' },
    'english-shakespearean': { name: 'shakespearean', path: '/src/assets/wordlists/english-shakespearean.json' },

    // Other Languages (Lowercase with 'no accents' label)
    'french-1k': { name: 'french 1k (no accents)', path: '/src/assets/wordlists/french-1k.json' },
    'french-5k': { name: 'french 5k (no accents)', path: '/src/assets/wordlists/french-5k.json' },
    'portuguese-1k': { name: 'portuguese 1k (no accents)', path: '/src/assets/wordlists/portuguese-1k.json' },
    'portuguese-5k': { name: 'portuguese 5k (no accents)', path: '/src/assets/wordlists/portuguese-5k.json' },
    'spanish-1k': { name: 'spanish 1k (no accents)', path: '/src/assets/wordlists/spanish-1k.json' },
    'spanish-5k': { name: 'spanish 5k (no accents)', path: '/src/assets/wordlists/spanish-5k.json' },

    // Programming & Code
    'code-c++': { name: 'c++', path: '/src/assets/wordlists/code-c++.json' },
    'code-go': { name: 'go', path: '/src/assets/wordlists/code-go.json' },
    'code-html-css': { name: 'html & css', path: '/src/assets/wordlists/code-html-css.json' },
    'code-java': { name: 'java', path: '/src/assets/wordlists/code-java.json' },
    'code-javascript': { name: 'javascript', path: '/src/assets/wordlists/code-javascript.json' },
    'code-python': { name: 'python', path: '/src/assets/wordlists/code-python.json' },
    'code-ruby': { name: 'ruby', path: '/src/assets/wordlists/code-ruby.json' },
    'code-rust': { name: 'rust', path: '/src/assets/wordlists/code-rust.json' },
    'code-sql': { name: 'sql', path: '/src/assets/wordlists/code-sql.json' },
    'code-typescript': { name: 'typescript', path: '/src/assets/wordlists/code-typescript.json' },

    // Gaming & Anime
    'brainrot': { name: 'brainrot', path: '/src/assets/wordlists/brainrot.json' },
    'dbz-moves': { name: 'dbz moves', path: '/src/assets/wordlists/dbz-moves.json' },
    'fortnite-terms': { name: 'fortnite terms', path: '/src/assets/wordlists/fortnite-terms.json' },
    'harry-potter-spells': { name: 'harry potter spells', path: '/src/assets/wordlists/harry-potter-spells.json' },
    'inazuma-eleven-characters': { name: 'inazuma eleven characters', path: '/src/assets/wordlists/inazuma-eleven-characters.json' },
    'inazuma-eleven-moves': { name: 'inazuma eleven moves', path: '/src/assets/wordlists/inazuma-eleven-moves.json' },
    'minecraft': { name: 'minecraft', path: '/src/assets/wordlists/minecraft.json' },

    // Pokemon
    'pokemon-general-200': { name: 'pokemon 200', path: '/src/assets/wordlists/pokemon-general-200.json' },
    'pokemon-general-1k': { name: 'pokemon 1k', path: '/src/assets/wordlists/pokemon-general-1k.json' },
    'pokemon-red-blue-yellow': { name: 'pokemon gen 1 (red/blue/yellow)', path: '/src/assets/wordlists/pokemon-red-blue-yellow.json' },
    'pokemon-heartgold-soulsilver': { name: 'pokemon gen 2 (heartgold/soulsilver)', path: '/src/assets/wordlists/pokemon-heartgold-soulsilver.json' },
    'pokemon-ruby-sapphire': { name: 'pokemon gen 3 (ruby/sapphire)', path: '/src/assets/wordlists/pokemon-ruby-sapphire.json' },
    'pokemon-diamond-pearl': { name: 'pokemon gen 4 (diamond/pearl)', path: '/src/assets/wordlists/pokemon-diamond-pearl.json' },
    'pokemon-black-white': { name: 'pokemon gen 5 (black/white)', path: '/src/assets/wordlists/pokemon-black-white.json' },
    'pokemon-black2-white2': { name: 'pokemon gen 5 (black 2/white 2)', path: '/src/assets/wordlists/pokemon-black2-white2.json' },
    'pokemon-x-y': { name: 'pokemon gen 6 (x/y)', path: '/src/assets/wordlists/pokemon-x-y.json' },
    'pokemon-omega-ruby-alphasapphire': { name: 'pokemon oras', path: '/src/assets/wordlists/pokemon-omega-ruby-alphasapphire.json' },
    'pokemon-sun-moon': { name: 'pokemon gen 7 (sun/moon)', path: '/src/assets/wordlists/pokemon-sun-moon.json' },
    'pokemon-sword-shield': { name: 'pokemon gen 8 (sword/shield)', path: '/src/assets/wordlists/pokemon-sword-shield.json' },
    'pokemon-scarlet-violet': { name: 'pokemon gen 9 (scarlet/violet)', path: '/src/assets/wordlists/pokemon-scarlet-violet.json' },

    // Yu-Gi-Oh
    'yugioh-monsters-200': { name: 'yu-gi-oh monsters 200', path: '/src/assets/wordlists/yugioh-monsters-200.json' },
    'yugioh-monsters-500': { name: 'yu-gi-oh monsters 500', path: '/src/assets/wordlists/yugioh-monsters-500.json' },
    'yugioh-spells-200': { name: 'yu-gi-oh spells 200', path: '/src/assets/wordlists/yugioh-spells-200.json' },
    'yugioh-spells-1k': { name: 'yu-gi-oh spells 1k', path: '/src/assets/wordlists/yugioh-spells-1k.json' },
    'yugioh-traps-200': { name: 'yu-gi-oh traps 200', path: '/src/assets/wordlists/yugioh-traps-200.json' },
    'yugioh-traps-1k': { name: 'yu-gi-oh traps 1k', path: '/src/assets/wordlists/yugioh-traps-1k.json' },

    // Science, Geography & History
    'ancient-civilizations': { name: 'ancient civilizations', path: '/src/assets/wordlists/ancient-civilizations.json' },
    'architectural-wonders': { name: 'architectural wonders', path: '/src/assets/wordlists/architectural-wonders.json' },
    'astronomy': { name: 'astronomy', path: '/src/assets/wordlists/astronomy.json' },
    'cities-200': { name: 'cities 200', path: '/src/assets/wordlists/cities-200.json' },
    'cities-1k': { name: 'cities 1k', path: '/src/assets/wordlists/cities-1k.json' },
    'cities-5k': { name: 'cities 5k', path: '/src/assets/wordlists/cities-5k.json' },
    'countries': { name: 'countries', path: '/src/assets/wordlists/countries.json' },
    'empires': { name: 'empires', path: '/src/assets/wordlists/empires.json' },
    'mountains': { name: 'mountains', path: '/src/assets/wordlists/mountains.json' },
    'periodic-table': { name: 'periodic table', path: '/src/assets/wordlists/periodic-table.json' },
    'philosophy': { name: 'philosophy', path: '/src/assets/wordlists/philosophy.json' },
    'psychology-and-cognitive': { name: 'psychology & cognitive science', path: '/src/assets/wordlists/psychology-and-cognitive.json' },
    'rivers': { name: 'rivers', path: '/src/assets/wordlists/rivers.json' },

    // Numbers & Digits
    'digits-1k': { name: 'digits 1k', path: '/src/assets/wordlists/digits-1k.json' },
    'digits-5k': { name: 'digits 5k', path: '/src/assets/wordlists/digits-5k.json' },
    'digits-10k': { name: 'digits 10k', path: '/src/assets/wordlists/digits-10k.json' },
    'numbers-text-200': { name: 'number words 200', path: '/src/assets/wordlists/numbers-text-200.json' },
    'numbers-text-1k': { name: 'number words 1k', path: '/src/assets/wordlists/numbers-text-1k.json' },
    'numbers-text-5k': { name: 'number words 5k', path: '/src/assets/wordlists/numbers-text-5k.json' },
    'numbers-text-10k': { name: 'number words 10k', path: '/src/assets/wordlists/numbers-text-10k.json' },

    // Miscellaneous & Sports
    'board-games': { name: 'board games', path: '/src/assets/wordlists/board-games.json' },
    'chess-terms': { name: 'chess terms', path: '/src/assets/wordlists/chess-terms.json' },
    'color-names': { name: 'color names', path: '/src/assets/wordlists/color-names.json' },
    'commonly-misspelled': { name: 'commonly misspelled words', path: '/src/assets/wordlists/commonly-misspelled.json' },
    'contronyms': { name: 'contronyms', path: '/src/assets/wordlists/contronyms.json' },
    'cooking-dishes': { name: 'cooking & dishes', path: '/src/assets/wordlists/cooking-dishes.json' },
    'double-letter-words': { name: 'double-letter words', path: '/src/assets/wordlists/double-letter-words.json' },
    'football-players': { name: 'football players', path: '/src/assets/wordlists/football-players.json' },
    'football-teams': { name: 'football teams', path: '/src/assets/wordlists/football-teams.json' },
    'items-1k': { name: 'items 1k', path: '/src/assets/wordlists/items-1k.json' },
    'items-5k': { name: 'items 5k', path: '/src/assets/wordlists/items-5k.json' },
    'left-hand-words': { name: 'left-hand only words', path: '/src/assets/wordlists/left-hand-words.json' },
    'right-hand-words': { name: 'right-hand only words', path: '/src/assets/wordlists/right-hand-words.json' },
    'martial-arts-styles': { name: 'martial arts styles', path: '/src/assets/wordlists/martial-arts-styles.json' },
    'sports': { name: 'sports', path: '/src/assets/wordlists/sports.json' }
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