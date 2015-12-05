
import * as vscode from 'vscode';
import * as typingsUtil from './typingsUtil';

export function activate(context: vscode.ExtensionContext) {
	let disposables: vscode.Disposable[] = [];
	
	disposables.push(vscode.commands.registerCommand('typingsInstaller.getTypings', () => {
		getTypings();
	}));
	
	disposables.push(vscode.commands.registerCommand('typingsInstaller.getTypingsSave', () => {
		getTypings({ save: true });
	}));
	
	context.subscriptions.concat(disposables);
}

function getTypings(options?: InstallOptions): void {
	options = options || {};
	
	if (typeof vscode.workspace.rootPath === 'undefined' || vscode.workspace.rootPath === null) {	
		vscode.window.showErrorMessage('No project currently open');
		return;
	}
	
	requestPackageName()
		.then(function(packageName) {
			return typingsUtil.installPackage(packageName, options);
		}).then(function(packageName) {
			vscode.window.showInformationMessage('Typings for `' + packageName + '` installed!');
		}, function(error) {
			if (error === 'CANCELLED') {
				return;
			}
			
			vscode.window.showErrorMessage(error);
		});
}

function requestPackageName(): Thenable<string> {
	return vscode.window.showInputBox({ 
		prompt: 'Enter package name',
		placeHolder: 'e.g. node' 
	});
}