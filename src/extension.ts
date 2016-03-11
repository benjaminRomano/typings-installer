
import * as vscode from 'vscode';
import {TSDInstaller} from './tsdInstaller';
import {TypingsInstaller} from './typingsInstaller';

let installers = [
    new TSDInstaller(),
    new TypingsInstaller()
];

export function activate(context: vscode.ExtensionContext) {
	let disposables: vscode.Disposable[] = [];
	
	disposables.push(vscode.commands.registerCommand('typingsInstaller.getTypings', () => {
		getTypings();
	}));

	context.subscriptions.concat(disposables);
    
}

function getTypings(): void {
    
    var displayNames = installers.map(i=> i.displayName);
    
    vscode.window.showQuickPick(displayNames).then(d => {
        var installer = installers.filter(i => d === i.displayName)[0];
        return installer.init();
    }).then(() => {}, (error) => {
        
        if (error === 'CANCELLED') {
            return;
        }
        
        vscode.window.showErrorMessage(error);
    });
}
