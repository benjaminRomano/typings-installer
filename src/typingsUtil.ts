
import * as childProcess from 'child_process';
import * as vscode from 'vscode';

export function installPackage(packageName: string, options?: InstallOptions): Promise<string> {
	if (typeof packageName === 'undefined' || packageName === null) {
		return Promise.reject<string>('CANCELLED');
	}
	
	packageName = packageName.trim();
	
	if (packageName === '') {
		return Promise.reject<string>('CANCELLED');
	}

	let command = 'tsd install ' + packageName;
	
	if (options && options.save) {
		command += ' --save ';
	}
	
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
			if (error || stdout.toString().indexOf('zero results') !== -1) {
				reject('Typings for `' + packageName + '` could not be found');
			}
			
			resolve(packageName);
		});
	});
}
