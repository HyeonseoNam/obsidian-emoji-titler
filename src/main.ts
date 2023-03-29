import { Plugin, TFile } from "obsidian";
import { EmojiTitlerSettingTab } from "src/settings";
import { ViewManager } from "src/view-manager";

interface EmojiCmd {
  id: number;
  name: string; // TODO: will be added to frontmatter
  emoji: string;
}

interface EmojiTitlerSettings {
  emojis: EmojiCmd[];
  tag_on: boolean;
  tag_key: string;
}

const DEFAULT_SETTINGS: EmojiTitlerSettings = {
  emojis: [
    {id: 0, name: "seedling", emoji: "🌱"}, 
    {id: 1, name: "leaves", emoji: "🌿"}, 
    {id: 2, name: "tree", emoji: "🌳"}, 
    {id: 3, name: "done", emoji: "✅"}, 
    {id: 4, name: "", emoji: ""},
  ],
  tag_on: false,
  tag_key: 'status'
};

export default class EmojiTitlerPlugin extends Plugin {
  settings: EmojiTitlerSettings;
  viewManager = new ViewManager(this.app);

  async onload() {
    await this.loadSettings();
    for (let i = 0; i < this.settings.emojis.length; i++) {
      this.addCommand(this.getInsertCmd(i));
    }
    this.addSettingTab(new EmojiTitlerSettingTab(this.app, this));
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  getInsertCmd(index: number) {
    return {
      id: `insert-emoji-${index}`,
      name: `Insert emoji ${index} (${this.settings.emojis[index].emoji}) in title`,
      callback: async () => {
        await this.editEmojiTitle(this.settings.emojis[index]);
      },
    }
  }

  async editEmojiTitle(input_emoji: EmojiCmd) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) {
      return;
    }

    // check whether input emoji is in the title
    let newName = file.basename
    const newNameArr = [...newName];
    
    // if the same emoji exists in the title, just remove it.
    if (newNameArr[0] == input_emoji.emoji) {
      newNameArr.shift();
      newName = newNameArr.join('');
    } else {
      // delete if current 
      for (let i = 0; i < this.settings.emojis.length; i++) {
        if (newNameArr[0] == this.settings.emojis[i].emoji) {
          newNameArr.shift();
          newName = newNameArr.join('');
          break;
        }
      }
      newName = `${input_emoji.emoji}${newName}`
    }
    // @ts-ignore
    const newPath = file.getNewPathAfterRename(newName)
    await this.app.fileManager.renameFile(file, newPath);

    // TODO: check whether input tag is in the metadata
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
  }
  
  async onunload() {
  }
}
