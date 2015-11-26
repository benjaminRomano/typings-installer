
import * as vscode from 'vscode';
import * as Q from 'q';
import * as typingsUtil from './typingsUtil';

export function activate(context: vscode.ExtensionContext) {
	var disposable = vscode.commands.registerCommand('typingsInstaller.getTypings', (args) => {
		getTypings();
	});
	
	context.subscriptions.push(disposable);
	
	disposable = vscode.commands.registerCommand('typingsInstaller.getTypingsSave', (args) => {
		getTypings({ save: true });
	});
	
	context.subscriptions.push(disposable);
}

function getTypings(options?: InstallOptions): void {
	options = options || {};
	
	if (typeof vscode.workspace.rootPath === 'undefined' || vscode.workspace.rootPath === null) {	
		vscode.window.showErrorMessage("No project currently open");
		return;
	}
	
	requestPackageName()
		.then(function(packageName) {
			return typingsUtil.installPackage(packageName, options);
		}).then(function(packageName) {
			vscode.window.showInformationMessage('Typings for `' + packageName + '` installed!');
		}).catch(function(error) {
			if (error === 'CANCELLED') {
				return;
			}
			
			vscode.window.showErrorMessage(error);
		});
}

//Wraps vscode promise with Q promise
function requestPackageName(): Q.Promise<string> {
	var deferred = Q.defer<string>();
	
	vscode.window.showInputBox({ 
		prompt: "Enter package name",
		placeHolder: "e.g. node" 
	}).then(function(packageName) {
		return deferred.resolve(packageName);
	}, function(error) {
		return deferred.reject(error);
	});
	
	return deferred.promise;
}