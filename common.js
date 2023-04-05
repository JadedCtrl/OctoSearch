// Saves a search-group of the given `name`, containing all search-engines of
// `preset` (which is an array of search-engine display-names truncated to 7 chars).
function savePreset(preset, name) {
    let presets = Array();
    let presetName = name.replace(',', ' ');
    try { presets = localStorage.getItem('presets').split(','); } catch {}

    try { localStorage.removeItem('preset_' + presetName); } catch {}

    presets = removeFromArray(removeRedundantItems(presets), presetName);
    presets.push(presetName);

    localStorage.setItem('preset_' + presetName, preset);
    localStorage.setItem('presets', presets);
}


// Load an array of all saved preset's names.
function loadPresets() {
    try { return localStorage.getItem('presets').split(','); } catch { return []; }
}
