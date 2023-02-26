import { App, Plugin, Notice, TAbstractFile, PluginSettingTab, Setting, TFile } from "obsidian";
import { basename, join } from 'path';

type EmojiTitlerSettingsKey = "emoji1" | "emoji2" | "emoji3" | "emoji4" | "emoji5" | "emoji6" | "emoji7" | "emoji8" | "emoji9";
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
}

const DEFAULT_SETTINGS: EmojiTitlerSettings = {
  emoji1: "🌱", 
  emoji2: "🌿",
  emoji3: "🌳",
  emoji4: "📝",
  emoji5: "📒",
  emoji6: "📙",
  emoji7: "📚", 
  emoji8: "👀",
  emoji9: "✅",
};

export default class EmojiTitlerPlugin extends Plugin {
  settings: EmojiTitlerSettings;
  emojiRegex = /^\p{Emoji}/u;

  async onload() {
    await this.loadSettings();

    for (let i = 1; i < 10; i++) {
      this.addCommand({
        id: `insrt-emoji${i}-title`,
        name: `insert emoji${i} in the title`,
        callback: async () => {
          await this.editEmojiTitle(this.settings[`emoji${i}` as EmojiTitlerSettingsKey]);
        },
        hotkeys: [
          {
            modifiers: ['Ctrl', 'Shift'],
            key: `${i}`,
          },
        ],
      });
    }

    this.addCommand({
      id: 'delete-emoji-title',
      name: 'delete emoji from the title',
      callback: async () => {
        await this.editEmojiTitle('');
      },
      hotkeys: [
        {
          modifiers: ['Ctrl', 'Shift'],
          key: '-',
        },
      ],
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
  
	  for (let i = 1; i < 10; i++) {
		new Setting(containerEl)
		  .setName(`Emoji ${i}`)
		  .setDesc(`set the emoji to be assigned to number ${i}`)
		  .addText((text) =>
			text
			  .setPlaceholder(`Emoji ${i}`)
			  .setValue(this.plugin.settings[`emoji${i}` as EmojiTitlerSettingsKey])
			  .onChange(async (value) => {
				this.plugin.settings[`emoji${i}` as EmojiTitlerSettingsKey] = value;
				await this.plugin.saveSettings();
			  })
		  );
	  }
	}
  }