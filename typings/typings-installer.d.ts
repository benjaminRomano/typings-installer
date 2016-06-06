interface InstallOptions {
	save?: boolean;
}

interface ITypingInstaller {
    init(): Thenable<void> | Promise<void>;
    displayName: string;
}