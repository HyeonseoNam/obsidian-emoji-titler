import { App, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import { basename, join } from 'path';

type EmojiTitlerSettingsKey = "emoji1" | "emoji2" | "emoji3" | "emoji4" | "emoji5" | "emoji6" | "emoji7" | "emoji8" | "emoji9" | "emoji10";
interface EmojiTitlerSettings {
  emoji1: string;
  emoji2: string;
  emoji3: string;
  emoji4: string;
  emoji5: string;
  emoji6: string;
  emoji7: string;
  emoji8: string;
  emoji9: string;
  emoji10: string;
}

const DEFAULT_SETTINGS: EmojiTitlerSettings = {
  emoji1: "🌱", 
  emoji2: "🌿",
  emoji3: "🌳",
  emoji4: "📝",
  emoji5: "📒",
  emoji6: "📙",
  emoji7: "📚", 
  emoji8: "💎",
  emoji9: "👀",
  emoji10: "✅",
};

export default class EmojiTitlerPlugin extends Plugin {
  settings: EmojiTitlerSettings;
  emojiRegex = /^\p{Emoji}/u;
  
  async onload() {
    await this.loadSettings();
    
    for (let i = 1; i <= 10; i++) {
      this.addCommand({
        id: `insrt-emoji${i}-title`,
        name: `Insert emoji ${i} in title`,
        callback: async () => {
          await this.editEmojiTitle(this.settings[`emoji${i}` as EmojiTitlerSettingsKey]);
        },
      });
    }
    
    this.addCommand({
      id: 'delete-emoji-title',
      name: 'delete emoji from the title',
      callback: async () => {
        await this.editEmojiTitle('');
      },
    });
    
    this.addSettingTab(new EmojiTitlerSettingTab(this.app, this));
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async editEmojiTitle(emoji: string) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) {
      return;
    }
    
    const oldPath = file?.path!;
    const ext = file?.extension!;
    let basenameWithoutExt = basename(oldPath, `.${ext}`);
    
    const match = basenameWithoutExt.match(this.emojiRegex);
    if (match) {
      basenameWithoutExt = basenameWithoutExt.replace(match[0], '');  
    }
    const newPath = join(file.parent.path, `${emoji}${basenameWithoutExt}.${ext}`);
    await this.app.fileManager.renameFile(file, newPath);
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
        app.setting.openTabById("hotkeys");
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