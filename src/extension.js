const vscode = require('vscode')

/** @type {vscode.Uri | undefined} */
let $previouslyOpened = undefined

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(async editor => {
			if (!editor) {
				return
			}

			try {
				await onDidChangeActiveTextEditor(editor)
			} catch (error) {
				console.error(error)
			}
		}),
	)
}

/**
 * @param {vscode.TextEditor} editor
 */
function onDidChangeActiveTextEditor(editor) {
	const previouslyOpened = $previouslyOpened
	$previouslyOpened = editor.document.uri

	if (isInNodeModules(editor.document.uri)) {
		return
	} else if (!previouslyOpened || !isInNodeModules(previouslyOpened)) {
		return
	}

	const config = vscode.workspace.getConfiguration()
	const excluded = config.inspect('files.exclude')?.workspaceValue ?? {}
	return config
		.update(
			'files.exclude',
			{
				...excluded,
				'**/node_modules': true,
			},
			vscode.ConfigurationTarget.Workspace,
		)
		.then(() => config.update('files.exclude', excluded, vscode.ConfigurationTarget.Workspace))
}

/**
 * @param {vscode.Uri} uri
 * @returns {boolean}
 */
function isInNodeModules(uri) {
	const folder = vscode.workspace.getWorkspaceFolder(uri)

	if (!folder) {
		console.log('could not find folder')
		return false
	}

	const relative = uri.fsPath.substring(folder.uri.fsPath.length)
	console.log('AAAA', relative)
	return /(^|\/)node_modules(\/|$)/.test(relative)
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
}
