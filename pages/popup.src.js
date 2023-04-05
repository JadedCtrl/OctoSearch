document.getElementById("searchbox").focus();

// Populates the .boxes div in popup.html with a list of available search-engines,
// adding a corresponding checkbox and label for each.
function populateEngines(engines) {
	for (engine of engines) {
		let checkbox = document.createElement("INPUT");
		checkbox.type = "checkbox";
		checkbox.setAttribute('value', 'engine ' + engine.name);
		checkbox.id = engine.name.replace(' ', '-');
		let label = document.createElement('label');
		label.appendChild(document.createTextNode(engine.name));
		document.getElementById("boxes").appendChild(checkbox);
		document.getElementById("boxes").appendChild(label);
		document.getElementById("boxes").appendChild(document.createElement("BR"));
	}

	populatePresets();
	try { enablePresetByName(localStorage.getItem('defaultPreset')); } catch {}
}


// Populate the .presets selection input (drop-down menu) with all currently-saved
// search-groups (presets).
function populatePresets() {
	let presetDropdown = document.getElementById("presets");
	let presets = loadPresets();

	while (presetDropdown.firstChild) {
		presetDropdown.removeChild(presetDropdown.lastChild);
	}

	let noPreset = document.createElement("OPTION");
	noPreset.setAttribute('value', 'noPreset');
	noPreset.innerText = '—';
	presetDropdown.appendChild(noPreset);

	for (presetName of presets) {
		let option = document.createElement("OPTION");
		option.setAttribute('value', presetName);
		option.innerText = presetName;
		presetDropdown.appendChild(option);
	}

	let newPreset = document.createElement("OPTION");
	newPreset.setAttribute('value', 'newPreset');
	newPreset.innerText = 'Create new preset…';
	presetDropdown.appendChild(newPreset);
}


// Search the input search-term on all enabled engines.
function search(tab) {
	browser.tabs.query({active: true, currentWindow: true})
		.then(() =>
			{
				for (selected of engineSelection()) {
					browser.search.search({
						query: document.getElementById("searchbox").value,
						engine: selected,
					});
				}
			}
		);
}


// Enable a preset's corresponding search engines, by the preset's name.
function enablePresetByName(name) {
	document.getElementById("presets").value = name;
	try { enablePreset(localStorage.getItem('preset_' + name)); }
	catch {}
}


// Check all search engines' check boxes by name, in a comma-delimited list.
function enablePreset(preset) {
	deselectEngines();
	for (engine of preset.split(",")) {
		let checkbox = document.getElementById(engine.replace(' ', '-'));
		checkbox.checked = true;
	}
}


// Delete the currently-selected preset.
function removeCurrentPreset() {
	let presetName = document.getElementById("presets").value;
	if (presetName == "noPreset" || presetName == "newPreset")
		return;

	try {
		let presets = localStorage.getItem('presets').split(',');
		localStorage.removeItem('preset_' + presetName);
		localStorage.setItem('presets', removeFromArray(presets, presetName));
	}
	catch {}

	deselectEngines();
	populatePresets();
	document.getElementById("presets").value = "noPreset";
}


// Search-box is also used for setting the name of new
// presets; this sets the placeholder accordingly
function searchBoxAsPresetName() {
	let textbox = document.getElementById("searchbox");
	textbox.setAttribute("placeholder", "New preset name…");
	deselectengines();
	document.getElementById("searchbox").focus();
}


// Clear the search-box, and reset the placeholder.
function resetSearchBox(clearText = false) {
	let textbox = document.getElementById("searchbox");
	textbox.setAttribute("placeholder", "Search…");
	if (clearText)
		textbox.value = '';
}


// Deselect all engines in the list.
function deselectEngines() {
	for (checkbox of document.getElementsByTagName("INPUT"))
		checkbox.checked = false;
}


// Return a list of all selected search-engines, in a comma-delimited list.
function engineSelection() {
	let selection = [];
	for (engine of document.getElementsByTagName('INPUT')) {
		if (engine.value.includes("engine") && engine.checked) selection.push(engine.value.slice(7));
	}
	return selection;
}


// Save all selected engines into a present; whether new or old.
function saveSelection() {
	let textbox = document.getElementById("searchbox");
	let selection = document.getElementById("presets").value;
	let name = selection;

	if (selection == "newPreset")
		name = textbox.value;
	savePreset(engineSelection(), name);
	// Update UI & listed presets
	resetSearchBox(true);
	populatePresets();
	enablePresetByName(name);
}


// An event handler that corrects engine-selection whenever the preset is changed.
function onPresetSelected(event) {
	let value = document.getElementById("presets").value;
	if (value != "newPreset")
		localStorage.setItem("defaultPreset", value);
	resetSearchBox();

	if (value == "noPreset")
		deselectEngines();
	else if (value == "newPreset")
		searchBoxAsPresetName();
	else
		enablePresetByName(value);
}


// Remove a specific item from the given array.
function removeFromArray(array, item) {
	return array.filter((testItem, index) =>
		{
			return testItem != item;
		});
}


// Remove all repeated items from an array.
function removeRedundantItems(array) {
	return array.filter((item, index) =>
		{
			return (array.indexOf(item) === index);
		})
}


// Populate the list of selectable search-engines.
browser.search.get().then(populateEngines);


// Watch for the user hitting RETURN and triggering a result.
document.getElementById("searchbox").addEventListener("keypress", key => {
	if (event.key == "Enter") search();
});


// Wait for a preset to be selected, so that we can change search-engine selections.
document.addEventListener("change", e => {
	if (e.target.id == "presets")
		onPresetSelected();
})


// Handle searches, as well and save/removal of search presets.
document.addEventListener("click", e => {
	if (e.target.classList.contains("search"))
		search();
	else if (e.target.classList.contains("save"))
		saveSelection();
	else if (e.target.classList.contains("remove"))
		removeCurrentPreset();
});
