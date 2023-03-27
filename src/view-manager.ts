// source: https://github.com/HyeonseoNam/auto-classifier/blob/main/src/view-manager.ts
import { App, MarkdownView, Editor, FrontMatterCache } from "obsidian";

export class ViewManager {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async getSelection(editor?: Editor): Promise<string | null> {
        if (editor) {
            return editor.getSelection();
        }
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            return activeView.editor.getSelection();
        }
        return null;
    }

    async getTitle(): Promise<string | null> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            return activeView.file.basename;
        }
        return null;
    }

    async getFrontMatter(): Promise<string | null> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            const file = activeView.file;
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter as Partial<FrontMatterCache>;
            if (frontmatter?.position) {
                delete frontmatter.position;
            }
            return JSON.stringify(frontmatter);
        }
        return null;
    }

    async getContent(): Promise<string | null> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            // delete frontmatter
            let content = activeView.getViewData();
            const file = activeView.file;
            const frontmatter: FrontMatterCache | undefined = this.app.metadataCache.getFileCache(file)?.frontmatter;
            if (frontmatter) {
                content = content.split('---').slice(2).join('---');
            }
            return content;
        }
        return null;
    }

    async getTags(filterRegex?: string): Promise<string[] | null> {
        //@ts-ignore
        const tagsDict = this.app.metadataCache.getTags();
        let tags = Object.keys(tagsDict);
        if (!tags || tags.length == 0) return null;
        // remove #
        tags = tags.map((tag) => tag.replace(/^#/, ''));
        // filter
        if (filterRegex) {
            return tags.filter((tag) => RegExp(filterRegex).test(tag));
        }
        return tags;
    }

    async insertAtFrontMatter(key: string, value: string, overwrite = false): Promise<void> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        if (activeView) {
            const file = activeView.file;
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter = frontmatter || {};

                if (frontmatter[key] && !overwrite) {
                    // add value as list element if exist
                    if (Array.isArray(frontmatter[key])) {
                        frontmatter[key].push(value);
                    } else {
                        frontmatter[key] = [frontmatter[key], value];
                    }
                } else {
                    // overwrite
                    frontmatter[key] = value;
                }
            });
        }
    }

    async insertAtTitle(value: string, overwrite = false): Promise<void> {
        const file = this.app.workspace.getActiveFile();
        if (!file) return; 
        let newName = file.basename;
        if (overwrite) {
            newName = `${value}`;
        } else {
            newName = `${newName} ${value}`;
        }
        newName = newName.replace(/[\"\/<>:\|?\"]/g, ''); // for window file name
        // @ts-ignore
        const newPath = file.getNewPathAfterRename(newName)
        await this.app.fileManager.renameFile(file, newPath);
    }

    async insertAtCursor(value: string, overwrite = false): Promise<void> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        let tag = ` #${value} `;
        if (activeView) {
            const editor = activeView.editor;
            const selection = editor.getSelection();
            if (selection && !overwrite) {
                // replace selection
                editor.setSelection(editor.getCursor('to'));
            }
            // overwrite
            editor.replaceSelection(tag);
        }
    }

}