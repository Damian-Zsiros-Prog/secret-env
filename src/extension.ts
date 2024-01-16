import * as vscode from "vscode";
import * as dotenv from "dotenv";

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
  let originalContent: { [key: string]: string } = {};
  let disposable = vscode.commands.registerCommand(
    "secret-env.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from Secret Env!");
    }
  );
  let hideEnvVariables = vscode.commands.registerCommand(
    "secret-env.hide-env-variables",
    async () => {
      // Obtén todos los archivos .env en el espacio de trabajo del cliente
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const filePath = activeEditor.document.uri.fsPath;
          if (filePath.endsWith(".env")) {
            const fileContent = activeEditor.document.getText();
            originalContent[filePath] = fileContent;
            const maskedContent = fileContent.replace(/=.*/g, "=*");
            const fullRange = new vscode.Range(
              activeEditor.document.positionAt(0),
              activeEditor.document.positionAt(fileContent.length)
            );
            activeEditor.edit((editBuilder) => {
              editBuilder.replace(fullRange, maskedContent);
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  );

  let showEnvVariables = vscode.commands.registerCommand(
    "secret-env.show-env-variables",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        const filePath = activeEditor.document.uri.fsPath;
        if (filePath.endsWith(".env")) {
          const fileContent = originalContent[filePath];
          if (fileContent) {
            const fullRange = new vscode.Range(
              activeEditor.document.positionAt(0),
              activeEditor.document.positionAt(
                activeEditor.document.getText().length
              )
            );
            activeEditor.edit((editBuilder) => {
              editBuilder.replace(fullRange, fileContent);
            });
          }
        }
      }
    }
  );
  context.subscriptions.push(disposable);
  context.subscriptions.push(hideEnvVariables);
  context.subscriptions.push(showEnvVariables);
}

export function deactivate() {}
