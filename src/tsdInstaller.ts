
import * as childProcess from 'child_process';
import * as utils from './utils';
import * as vscode from 'vscode';

export class TSDInstaller implements ITypingInstaller {
    displayName: string;

    constructor() {
        this.displayName = 'TSD (deprecated)';
    }

    public init(): Thenable<void> {
        return this.install();
    }

    private install(): Thenable<void> {

        let typingName = '';

        return this.search()
            .then(name => {
                typingName = name;
                return this.getInstallArgs();
            }).then(args => {
                return this.performInstall(typingName, args);
            }).then(() => {
                vscode.window.showInformationMessage('Typings for `' + typingName + '` installed successfully!');
            });
    }

    private getInstallArgs(): Thenable<string> {
        let options = ['save', 'no-save'];

        return vscode.window.showQuickPick(options).then(o => {
            if (o === options[0]) {
                return '--save';
            }

            return '';
        });
    }

    private performInstall(packageName: string, args: string): Promise<any> {
        let command = 'tsd install ' + packageName + ' ' + args;

        return new Promise<void>((resolve, reject) => {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('zero results') !== -1) {
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
        let command = 'tsd query ' + typingName;

        return new Promise<string[]>((resolve, reject) => {

            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout) => {
                if (error || stdout.toString().indexOf('zero results') !== -1) {
                    reject('No typings found for `' + typingName + '`');
                    return;
                }

                resolve(extractTypingNames(stdout.toString()));
            });
        });
    }
}

// For some reason this can't be called in child process callback when inside class...
function extractTypingNames(output: string): string[] {
    return output.split('\n')
        .filter(l => l.indexOf('/') !== -1)
        .map(l => l.split('/')[1].trim())
        .filter(t => t !== '');
}