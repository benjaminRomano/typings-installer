interface InstallOptions {
	save?: boolean;
}

interface ITypingInstaller {
    init(): Thenable<any> | Promise<any>;
    displayName: string;
}