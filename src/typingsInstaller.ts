
import * as childProcess from 'child_process';
import * as utils from './utils';
import * as vscode from 'vscode';

export class TypingsInstaller implements ITypingInstaller {
    displayName: string;

    constructor() {
        this.displayName = 'Typings';
    }

    public init(): Thenable<void> {
        return this.install();
    }

    private install(): Thenable<void> {

        let typingName = '';
        let args = '';

        return this.search()
            .then(name => {
                typingName = name;
                return this.getGlobalArgs();
            }).then(a => {
                args += a;
                return this.getSaveArgs();
            }).then(a => {
                args += ' ' + a;
                return this.performInstall(typingName, args);
            }).then(() => {
                vscode.window.showInformationMessage('Typings for `' + typingName + '` installed successfully!');
            });
    }

    private getGlobalArgs(): Thenable<string> {
        let options = ['global ', 'no-global'];

        return vscode.window.showQuickPick(options).then(o => {
            if (o === options[0]) {
                return '--global';
            }

            return '';
        });
    }

    private getSaveArgs(): Thenable<string> {
        let options = ['save', 'no-save'];

        return vscode.window.showQuickPick(options).then(o => {
            if (o === options[0]) {
                return '--save';
            }

            return '';
        });
    }

    private performInstall(packageName: string, args: string): Promise<any> {
        let command = 'typings install ' + packageName + ' ' + args;

        return new Promise<void>((resolve, reject) => {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout) => {
                if (error || stdout.toString().indexOf('ERR!') !== -1) {
                    reject('Failed to install typings for `' + packageName + '`');
                    return;
                }

                resolve();
            });
        });
    }

    private search(): Thenable<string> {
        return utils.requestTypingName()
            .then(this.performSearch)
            .then(vscode.window.showQuickPick)
            .then(name => {
                if (!name) {
                    return Promise.reject<string>(null);
                }

                return name;
            });
    }

    private performSearch(typingName: string): Promise<string[]> {
        let command = 'typings search ' + typingName;

        return new Promise<string[]>((resolve, reject) => {

            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout) => {
                if (error || stdout.toString().indexOf('No results') !== -1) {
                    reject('No typings found for `' + typingName + '`');
                    return;
                }

                resolve(createTypingsQuickPickItems(stdout.toString()));
            });
        });
    }
}

function createTypingsQuickPickItems(output: string): string[] {
    let rows = output.split('\n');
    rows.splice(0, 3);

    return rows.map(l => {
        let parts = l.match(/\S+/g);

        if (!parts) {
            return null;
        }

        return parts[1] + '~' + parts[0];
    }).filter(l => l !== null);
}