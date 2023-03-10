import { App, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";


interface EmojiCmd {
  id: number;
  tag: string;
  emoji: string;
}

interface EmojiTitlerSettings {
  emojis: EmojiCmd[];
  tag_on: boolean;
}

const DEFAULT_SETTINGS: EmojiTitlerSettings = {
  emojis: [
    {id: 0, tag: "seedling", emoji: "🌱"}, 
    {id: 1, tag: "leaves", emoji: "🌿"}, 
    {id: 2, tag: "tree", emoji: "🌳"}, 
    {id: 3, tag: "done", emoji: "✅"}, 
    {id: 4, tag: "", emoji: ""},
  ],
  tag_on: true
};

export default class EmojiTitlerPlugin extends Plugin {
  settings: EmojiTitlerSettings;
  
  async onload() {
    await this.loadSettings();
    
    for (let i = 0; i < this.settings.emojis.length; i++) {
      this.addCommand({
        id: `insert-emoji_${i}`,
        name: `Insert emoji ${i} in title`,
        callback: async () => {
          await this.editEmojiTitle(this.settings.emojis[i-1]);
        },
      });
    }
    
    this.addSettingTab(new EmojiTitlerSettingTab(this.app, this));
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async editEmojiTitle(input_emoji: EmojiCmd) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) {
      return;
    }

    // check whether input emoji is in the title
    let newName = file.basename!;
    let emojiRegex = /^\p{Emoji}/u;
    
    
    
    for (let i = 0; i < this.settings.emojis.length; i++) {
      if (String.fromCodePoint(newName.codePointAt(0)!) == emoji)
    }
    
    const match = newName.match(emojiRegex);
    if (match) {
      newName = newName.replace(match[0], '');  
    }
    newName = `${emoji}${newName}`
    // @ts-ignore
    const newPath = file.getNewPathAfterRename(newName)
    await this.app.fileManager.renameFile(file, newPath);

    // check whether input tag is in the metadata

  }
  
  async saveSettings() {
    await this.saveData(this.settings);
  }
  
  async onunload() {
  }
}

class EmojiTitlerSettingTab extends PluginSettingTab {
  plugin: EmojiTitlerPlugin;
  
  constructor(app: App, plugin: EmojiTitlerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display(): void {
    const { containerEl } = this;
    
    containerEl.empty();
    containerEl.createEl("h2", { text: "Emoji Titler Settings" });
    new Setting(this.containerEl)
    .setDesc("Note! This plugin does not have default shortcuts set to prevent shortcut conflicts. Assign shortcuts for each emoji directly. A good option is to use Ctrl(Cmd)+Shift in combination with a number to assign each emoji, and the - key for deletion.")
    .addButton((cb) => {
      cb.setButtonText("Specify shortcuts")
      .setCta()
      .onClick(() => {
        // @ts-ignore
        app.setting.openTabById("hotkeys");
        // @ts-ignore
        const tab = app.setting.activeTab;
        tab.searchInputEl.value = `Emoji Titler:`;
        tab.updateHotkeyVisibility();
      });
    });
    
    containerEl.createEl("h2", { text: "Specify Emojis" });
    for (let i = 1; i <= 10; i++) {
      new Setting(containerEl)
      .setName(`emoji ${i}`)
      .addText((text) =>
      text
      .setPlaceholder(`emoji${i}`)
      .setValue(this.plugin.settings[`emoji${i}` as EmojiTitlerSettingsKey])
      .onChange(async (value) => {
        this.plugin.settings[`emoji${i}` as EmojiTitlerSettingsKey] = value;
        await this.plugin.saveSettings();
      })
      );
    }
  }
}