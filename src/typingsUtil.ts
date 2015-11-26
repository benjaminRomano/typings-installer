
import * as childProcess from 'child_process';
import * as Q from 'q';
import * as vscode from 'vscode';

export function installPackage(packageName: string, options?: InstallOptions): Q.Promise<string> {
	var deferred = Q.defer<string>();
	
	if(typeof packageName === 'undefined') {
		deferred.reject("CANCELLED");
		return deferred.promise;
	}
	
	packageName = packageName.trim();
	
	if (packageName === '') {
		deferred.reject("CANCELLED");
		return deferred.promise;
	}
	
	//Package name cannot contain spaces
	if(packageName.indexOf(' ') !== -1) {
		deferred.reject("Package name cannot contain spaces");
		return deferred.promise;
	}
	
	var command = "tsd install " + packageName;
	
	if(options && options.save) {
		command += " --save ";
	}

	childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout, stderr) {
		if (error || stdout.toString().indexOf('zero results') !== -1) {
			deferred.reject('Typings for `' + packageName + '` could not be found');
			return;	
		}
		
		deferred.resolve(packageName);
	});
	
	return deferred.promise;
}
