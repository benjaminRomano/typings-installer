
import * as vscode from 'vscode';
import {TSDInstaller} from './tsdInstaller';
import {TypingsInstaller} from './typingsInstaller';

export function activate(context: vscode.ExtensionContext) {
	let disposables: vscode.Disposable[] = [];
    
    let tsdInstaller = new TSDInstaller();
    let typingsInstaller = new TypingsInstaller();
    
	
	disposables.push(vscode.commands.registerCommand('typingsInstaller.typings', () => {
        typingsInstaller.init()
            .then(null, errorHandler);
	}));
    
	disposables.push(vscode.commands.registerCommand('typingsInstaller.TSD', () => {
        tsdInstaller.init()
            .then(null, errorHandler);
	}));

	context.subscriptions.concat(disposables);
    
}

function errorHandler(error: any): void {
    if (!error) {
        return;
    }
    vscode.window.showErrorMessage(error);
}
