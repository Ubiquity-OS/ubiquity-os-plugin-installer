import { ManifestCache, ManifestPreDecode, Plugin } from "../../types/plugins";
import { createElement } from "../../utils/element-helpers";
import { getManifestCache } from "../../utils/storage";
import { STRINGS, extractPluginIdentifier } from "../../utils/strings";
import { ManifestRenderer } from "../render-manifest";
import { renderConfigEditor } from "./config-editor";
import { controlButtons } from "./control-buttons";
import { closeAllSelect, updateGuiTitle } from "./utils";

/**
 * Renders a dropdown of plugins taken from the marketplace with an installed indicator.
 * The user can select a plugin and it will render the configuration editor for that plugin.
 */
export function renderPluginSelector(renderer: ManifestRenderer): void {
  renderer.currentStep = "pluginSelector";
  renderer.backButton.style.display = "block";
  renderer.manifestGuiBody.innerHTML = null;
  controlButtons({ hide: true });

  const manifestCache = getManifestCache();
  const pluginUrls = Object.keys(manifestCache);

  const pickerRow = document.createElement("tr");
  const pickerCell = document.createElement("td");
  pickerCell.colSpan = 2;
  pickerCell.className = STRINGS.TDV_CENTERED;

  const userConfig = renderer.configParser.repoConfig;
  let installedPlugins: Plugin[] = [];

  if (userConfig) {
    installedPlugins = renderer.configParser.parseConfig(userConfig).plugins;
  }

  const cleanManifestCache = Object.keys(manifestCache).reduce((acc, key) => {
    if (manifestCache[key]?.name) {
      acc[key] = manifestCache[key];
    }
    return acc;
  }, {} as ManifestCache);

  const customSelect = createElement("div", { class: "custom-select" });

  const selectSelected = createElement("div", {
    class: "select-selected",
    textContent: "Select a plugin",
  });

  const selectItems = createElement("div", {
    class: "select-items select-hide",
  });

  customSelect.appendChild(selectSelected);
  customSelect.appendChild(selectItems);

  pickerCell.appendChild(customSelect);
  pickerRow.appendChild(pickerCell);

  renderer.manifestGuiBody.appendChild(pickerRow);

  pluginUrls.forEach((url) => {
    if (!cleanManifestCache[url]?.name) {
      return;
    }

    const manifestPluginId = extractPluginIdentifier(url);

    // Check if plugin is installed by looking for any URL that matches
    const installedPlugin: Plugin | undefined = installedPlugins.find((plugin) => {
      const installedUrl = plugin.uses[0].plugin;

      // If the installed plugin is a GitHub URL, extract its identifier
      const installedPluginId = extractPluginIdentifier(installedUrl);

      // If both are GitHub URLs, compare the repo names
      const isBothGithubUrls = url.includes("github") && installedUrl.includes("github");
      if (isBothGithubUrls) {
        return manifestPluginId === installedPluginId;
      }

      // Otherwise check if the installed URL contains the repo name
      return installedUrl.toLowerCase().includes(manifestPluginId.toLowerCase());
    });

    const defaultForInstalled: ManifestPreDecode | null = cleanManifestCache[url];
    const optionText = defaultForInstalled.name;
    const indicator = installedPlugin ? "🟢" : "🔴";

    const optionDiv = createElement("div", { class: "select-option" });
    const textSpan = createElement("span", { textContent: optionText });
    const indicatorSpan = createElement("span", { textContent: indicator });

    optionDiv.appendChild(textSpan);
    optionDiv.appendChild(indicatorSpan);

    optionDiv.addEventListener("click", () => {
      selectSelected.textContent = optionText;
      closeAllSelect();
      localStorage.setItem("selectedPluginManifest", JSON.stringify(defaultForInstalled));
      renderConfigEditor(renderer, defaultForInstalled, installedPlugin?.uses[0].with);
    });

    selectItems.appendChild(optionDiv);
  });

  selectSelected.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllSelect();
    selectItems.classList.toggle(STRINGS.SELECT_HIDE);
    selectSelected.classList.toggle(STRINGS.SELECT_ARROW_ACTIVE);
  });

  updateGuiTitle(`Select a Plugin`);
}
