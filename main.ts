import { App, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import {Notice} from "obsidian";

interface EmojiCmd {
  id: number;
  name: string;
  emoji: string;
}

interface EmojiTitlerSettings {
  emojis: EmojiCmd[];
  tag_on: boolean;
}

const DEFAULT_SETTINGS: EmojiTitlerSettings = {
  emojis: [
    {id: 0, name: "seedling", emoji: "🌱"}, 
    {id: 1, name: "leaves", emoji: "🌿"}, 
    {id: 2, name: "tree", emoji: "🌳"}, 
    {id: 3, name: "done", emoji: "✅"}, 
    {id: 4, name: "", emoji: ""},
  ],
  tag_on: true
};

export default class EmojiTitlerPlugin extends Plugin {
  settings: EmojiTitlerSettings;
  
  async onload() {
    await this.loadSettings();
    for (let i = 0; i < this.settings.emojis.length; i++) {
      this.addCommand(this.getInsertCmd(i));
    }
    this.addSettingTab(new EmojiTitlerSettingTab(this.app, this));
  }
  
  async loadSettings() {
    

    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    new Notice(`loadSettings : ${this.settings.emojis[0].emoji}`); //##########################################################/////////////////////////////////////////////////////////////
  }
  
  getInsertCmd(index: number) {
    return {
      id: `insert-emoji-${index}`,
      name: `Insert emoji ${index} in title`,
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
    let newNameArr = [...newName];
    let emojiRegex = /^\p{Emoji}/u;
    
    // if the same emoji exists in the title, just remove it.
    // String.fromCodePoint(newName.codePointAt(0)!) == input_emoji.emoji
    // i.join('')
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
  EmojiSettings: Setting[] = [];
  constructor(app: App, plugin: EmojiTitlerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display(): void {
    new Notice('hell11o');//##########################################################/////////////////////////////////////////////////////////////
    const { containerEl } = this;
    
    // Title & Shortcut button
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

    // add button
    new Setting(this.containerEl) 
    .setDesc("Add new emoji setting / Delete the last one")
    .addButton((cb) => {
      cb.setIcon("plus")
      .setCta()
      .onClick(() => {
        const newIndex = this.plugin.settings.emojis.length;
        this.plugin.settings.emojis.push({id: newIndex, name: "", emoji: ""});
        this.addEmojiSetting(newIndex);
        this.plugin.addCommand(this.plugin.getInsertCmd(newIndex));
      });
    })
    // delete button
    .addButton((cb) => {
      cb.setIcon("minus")
      .onClick(() => {
        new Notice(`hello`)
        console.log(`asdasdasd`)
        const index = this.plugin.settings.emojis.length
        // new Notice(`delete insrt-emoji${index}-title`)
        new Notice(`hello11`)
        const removedEmoji = this.plugin.settings.emojis.pop()!
        new Notice(`hello33`)

        const removedEmojiSet = this.EmojiSettings.pop()!;
        new Notice(`hello44`)
        // removedEmojiSet.controlEl.remove()
        // removedEmojiSet.
        
        this.containerEl.removeChild(removedEmojiSet.settingEl);

        new Notice(`hello55`)
        new Notice(`delete insrt-emoji${removedEmoji.id}-title1111`)
        this.plugin.app.commands.removeCommand(
          `${this.plugin.manifest.id}:${this.plugin.getInsertCmd(removedEmoji.id)['id']}`
        )
        new Notice(`delete insrt-emoji${removedEmoji.id}-title`)
        
        

        // this.containerEl.removeChild(t);
        // this.EmojiSettings.push
        // ;
        // this.plugin.save_settings();
        // this.display();
      });
    });


    for (let i = 0; i < this.plugin.settings.emojis.length; i++) {
      this.addEmojiSetting(i)
    }
  }
  
  async addEmojiSetting(newIndex: number) {
    const setting = new Setting(this.containerEl)
      .setName(`emoji ${newIndex}`)
      .addText((text) =>
        text
        .setPlaceholder(`emoji ${newIndex}`)
        .setValue(this.plugin.settings.emojis[newIndex].emoji)
        .onChange(async (value) => {
          this.plugin.settings.emojis[newIndex].emoji = value;
          await this.plugin.saveSettings();
        })
      );
    // register on setting list
    this.EmojiSettings.push(setting);
  }
}
