import { App, PluginSettingTab, Setting } from "obsidian";
import type EmojiTitlerPlugin from "./main";

export class EmojiTitlerSettingTab extends PluginSettingTab {
    plugin: EmojiTitlerPlugin;

    constructor(app: App, plugin: EmojiTitlerPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
    
    display(): void {
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
      
      // tag toggle
      new Setting(containerEl)
      .setName("Use tag together")
      .addToggle((toggle) =>
          toggle
              .setValue(this.plugin.settings.tag_on)
              .onChange(async (value) => {
                this.plugin.settings.tag_on = value;
                await this.plugin.saveSettings();
                this.display();
              })
      );
      // tag key setting
      if (this.plugin.settings.tag_on) {
        new Setting(this.containerEl)
        .setName('key')
        .setDesc('The tag corresponding to each emoji will be placed in the key of the FrontMatter.')
        .setClass('setting-item-child')
        .addText((text) =>
          text
          .setPlaceholder('key')
          .setValue(this.plugin.settings.tag_key)
          .onChange(async (value) => {
            this.plugin.settings.tag_key = value;
            await this.plugin.saveSettings();
          })
        );
      }

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
          this.display();
        });
      })
      // delete button
      .addButton((cb) => {
        cb.setIcon("minus")
        .onClick(() => {
          const removedEmoji = this.plugin.settings.emojis.pop();
          if (removedEmoji) {
            this.plugin.app.commands.removeCommand(
                `${this.plugin.manifest.id}:${this.plugin.getInsertCmd(removedEmoji.id, true)}`);
            this.display();
                
          }
        });
      });
      
      // add emoji setting components
      for (let i = 0; i < this.plugin.settings.emojis.length; i++) {
        this.addEmojiSetting(i)
      }
    }
    
    addEmojiSetting(newIndex: number) {
      const setting = new Setting(this.containerEl)
        .setName(`emoji ${newIndex}`)
        .setClass('setting-item-child')
        .setClass('narrow-input')
        .addText((text) =>
          text
          .setPlaceholder(`emoji ${newIndex}`)
          .setValue(this.plugin.settings.emojis[newIndex].emoji)
          .onChange(async (value) => {
            this.plugin.settings.emojis[newIndex].emoji = value;
            this.editCommandName(newIndex);
            await this.plugin.saveSettings();
          })
        )
      //
      if (this.plugin.settings.tag_on) {
        setting.addText((text) =>
          text
          .setPlaceholder(`tag`)
          .setValue(this.plugin.settings.emojis[newIndex].name)
          .onChange(async (value) => {
            this.plugin.settings.emojis[newIndex].name = value;
            await this.plugin.saveSettings();
          })
        );
      }
    }

    editCommandName(index: number) {
      const targetEmoji = this.plugin.settings.emojis[index];
      const targetCommand = this.plugin.getInsertCmd(index);
      let newName = targetCommand.name;
      if (!newName.includes(this.plugin.manifest.name)) {
        newName = `${this.plugin.manifest.name}: ${newName}`;
      }
      const targetCommandId = `${this.plugin.manifest.id}:${this.plugin.getInsertCmd(targetEmoji.id, true)}`
      this.plugin.app.commands.commands[targetCommandId].name = newName;
    }
  }
  