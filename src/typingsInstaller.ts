
import * as childProcess from 'child_process';
import * as utils from './utils';
import * as vscode from 'vscode';

export class TypingsInstaller implements ITypingInstaller {
    displayName: string;
    
    constructor() {
        this.displayName = 'Typings';
    }
    
    public init(): Thenable<string> {
        let options = ['install', 'search'];
        return vscode.window.showQuickPick(options).then((o) => {
            if (o === options[0]) {
                return this.install();
            } else {
                return this.search();
            }
        });
    }
    
    private install(): Thenable<string> {
        
        let typingName = "";
        var args = "";
        
        return utils.requestTypingName()
            .then((name) => {
                typingName = name;        
                return this.getAmbientArgs();
            }).then((a) => {
                args += a;
                return this.getSaveArgs();
            }).then((a) => {
                args += " " + a;
                return this.performInstall(typingName, args);
            }).then(() => {
                return vscode.window.showInformationMessage("Typings for `" + typingName + "` installed successfully!");
            });
    }
    
    private getAmbientArgs(): Thenable<string> {
        var options = ["ambient ", "no-ambient"];
        
        return vscode.window.showQuickPick(options).then((o) => {
            if (o === options[0]) {
                return "--ambient";
            }
            
            return "";
        });
    }
    
    private getSaveArgs(): Thenable<string> {
        var options = ["save", "no-save"];
        
        return vscode.window.showQuickPick(options).then((o) => {
            if (o === options[0]) {
                return "--save";
            }
            
            return "";
        });
    }
    
    private performInstall(packageName: string, args: string): Promise<any> {
        let command = 'typings install ' + packageName + " " + args;
        
        return new Promise<void>((resolve, reject) => {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('zero results') !== -1) {
                    reject('No typings found for `' + packageName + '`');
                    return;
                }
                
                resolve();
            });
        });
    }
    
    private search(): Thenable<string> {
        return utils.requestTypingName()
            .then(this.performSearch)
            .then(vscode.window.showQuickPick);
    }
    
    private performSearch(typingName: string) : Promise<vscode.QuickPickItem[]> {
        let command = 'typings search ' + typingName;
        
        return new Promise<vscode.QuickPickItem[]>((resolve, reject) => {
            
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout) => {
                console.log(this);
                if (error || stdout.toString().indexOf('zero results') !== -1) {
                    reject('No typings found for `' + typingName + '`');
                    return;
                }
                
                resolve(createTypingsQuickPickItems(stdout.toString()));
            });
        });
    }
}

function createTypingsQuickPickItems(output: string): vscode.QuickPickItem[] {
    let rows = output.split("\n");
    rows.splice(0,3);
    
    return rows.map(l => {
        let parts = l.match(/\S+/g);
        
        if (!parts) {
            return null;
        }
        
        var quickPickItem: vscode.QuickPickItem = {
            label: parts[0],
            description: "[" + parts[1] + "]" + "\t—\t" + parts[2]
        }
        
        return quickPickItem;
    }).filter(l => l !== null);
}
