import * as vscode from 'vscode';

export function requestTypingName(): Thenable<string> {
	return vscode.window.showInputBox({ 
		prompt: 'Enter typings name',
		placeHolder: 'e.g. node' 
	}).then((typingName) => {
        if (typeof typingName === 'undefined' || typingName === null) {
            return Promise.reject<string>('CANCELLED');
        }
        
        typingName = typingName.trim();
        
        if (typingName === '') {
            return Promise.reject<string>('CANCELLED');
        }

        return typingName;
    });
}
