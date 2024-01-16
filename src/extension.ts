import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let originalContent: { [key: string]: string } = {};

  vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
    for (const folder of e.added) {
      const envFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, "**/*.env"),
        null,
        100
      );
      for (const file of envFiles) {
        const document = await vscode.workspace.openTextDocument(file);
        const fileContent = document.getText();
        originalContent[document.fileName] = fileContent;
        const maskedContent = fileContent.replace(/=.*/g, "=*");
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fileContent.length)
        );
        const textEditor = await vscode.window.showTextDocument(document);
        textEditor.edit((editBuilder) => {
          editBuilder.replace(fullRange, maskedContent);
        });
      }
    }
  });

  // Registra el evento onDidOpenTextDocument
  vscode.workspace.onDidOpenTextDocument(async (document) => {
    if (document.fileName.endsWith(".env")) {
      const fileContent = document.getText();
      originalContent[document.fileName] = fileContent;
      const maskedContent = fileContent.replace(/=.*/g, "=*");
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fileContent.length)
      );
      const textEditor = await vscode.window.showTextDocument(document);
      textEditor.edit((editBuilder) => {
        editBuilder.replace(fullRange, maskedContent);
      });
    }
  });

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
  context.subscriptions.push(hideEnvVariables);
  context.subscriptions.push(showEnvVariables);
}

export function deactivate() {}
